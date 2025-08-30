import { Creature } from '../creatures/index';
import { terrainHeightAt } from '../maps/mapRenderer';
import { chebyshevDistanceRect, isInBackArc } from './geometry';
import { getCreatureDimensions } from './dimensions';
import { calculateCombatRoll, calculateDamageRoll, rollD6, isCriticalHit, isDoubleCritical } from './dice';
import { BaseValidationResult } from './types';
import { validateCombat } from '../validation/combat';
// Import equipment system
import { EquipmentSystem } from '../items/equipment';
import { Weapon } from '../items/types';
import { updateCombatStates } from './combatStateUtils';
import { logCombat } from '../utils/logging';
import { calculateDistanceBetween } from './pathfinding';

// --- Combat Utilities Module ---

// Re-export commonly used types
export interface CombatResult {
  success: boolean;
  message: string;
  damage: number;
  targetDefeated: boolean;
  toHitMessage?: string;
  blockMessage?: string;
  damageMessage?: string;
  shieldBlockMessage?: string;
}

export interface CombatValidationResult extends BaseValidationResult { }

// --- Combat Calculation Utilities ---

/**
 * Helper function to get EquipmentSystem instance for a creature
 * Consolidates EquipmentSystem instantiation to reduce redundancy
 */
function getCreatureEquipment(creature: Creature): EquipmentSystem {
  return new EquipmentSystem(creature.equipment);
}

/**
 * Calculate targets in range for a creature
 */
export function calculateTargetsInRange(
  attacker: Creature,
  allCreatures: Creature[]
): Set<string> {
  const equipment = getCreatureEquipment(attacker);
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
  logCombat(`Back attack check: ${attacker.name} at (${attacker.x},${attacker.y}) attacking ${target.name} at (${target.x},${target.y})`, {
    targetFacing: target.facing,
    isBackAttack: isBack
  });

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

// --- Shared Combat Helper Functions ---

/**
 * Calculate critical damage bonus based on hit type
 */
function calculateCriticalDamage(baseDamage: number, attackerDoubleCritical: boolean, criticalHit: boolean): number {
  if (attackerDoubleCritical) return baseDamage + 2;
  if (criticalHit) return baseDamage + 1;
  return baseDamage;
}

/**
 * Generate critical hit text for display
 */
function generateCriticalHitText(attackerDoubleCritical: boolean, criticalHit: boolean): string {
  if (attackerDoubleCritical) return " (DOUBLE CRITICAL!)";
  if (criticalHit) return " (CRITICAL HIT!)";
  return "";
}

/**
 * Calculate effective armor value for target
 */
function calculateEffectiveArmor(target: Creature, targetEquipment: EquipmentSystem, attackerEquipment: EquipmentSystem): number {
  const baseArmorValue = targetEquipment.getEffectiveArmor(target.naturalArmor);
  const weaponArmorModifier = attackerEquipment.getWeaponArmorModifier();
  return baseArmorValue + weaponArmorModifier;
}

/**
 * Generate weapon modifier text for display
 */
function generateWeaponModifierText(weapon: any, isUnarmed: boolean = false): string {
  if (isUnarmed) return "weapon -1";
  if (!weapon) return "";
  
  const modifier = weapon instanceof Weapon ? (weapon.combatModifier ?? 0) : 0;
  if (modifier === 0) return "";
  
  const modifierText = modifier > 0 ? `+${modifier}` : `${modifier}`;
  return `weapon ${modifierText}`;
}

// --- Three-Part Attack System Functions ---

/**
 * Phase 1: Execute to-hit roll for melee combat
 */
function executeToHitRollMelee(
  attacker: Creature,
  target: Creature,
  mapDefinition?: any
): {
  hit: boolean;
  toHitMessage: string;
  attackerRoll: number;
  defenderRoll: number;
  attackerDoubleCritical: boolean;
  defenderDoubleCritical: boolean;
  criticalHit: boolean;
  attackerModifiers: string[];
  defenderModifiers: string[];
} {
  const attackerEquipment = getCreatureEquipment(attacker);
  const targetEquipment = getCreatureEquipment(target);
  let attackerBonus = attackerEquipment.getAttackBonus(attacker.combat, attacker.ranged);
  let defenderBonus = targetEquipment.getAttackBonus(target.combat, target.ranged);

  // Track modifiers for display
  const attackerModifiers: string[] = [];
  const defenderModifiers: string[] = [];

  // Add weapon combat modifier display for attacker
  const attackerWeapon = attackerEquipment.getMainWeapon();
  const attackerWeaponModifier = attackerWeapon instanceof Weapon ? (attackerWeapon.combatModifier ?? 0) : 0;
  if (attackerWeaponModifier !== 0) {
    const modifierText = attackerWeaponModifier > 0 ? `+${attackerWeaponModifier}` : `${attackerWeaponModifier}`;
    attackerModifiers.push(`weapon ${modifierText}`);
  }

  // Add weapon combat modifier display for defender
  const defenderWeapon = targetEquipment.getMainWeapon();
  const defenderWeaponModifier = defenderWeapon instanceof Weapon ? (defenderWeapon.combatModifier ?? 0) : 0;
  if (defenderWeaponModifier !== 0) {
    const modifierText = defenderWeaponModifier > 0 ? `+${defenderWeaponModifier}` : `${defenderWeaponModifier}`;
    defenderModifiers.push(`weapon ${modifierText}`);
  }

  // Check for back attack bonus
  if (attacker.wasBehindTargetAtTurnStart(target) && isBackAttack(attacker, target)) {
    attackerBonus += 1;
    attackerModifiers.push("back attack +1");
    logCombat(`Back attack detected: ${attacker.name} was behind ${target.name} at turn start and is attacking from behind!`);
  }

  // Check for elevation bonus (only for melee attacks)
  if (mapDefinition) {
    const attackerElevation = terrainHeightAt(attacker.x, attacker.y, mapDefinition);
    const targetElevation = terrainHeightAt(target.x, target.y, mapDefinition);

    // Attacker gets +1 bonus if they are 1 elevation higher than target
    if (attackerElevation === targetElevation + 1) {
      attackerBonus += 1;
      attackerModifiers.push("elevation +1");
      logCombat(`Elevation bonus: ${attacker.name} is attacking from higher ground (+1 bonus)`);
    }

    // Defender gets +1 bonus if they are 1 elevation higher than attacker
    if (targetElevation === attackerElevation + 1) {
      defenderBonus += 1;
      defenderModifiers.push("elevation +1");
      logCombat(`Elevation bonus: ${target.name} is defending from higher ground (+1 bonus)`);
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
  const criticalHit = isCriticalHit(attackerRollResult.dice);

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

  return {
    hit,
    toHitMessage,
    attackerRoll,
    defenderRoll,
    attackerDoubleCritical,
    defenderDoubleCritical,
    criticalHit,
    attackerModifiers,
    defenderModifiers
  };
}

/**
 * Phase 1: Execute to-hit roll for ranged combat
 */
function executeToHitRollRanged(
  attacker: Creature,
  target: Creature
): {
  hit: boolean;
  toHitMessage: string;
  toHitRoll: number;
  attackerDoubleCritical: boolean;
  criticalHit: boolean;
} {
  const toHitRollResult = calculateCombatRoll(attacker.ranged);
  const toHitRoll = toHitRollResult.total;
  let attackerDoubleCritical = isDoubleCritical(toHitRollResult.dice);
  let criticalHit = isCriticalHit(toHitRollResult.dice);

  // Check if target is more than half the weapon's range away
  const attackerEquipment = getCreatureEquipment(attacker);
  const weaponRange = attackerEquipment.getWeaponRange('normal') as number;
  const distance = calculateDistanceBetween(attacker.x, attacker.y, target.x, target.y);
  const halfRange = Math.ceil(weaponRange / 2);

  // If target is more than half range away, critical hits and double criticals are not possible
  if (distance > halfRange) {
    attackerDoubleCritical = false;
    criticalHit = false;
  }

  // Ranged attacks hit on 10 or greater, but double criticals always hit
  const hit = attackerDoubleCritical || toHitRoll >= 10;

  const toHitMessage = attackerDoubleCritical
    ? `${attacker.name} makes a ranged attack at ${target.name}: ${toHitRoll} (2d6 + ${attacker.ranged} ranged) (DOUBLE CRITICAL!) - AUTOMATIC HIT!`
    : `${attacker.name} makes a ranged attack at ${target.name}: ${toHitRoll} (2d6 + ${attacker.ranged} ranged)`;

  return {
    hit,
    toHitMessage,
    toHitRoll,
    attackerDoubleCritical,
    criticalHit
  };
}

/**
 * Phase 2: Execute block roll
 */
function executeBlockRoll(
  attacker: Creature,
  target: Creature,
  attackerDoubleCritical: boolean,
  criticalHit: boolean
): {
  blockMessage: string;
  blockSuccess: boolean;
} {
  const targetEquipment = getCreatureEquipment(target);
  let blockMessage = '';
  let blockSuccess = false;

  // Check if this is a back attack (shields can't block back attacks)
  const isBackAttackFromAttacker = isBackAttack(attacker, target);

  // Double criticals are unblockable
  if (!attackerDoubleCritical && targetEquipment.hasShield(isBackAttackFromAttacker)) {
    let shieldBlockValue = targetEquipment.getShieldBlockValue(isBackAttackFromAttacker);

    // Critical hits make shields harder to use (increase block value by 1)
    if (criticalHit) {
      shieldBlockValue += 1;
    }

    const shieldResult = checkShieldBlock(shieldBlockValue);
    const criticalShieldText = criticalHit ? " (critical hit +1)" : "";
    blockMessage = `${target.name}'s shield: ${shieldResult.message}${criticalShieldText}`;
    blockSuccess = shieldResult.blocked;
  } else if (attackerDoubleCritical) {
    blockMessage = `${target.name}'s shield: Cannot block double critical!`;
  } else if (targetEquipment.hasShield(false) && isBackAttackFromAttacker) {
    blockMessage = `${target.name}'s shield: Cannot block back attack!`;
  }

  return { blockMessage, blockSuccess };
}

/**
 * Phase 3: Execute damage roll for both melee and ranged combat
 * Consolidated function to eliminate code duplication
 */
function executeDamageRoll(
  attacker: Creature,
  target: Creature,
  attackerDoubleCritical: boolean,
  criticalHit: boolean,
  isRanged: boolean
): {
  damage: number;
  damageMessage: string;
  diceRolls: number[];
  armorValue: number;
} {
  const attackerEquipment = getCreatureEquipment(attacker);
  const targetEquipment = getCreatureEquipment(target);

  // Calculate weapon damage with critical bonuses
  let weaponDamage = attackerEquipment.getWeaponDamage();
  weaponDamage = calculateCriticalDamage(weaponDamage, attackerDoubleCritical, criticalHit);

  // Roll dice based on attack type
  const diceRolls = isRanged
    ? calculateDamageRoll(weaponDamage, 0) // Ranged: weapon damage only, no strength
    : calculateDamageRoll(weaponDamage, attacker.strength); // Melee: weapon damage + strength

  // Calculate effective armor value
  const armorValue = calculateEffectiveArmor(target, targetEquipment, attackerEquipment);

  // Calculate final damage
  const damage = calculateDamage(diceRolls, armorValue);

  // Generate damage message
  const criticalHitText = generateCriticalHitText(attackerDoubleCritical, criticalHit);
  const damageMessage = `Damage: ${damage} [${diceRolls.join(',')}] vs armor ${armorValue}${criticalHitText}`;

  return { damage, damageMessage, diceRolls, armorValue };
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
  const equipment = getCreatureEquipment(attacker);
  const isRanged = equipment.hasRangedWeapon();

  // Execute unified combat
  const result = executeCombatPhase(attacker, target, isRanged, allCreatures, mapDefinition);

  // Update combat states for all creatures after combat
  updateCombatStates(allCreatures);

  return result;
}

/**
 * Unified combat execution for both melee and ranged combat
 */
function executeCombatPhase(
  attacker: Creature,
  target: Creature,
  isRanged: boolean,
  allCreatures: Creature[],
  mapDefinition?: any
): CombatResult {
  // === PART 1: TO-HIT ROLL ===
  const toHitResult = isRanged 
    ? executeToHitRollRanged(attacker, target)
    : executeToHitRollMelee(attacker, target, mapDefinition);

  // Consume action (regardless of hit or miss)
  attacker.setRemainingActions(attacker.remainingActions - 1);

  if (!toHitResult.hit) {
    const missMessage = isRanged ? " - Miss! (needs 10+)" : " - Miss!";
    return {
      success: true,
      message: `${toHitResult.toHitMessage}${missMessage}`,
      toHitMessage: toHitResult.toHitMessage,
      damage: 0,
      targetDefeated: false
    };
  }

  // === PART 2: BLOCK ROLL ===
  const blockResult = executeBlockRoll(attacker, target, toHitResult.attackerDoubleCritical, toHitResult.criticalHit);

  if (blockResult.blockSuccess) {
    // Shield blocked the attack - no damage
    return {
      success: true,
      message: `${toHitResult.toHitMessage} - Hit! ${blockResult.blockMessage} - Attack blocked!`,
      toHitMessage: toHitResult.toHitMessage,
      blockMessage: blockResult.blockMessage,
      damage: 0,
      targetDefeated: false
    };
  }

  // === PART 3: DAMAGE ROLL ===
  const damageResult = executeDamageRoll(
    attacker, 
    target, 
    toHitResult.attackerDoubleCritical, 
    toHitResult.criticalHit,
    isRanged
  );

  // Apply damage using the proper method
  target.takeDamage(damageResult.damage);

  // Check if target is defeated
  const targetDefeated = target.isDead();

  return {
    success: true,
    message: `${toHitResult.toHitMessage} - Hit! ${blockResult.blockMessage} ${damageResult.damageMessage}`,
    toHitMessage: toHitResult.toHitMessage,
    blockMessage: blockResult.blockMessage,
    damageMessage: damageResult.damageMessage,
    damage: damageResult.damage,
    targetDefeated
  };
}
