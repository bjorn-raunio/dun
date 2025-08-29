import { Creature } from '../creatures/index';
import { terrainHeightAt } from '../maps/mapRenderer';
import { chebyshevDistanceRect, getCreatureDimensions, isInBackArc } from './geometry';
import { calculateCombatRoll, calculateMeleeDamageRoll, calculateRangedDamageRoll, rollD6, isCriticalHit, isDoubleCritical } from './dice';
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
  const roll = rollD6();
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
  const rangedRollResult = calculateCombatRoll(attacker.ranged);
  const rangedRoll = rangedRollResult.total;
  
  // Check for double critical (ranged attacks can't have defender double criticals)
  const attackerDoubleCritical = isDoubleCritical(rangedRollResult.dice);
  
  // Ranged attacks hit on 10 or greater, but double criticals always hit
  const hit = attackerDoubleCritical || rangedRoll >= 10;
  
  // Consume action (regardless of hit or miss)
  attacker.remainingActions -= 1;
  
  // Reset actions for other creatures in the same group that have already acted
  attacker.resetGroupActions(allCreatures);
  
  const toHitMessage = attackerDoubleCritical 
    ? `${attacker.name} makes a ranged attack at ${target.name}: ${rangedRoll} (2d6 + ${attacker.ranged} ranged) (DOUBLE CRITICAL!) - AUTOMATIC HIT!`
    : `${attacker.name} makes a ranged attack at ${target.name}: ${rangedRoll} (2d6 + ${attacker.ranged} ranged)`;
  
  if (!hit) {
    return {
      success: true,
      message: `${toHitMessage} - Miss! (needs 10+)`,
      toHitMessage,
      damage: 0,
      targetDefeated: false
    };
  }
  
  // Check for critical hit (any die rolled a 6 on the attack roll)
  const criticalHit = isCriticalHit(rangedRollResult.dice);
  const doubleCritical = attackerDoubleCritical; // Use the already determined value
  
  // Check for shield blocking
  let shieldBlockMessage = '';
  let damage = 0;
  let targetDefeated = false;
  
  // Check if this is a back attack (shields can't block back attacks)
  const isBackAttackFromAttacker = isBackAttack(attacker, target);
  
  // Double criticals are unblockable
  if (!doubleCritical && targetEquipment.hasShield(isBackAttackFromAttacker)) {
    let shieldBlockValue = targetEquipment.getShieldBlockValue(isBackAttackFromAttacker);
    
    // Critical hits make shields harder to use (increase block value by 1)
    if (criticalHit) {
      shieldBlockValue += 1;
    }
    
    const shieldResult = checkShieldBlock(shieldBlockValue);
    const criticalShieldText = criticalHit ? " (critical hit +1)" : "";
    shieldBlockMessage = ` ${target.name}'s shield: ${shieldResult.message}${criticalShieldText}`;
    
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
  } else if (doubleCritical) {
    shieldBlockMessage = ` ${target.name}'s shield: Cannot block double critical!`;
  }
  
  // Calculate damage (weapon damage only, no strength)
  let weaponDamage = attackerEquipment.getWeaponDamage();
  // Add damage for critical hits
  if (doubleCritical) {
    weaponDamage += 2;
  } else if (criticalHit) {
    weaponDamage += 1;
  }
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
  const criticalHitText = doubleCritical ? " (DOUBLE CRITICAL!)" : (criticalHit ? " (CRITICAL HIT!)" : "");
  const damageMessage = `Damage: ${damage} [${diceRolls.join(',')}] vs armor ${armorValue}${criticalHitText}`;
  
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
  const attackerRollResult = calculateCombatRoll(attackerBonus);
  const defenderRollResult = calculateCombatRoll(defenderBonus);
  const attackerRoll = attackerRollResult.total;
  const defenderRoll = defenderRollResult.total;
  
  // Check for double criticals (both attacker and defender)
  const attackerDoubleCritical = isDoubleCritical(attackerRollResult.dice);
  const defenderDoubleCritical = isDoubleCritical(defenderRollResult.dice);
  
  // Check if attack hits
  const isBackAttackForHit = isBackAttack(attacker, target);
  const attackerHasShield = attackerEquipment.hasShield();
  const defenderHasShield = targetEquipment.hasShield(isBackAttackForHit);
  
  // Double criticals always hit unless defender also rolls double 6
  let hit: boolean;
  if (attackerDoubleCritical && defenderDoubleCritical) {
    // Epic tie - both rolled double 6s, use normal hit determination
    hit = determineHit(
      attackerRoll,
      defenderRoll,
      attacker.agility,
      target.agility,
      attackerHasShield,
      defenderHasShield
    );
  } else if (attackerDoubleCritical) {
    // Attacker double critical - automatic hit
    hit = true;
  } else {
    // Normal hit determination
    hit = determineHit(
      attackerRoll,
      defenderRoll,
      attacker.agility,
      target.agility,
      attackerHasShield,
      defenderHasShield
    );
  }
  
  // Generate to-hit message with modifiers
  const attackerModifierText = attackerModifiers.length > 0 ? ` (${attackerModifiers.join(', ')})` : '';
  const defenderModifierText = defenderModifiers.length > 0 ? ` (${defenderModifiers.join(', ')})` : '';
  
  let toHitMessage: string;
  if (attackerDoubleCritical && defenderDoubleCritical) {
    toHitMessage = `${attacker.name} attacks ${target.name}: ${attackerRoll}${attackerModifierText} (DOUBLE CRITICAL!) vs ${defenderRoll}${defenderModifierText} (DOUBLE CRITICAL!) - EPIC CLASH!`;
  } else if (attackerDoubleCritical) {
    toHitMessage = `${attacker.name} attacks ${target.name}: ${attackerRoll}${attackerModifierText} (DOUBLE CRITICAL!) vs ${defenderRoll}${defenderModifierText} - AUTOMATIC HIT!`;
  } else if (defenderDoubleCritical) {
    toHitMessage = `${attacker.name} attacks ${target.name}: ${attackerRoll}${attackerModifierText} vs ${defenderRoll}${defenderModifierText} (DOUBLE CRITICAL!)`;
  } else {
    toHitMessage = `${attacker.name} attacks ${target.name}: ${attackerRoll}${attackerModifierText} vs ${defenderRoll}${defenderModifierText}`;
  }
  
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
  
  // Check for critical hit (any die rolled a 6 on the attack roll)
  const criticalHit = isCriticalHit(attackerRollResult.dice);
  const doubleCritical = attackerDoubleCritical; // Use the already determined value
  
  // Check for shield blocking
  let shieldBlockMessage = '';
  let damage = 0;
  let targetDefeated = false;
  
  // Check if this is a back attack (shields can't block back attacks)
  const isBackAttackFromAttacker = isBackAttack(attacker, target);
  
  // Double criticals are unblockable
  if (!doubleCritical && targetEquipment.hasShield(isBackAttackFromAttacker)) {
    let shieldBlockValue = targetEquipment.getShieldBlockValue(isBackAttackFromAttacker);
    
    // Critical hits make shields harder to use (increase block value by 1)
    if (criticalHit) {
      shieldBlockValue += 1;
    }
    
    const shieldResult = checkShieldBlock(shieldBlockValue);
    const criticalShieldText = criticalHit ? " (critical hit +1)" : "";
    shieldBlockMessage = ` ${target.name}'s shield: ${shieldResult.message}${criticalShieldText}`;
    
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
  } else if (doubleCritical) {
    shieldBlockMessage = ` ${target.name}'s shield: Cannot block double critical!`;
  } else if (targetEquipment.hasShield(false) && isBackAttackFromAttacker) {
    shieldBlockMessage = ` ${target.name}'s shield: Cannot block back attack!`;
  }
  
  // Calculate damage
  let weaponDamage = attackerEquipment.getWeaponDamage();
  // Add damage for critical hits
  if (doubleCritical) {
    weaponDamage += 2;
  } else if (criticalHit) {
    weaponDamage += 1;
  }
  const diceRolls = calculateMeleeDamageRoll(attacker.strength, weaponDamage);
  
  
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
  const criticalHitText = doubleCritical ? " (DOUBLE CRITICAL!)" : (criticalHit ? " (CRITICAL HIT!)" : "");
  const damageMessage = `Damage: ${damage} [${diceRolls.join(',')}] vs armor ${armorValue}${criticalHitText}`;
  
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
