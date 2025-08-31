import { Creature } from '../../creatures/index';
import { EquipmentSystem } from '../../items/equipment';
import { Weapon } from '../../items/types';
import { calculateCombatRoll, calculateDamageRoll, isCriticalHit, isDoubleCritical } from '../dice';
import { calculateDistanceBetween } from '../pathfinding';
import { logCombat } from '../logging';
import { 
  ToHitResult, 
  RangedToHitResult, 
  BlockResult, 
  DamageResult 
} from './types';
import { 
  isBackAttack, 
  checkShieldBlock, 
  calculateCriticalDamage, 
  generateCriticalHitText,
  calculateEffectiveArmor,
  calculateElevationBonus,
  calculateDamage
} from './calculations';
import { COMBAT_CONSTANTS } from '../constants';

// --- Combat Phase 1: To-Hit Roll ---

/**
 * Execute to-hit roll for melee combat
 */
export function executeToHitRollMelee(
  attacker: Creature,
  target: Creature,
  mapDefinition?: any
): ToHitResult {
  const attackerEquipment = new EquipmentSystem(attacker.equipment);
  const targetEquipment = new EquipmentSystem(target.equipment);
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
    attackerBonus += COMBAT_CONSTANTS.BACK_ATTACK_BONUS;
    attackerModifiers.push(`back attack +${COMBAT_CONSTANTS.BACK_ATTACK_BONUS}`);
    logCombat(`Back attack detected: ${attacker.name} was behind ${target.name} at turn start and is attacking from behind! (+${COMBAT_CONSTANTS.BACK_ATTACK_BONUS} bonus)`);
  }

  // Check for elevation bonus
  const elevationBonus = calculateElevationBonus(attacker, target, mapDefinition);
  attackerBonus += elevationBonus.attackerBonus;
  defenderBonus += elevationBonus.defenderBonus;
  
  if (elevationBonus.attackerBonus > 0) {
    attackerModifiers.push("elevation +1");
  }
  if (elevationBonus.defenderBonus > 0) {
    defenderModifiers.push("elevation +1");
  }

  // Roll for combat
  const attackerRollResult = calculateCombatRoll(attackerBonus);
  const defenderRollResult = calculateCombatRoll(defenderBonus);
  const attackerRoll = attackerRollResult.total;
  const defenderRoll = defenderRollResult.total;

  // Check for double criticals and critical hits
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
    defenderModifiers,
    attackerDice: attackerRollResult.dice,
    defenderDice: defenderRollResult.dice
  };
}

/**
 * Execute to-hit roll for ranged combat
 */
export function executeToHitRollRanged(
  attacker: Creature,
  target: Creature
): RangedToHitResult {
  const toHitRollResult = calculateCombatRoll(attacker.ranged);
  const toHitRoll = toHitRollResult.total;
  let attackerDoubleCritical = isDoubleCritical(toHitRollResult.dice);
  let criticalHit = isCriticalHit(toHitRollResult.dice);

  // Check if target is more than half the weapon's range away
  const attackerEquipment = new EquipmentSystem(attacker.equipment);
  const weaponRange = attackerEquipment.getWeaponRange('normal') as number;
  const distance = calculateDistanceBetween(attacker.x, attacker.y, target.x, target.y);
  const halfRange = Math.ceil(weaponRange / 2);

  // If target is more than half range away, critical hits and double criticals are not possible
  if (distance > halfRange) {
    attackerDoubleCritical = false;
    criticalHit = false;
  }

  // Check for back attack bonus
  let backAttackBonus = 0;
  if (attacker.wasBehindTargetAtTurnStart(target) && isBackAttack(attacker, target)) {
    backAttackBonus = COMBAT_CONSTANTS.BACK_ATTACK_BONUS;
    logCombat(`Back attack detected: ${attacker.name} was behind ${target.name} at turn start and is attacking from behind with ranged weapon! (+${COMBAT_CONSTANTS.BACK_ATTACK_BONUS} bonus)`);
  }

  // Apply range penalty: -1 over 3, -2 over 6, -3 over 9
  let rangePenalty = 0;
  if (distance > 9) {
    rangePenalty = -3;
  } else if (distance > 6) {
    rangePenalty = -2;
  } else if (distance > 3) {
    rangePenalty = -1;
  }

  // Apply agility penalty: -1 to hit if target has higher agility
  let agilityPenalty = 0;
  if (target.agility > attacker.agility) {
    agilityPenalty = -1;
  }

  // Apply movement penalty: -1 if moved up to half movement, -2 if moved more than half
  let movementPenalty = 0;
  const maxMovement = attacker.movement;
  const movementUsed = maxMovement - attacker.remainingMovement;
  
  if (movementUsed > 0) {
    const halfMovement = Math.ceil(maxMovement / 2);
    
    if (movementUsed <= halfMovement) {
      movementPenalty = -1;
    } else {
      movementPenalty = -2;
    }
  }
  
  // Ranged attacks hit on 10 or greater (with all penalties and bonuses), but double criticals always hit
  const totalModifier = backAttackBonus + agilityPenalty + movementPenalty + rangePenalty;
  const hit = attackerDoubleCritical || (toHitRoll + totalModifier) >= 10;

  const toHitMessage = attackerDoubleCritical
    ? `${attacker.name} makes a ranged attack at ${target.name}: ${toHitRoll} (2d6 + ${attacker.ranged} ranged) (DOUBLE CRITICAL!) - AUTOMATIC HIT!`
    : `${attacker.name} makes a ranged attack at ${target.name}: ${toHitRoll} (2d6 + ${attacker.ranged} ranged)${totalModifier !== 0 ? ` (total modifier ${totalModifier > 0 ? '+' : ''}${totalModifier})` : ''}`;

  return {
    hit,
    toHitMessage,
    toHitRoll,
    attackerDoubleCritical,
    criticalHit,
    attackerDice: toHitRollResult.dice
  };
}

// --- Combat Phase 2: Block Roll ---

/**
 * Execute block roll
 */
export function executeBlockRoll(
  attacker: Creature,
  target: Creature,
  attackerDoubleCritical: boolean,
  criticalHit: boolean
): BlockResult {
  const targetEquipment = new EquipmentSystem(target.equipment);
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

// --- Combat Phase 3: Damage Roll ---

/**
 * Execute damage roll for both melee and ranged combat
 */
export function executeDamageRoll(
  attacker: Creature,
  target: Creature,
  attackerDoubleCritical: boolean,
  criticalHit: boolean,
  isRanged: boolean
): DamageResult {
  const attackerEquipment = new EquipmentSystem(attacker.equipment);
  const targetEquipment = new EquipmentSystem(target.equipment);

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

// Helper function for hit determination (moved from calculations to avoid circular dependency)
function determineHit(
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
