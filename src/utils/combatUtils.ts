import { Creature } from '../creatures/index';
import { terrainHeightAt } from '../maps/mapRenderer';
import { chebyshevDistanceRect, getCreatureDimensions, isInBackArc } from './geometry';
import { calculateCombatRoll, calculateDamageRoll, calculateRangedDamageRoll, rollShieldBlock } from './dice';
import { BaseValidationResult } from './types';
import { validateCombat } from '../validation/combat';
// Import equipment system
import { EquipmentSystem } from '../items/equipment';
import { Weapon } from '../items/types';

// --- Combat Utilities Module ---

// Re-export commonly used types
export interface CombatResult {
  success: boolean;
  message: string;
  damage: number;
  targetDefeated: boolean;
  toHitMessage?: string;
  damageMessage?: string;
  shieldBlockMessage?: string;
}

export interface CombatValidationResult extends BaseValidationResult {}

// --- Combat Calculation Utilities ---

/**
 * Calculate targets in range for a creature
 */
export function calculateTargetsInRange(
  attacker: Creature,
  allCreatures: Creature[]
): Set<string> {
  const equipment = new EquipmentSystem(attacker.equipment);
  const rangeTiles = equipment.getAttackRange();
  const attackerDims = getCreatureDimensions(attacker.size);
  const inRange = new Set<string>();
  
  for (const target of allCreatures) {
    if (attacker.isFriendlyTo(target)) continue; // Same faction
    if (target.isDead()) continue; // Skip dead creatures
    
    const targetDims = getCreatureDimensions(target.size);
    const dist = chebyshevDistanceRect(
      attacker.x, attacker.y, attackerDims.w, attackerDims.h,
      target.x, target.y, targetDims.w, targetDims.h
    );
    
    if (dist <= rangeTiles) {
      inRange.add(target.id);
    }
  }
  
  return inRange;
}

// --- Combat Execution Utilities ---

/**
 * Calculate damage based on dice rolls and armor
 */
export function calculateDamage(diceRolls: number[], armorValue: number): number {
  return diceRolls.filter(roll => roll >= armorValue).length;
}

/**
 * Determine if attack hits based on combat rolls and agility
 */
export function determineHit(
  attackerRoll: number,
  defenderRoll: number,
  attackerAgility: number,
  defenderAgility: number,
  attackerHasShield: boolean,
  defenderHasShield: boolean
): boolean {
  if (attackerRoll > defenderRoll) return true;
  if (attackerRoll < defenderRoll) return false;
  
  // Tie - check agility
  if (attackerAgility > defenderAgility) return true;
  if (attackerAgility < defenderAgility) return false;
  
  // Agility tie - check shields
  if (defenderHasShield && !attackerHasShield) return false;
  return true; // Attacker wins if both have shields or neither has shield
}

/**
 * Check if attack is from behind (for back attack bonus)
 * A back attack occurs when the attacker is positioned behind the target
 * The back arc consists of the 3 positions behind the target (opposite and adjacent)
 */
export function isBackAttack(attacker: Creature, target: Creature): boolean {
  // Check if attacker is positioned in the back arc
  const isBack = isInBackArc(target.x, target.y, target.facing, attacker.x, attacker.y);
  
  // Debug logging
  console.log(`Back attack check: ${attacker.name} at (${attacker.x},${attacker.y}) attacking ${target.name} at (${target.x},${target.y})`);
  console.log(`  Target facing: ${target.facing}, Is back attack: ${isBack}`);
  
  return isBack;
}

/**
 * Check if a shield blocks an attack
 * @param shieldBlockValue The block value of the shield (1-6)
 * @returns Object with block result and message
 */
export function checkShieldBlock(shieldBlockValue: number): { blocked: boolean; message: string } {
  const roll = rollShieldBlock();
  const blocked = roll >= shieldBlockValue;
  
  const message = blocked 
    ? `Shield blocks! (${roll} >= ${shieldBlockValue})`
    : `Shield fails to block (${roll} < ${shieldBlockValue})`;
    
  return { blocked, message };
}

/**
 * Execute a combat attack between two creatures
 */
export function executeCombat(attacker: Creature, target: Creature, allCreatures: Creature[], mapDefinition?: any): CombatResult {
  // Face the target when attacking
  attacker.faceTowards(target.x, target.y);
  
  // Use consolidated validation
  const validation = validateCombat(attacker, target, allCreatures, mapDefinition);
  
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.reason || `${attacker.name} cannot attack ${target.name}.`,
      damage: 0,
      targetDefeated: false
    };
  }

  // Check if this is a ranged attack
  const equipment = new EquipmentSystem(attacker.equipment);
  if (equipment.hasRangedWeapon()) {
    return executeRangedCombat(attacker, target, allCreatures);
  }
  
  return executeMeleeCombat(attacker, target, allCreatures, mapDefinition);
}

/**
 * Execute ranged combat
 */
function executeRangedCombat(attacker: Creature, target: Creature, allCreatures: Creature[]): CombatResult {
  // Initialize equipment systems
  const attackerEquipment = new EquipmentSystem(attacker.equipment);
  const targetEquipment = new EquipmentSystem(target.equipment);
  
  // Calculate ranged attack roll (2d6 + ranged attribute)
  const rangedRoll = calculateCombatRoll(attacker.ranged);
  
  // Ranged attacks hit on 10 or greater
  const hit = rangedRoll >= 10;
  
  // Consume action (regardless of hit or miss)
  attacker.remainingActions -= 1;
  
  // Reset actions for other creatures in the same group that have already acted
  attacker.resetGroupActions(allCreatures);
  
  const toHitMessage = `${attacker.name} makes a ranged attack at ${target.name}: ${rangedRoll} (2d6 + ${attacker.ranged} ranged)`;
  
  if (!hit) {
    return {
      success: true,
      message: `${toHitMessage} - Miss! (needs 10+)`,
      toHitMessage,
      damage: 0,
      targetDefeated: false
    };
  }
  
  // Check for shield blocking
  let shieldBlockMessage = '';
  let damage = 0;
  let targetDefeated = false;
  
  // Check if this is a back attack (shields can't block back attacks)
  const isBackAttackFromAttacker = isBackAttack(attacker, target);
  
  if (targetEquipment.hasShield(isBackAttackFromAttacker)) {
    const shieldBlockValue = targetEquipment.getShieldBlockValue(isBackAttackFromAttacker);
    const shieldResult = checkShieldBlock(shieldBlockValue);
    shieldBlockMessage = ` ${target.name}'s shield: ${shieldResult.message}`;
    
    if (shieldResult.blocked) {
      // Shield blocked the attack - no damage
      return {
        success: true,
        message: `${toHitMessage} - Hit!${shieldBlockMessage} - Attack blocked!`,
        toHitMessage,
        shieldBlockMessage,
        damage: 0,
        targetDefeated: false
      };
    }
  }
  
  // Calculate damage (weapon damage only, no strength)
  const weaponDamage = attackerEquipment.getWeaponDamage();
  const diceRolls = calculateRangedDamageRoll(weaponDamage);
  
  // Determine armor value
  const baseArmorValue = targetEquipment.getEffectiveArmor(target.naturalArmor);
  
  // Apply attacker's weapon armor modifier to target's armor
  const weaponArmorModifier = attackerEquipment.getWeaponArmorModifier();
  const armorValue = baseArmorValue + weaponArmorModifier;
  
  damage = calculateDamage(diceRolls, armorValue);
  
  // Apply damage using the proper method
  target.takeDamage(damage);
  
  // Check if target is defeated
  targetDefeated = target.isDead();
  
  // Generate damage message
  const damageMessage = `Damage: ${damage} [${diceRolls.join(',')}] vs armor ${armorValue}`;
  
  return {
    success: true,
    message: `${toHitMessage} - Hit!${shieldBlockMessage} ${damageMessage}`,
    toHitMessage,
    shieldBlockMessage,
    damageMessage,
    damage,
    targetDefeated
  };
}

/**
 * Execute melee combat
 */
function executeMeleeCombat(attacker: Creature, target: Creature, allCreatures: Creature[], mapDefinition?: any): CombatResult {
  // Calculate combat bonuses
  const attackerEquipment = new EquipmentSystem(attacker.equipment);
  const targetEquipment = new EquipmentSystem(target.equipment);
  let attackerBonus = attackerEquipment.getAttackBonus(attacker.combat, attacker.ranged);
  let defenderBonus = targetEquipment.getAttackBonus(target.combat, target.ranged);
  
  // Track modifiers for display
  const attackerModifiers: string[] = [];
  const defenderModifiers: string[] = [];
  
  // Add weapon combat modifier display for attacker
  const attackerWeapon = attackerEquipment.getMainWeapon();
  const attackerWeaponModifier = attackerWeapon instanceof Weapon ? (attackerWeapon.combatModifier ?? 0) : 
    (attackerWeapon ? 0 : -1); // Unarmed creatures get -1 modifier
  if (attackerWeaponModifier !== 0) {
    const modifierText = attackerWeaponModifier > 0 ? `+${attackerWeaponModifier}` : `${attackerWeaponModifier}`;
    attackerModifiers.push(`weapon ${modifierText}`);
  }
  
  // Add weapon combat modifier display for defender
  const defenderWeapon = targetEquipment.getMainWeapon();
  const defenderWeaponModifier = defenderWeapon instanceof Weapon ? (defenderWeapon.combatModifier ?? 0) : 
    (defenderWeapon ? 0 : -1); // Unarmed creatures get -1 modifier
  if (defenderWeaponModifier !== 0) {
    const modifierText = defenderWeaponModifier > 0 ? `+${defenderWeaponModifier}` : `${defenderWeaponModifier}`;
    defenderModifiers.push(`weapon ${modifierText}`);
  }
  
  // Check for back attack bonus
  // A back attack occurs when the creature started their turn behind the target AND is currently attacking from behind
  if (attacker.wasBehindTargetAtTurnStart(target) && isBackAttack(attacker, target)) {
    attackerBonus += 1;
    attackerModifiers.push("back attack +1");
    console.log(`Back attack detected: ${attacker.name} was behind ${target.name} at turn start and is attacking from behind!`);
  }
  
  // Check for elevation bonus (only for melee attacks)
  if (mapDefinition) {
    const attackerElevation = terrainHeightAt(attacker.x, attacker.y, mapDefinition);
    const targetElevation = terrainHeightAt(target.x, target.y, mapDefinition);
    
    // Attacker gets +1 bonus if they are 1 elevation higher than target
    if (attackerElevation === targetElevation + 1) {
      attackerBonus += 1;
      attackerModifiers.push("elevation +1");
      console.log(`Elevation bonus: ${attacker.name} is attacking from higher ground (+1 bonus)`);
    }
    
    // Defender gets +1 bonus if they are 1 elevation higher than attacker
    if (targetElevation === attackerElevation + 1) {
      defenderBonus += 1;
      defenderModifiers.push("elevation +1");
      console.log(`Elevation bonus: ${target.name} is defending from higher ground (+1 bonus)`);
    }
  }
  
  // Roll for combat
  const attackerRoll = calculateCombatRoll(attackerBonus);
  const defenderRoll = calculateCombatRoll(defenderBonus);
  
  // Check if attack hits
  const isBackAttackForHit = isBackAttack(attacker, target);
  const attackerHasShield = attackerEquipment.hasShield();
  const defenderHasShield = targetEquipment.hasShield(isBackAttackForHit);
  
  const hit = determineHit(
    attackerRoll,
    defenderRoll,
    attacker.agility,
    target.agility,
    attackerHasShield,
    defenderHasShield
  );
  
  // Generate to-hit message with modifiers
  const attackerModifierText = attackerModifiers.length > 0 ? ` (${attackerModifiers.join(', ')})` : '';
  const defenderModifierText = defenderModifiers.length > 0 ? ` (${defenderModifiers.join(', ')})` : '';
  const toHitMessage = `${attacker.name} attacks ${target.name}: ${attackerRoll}${attackerModifierText} vs ${defenderRoll}${defenderModifierText}`;
  
  // Consume action (regardless of hit or miss)
  attacker.remainingActions -= 1;
  
  // Reset actions for other creatures in the same group that have already acted
  attacker.resetGroupActions(allCreatures);
  
  if (!hit) {
    return {
      success: true,
      message: `${toHitMessage} - Miss!`,
      toHitMessage,
      damage: 0,
      targetDefeated: false
    };
  }
  
  // Check for shield blocking
  let shieldBlockMessage = '';
  let damage = 0;
  let targetDefeated = false;
  
  // Check if this is a back attack (shields can't block back attacks)
  const isBackAttackFromAttacker = isBackAttack(attacker, target);
  
  if (targetEquipment.hasShield(isBackAttackFromAttacker)) {
    const shieldBlockValue = targetEquipment.getShieldBlockValue(isBackAttackFromAttacker);
    const shieldResult = checkShieldBlock(shieldBlockValue);
    shieldBlockMessage = ` ${target.name}'s shield: ${shieldResult.message}`;
    
    if (shieldResult.blocked) {
      // Shield blocked the attack - no damage
      return {
        success: true,
        message: `${toHitMessage} - Hit!${shieldBlockMessage} - Attack blocked!`,
        toHitMessage,
        shieldBlockMessage,
        damage: 0,
        targetDefeated: false
      };
    }
  } else if (targetEquipment.hasShield(false) && isBackAttackFromAttacker) {
    shieldBlockMessage = ` ${target.name}'s shield: Cannot block back attack!`;
  }
  
  // Calculate damage
  const weaponDamage = attackerEquipment.getWeaponDamage();
  const diceRolls = calculateDamageRoll(attacker.strength, weaponDamage);
  
  // Determine armor value
  const baseArmorValue = targetEquipment.getEffectiveArmor(target.naturalArmor);
  
  // Apply attacker's weapon armor modifier to target's armor
  // Negative values reduce target armor (armor-piercing), positive values increase it
  const weaponArmorModifier = attackerEquipment.getWeaponArmorModifier();
  const armorValue = baseArmorValue + weaponArmorModifier;
  
  damage = calculateDamage(diceRolls, armorValue);
  
  // Apply damage using the proper method
  target.takeDamage(damage);
  
  // Check if target is defeated
  targetDefeated = target.isDead();
  
  // Generate damage message
  const damageMessage = `Damage: ${damage} [${diceRolls.join(',')}] vs armor ${armorValue}`;
  
  return {
    success: true,
    message: `${toHitMessage} - Hit!${shieldBlockMessage} ${damageMessage}`,
    toHitMessage,
    shieldBlockMessage,
    damageMessage,
    damage,
    targetDefeated
  };
}
