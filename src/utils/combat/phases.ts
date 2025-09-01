import { Creature } from '../../creatures/index';
import { EquipmentSystem } from '../../items/equipment';
import { Weapon } from '../../items/types';
import { calculateAttributeRoll, calculateDamageRoll, displayDiceRoll, displayDiceSum, isCriticalHit } from '../dice';
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
  // Create EquipmentSystem instances once and reuse
  const attackerEquipment = new EquipmentSystem(attacker.equipment);
  const targetEquipment = new EquipmentSystem(target.equipment);
  
  let attackerBonus = attackerEquipment.getAttackBonus(attacker.combat, attacker.ranged);
  let defenderBonus = targetEquipment.getAttackBonus(target.combat, target.ranged);

  // Check for back attack bonus
  if (attacker.wasBehindTargetAtTurnStart(target) && isBackAttack(attacker, target)) {
    attackerBonus += COMBAT_CONSTANTS.BACK_ATTACK_BONUS;
  }

  // Check for elevation bonus
  const elevationBonus = calculateElevationBonus(attacker, target, mapDefinition);
  attackerBonus += elevationBonus.attackerBonus;
  defenderBonus += elevationBonus.defenderBonus;

  // Roll for combat
  const attackerRollResult = calculateAttributeRoll(attackerBonus);
  const defenderRollResult = calculateAttributeRoll(defenderBonus);
  const attackerRoll = attackerRollResult.total;
  const defenderRoll = defenderRollResult.total;

  // Check for double criticals and critical hits
  const criticalHit = isCriticalHit(attackerRollResult.dice);

  // Check if attack hits
  const isBackAttackForHit = isBackAttack(attacker, target);
  const attackerHasShield = attackerEquipment.hasShield();
  const defenderHasShield = targetEquipment.hasShield(isBackAttackForHit);

  // Double criticals always hit unless defender also rolls double 6
  let hit: boolean;
  if (attackerRollResult.criticalSuccess && defenderRollResult.criticalSuccess) {
    // Epic tie - both rolled double 6s, use normal hit determination
    hit = determineHit(
      attackerRoll,
      defenderRoll,
      attacker.agility,
      target.agility,
      attackerHasShield,
      defenderHasShield
    );
  } else if (attackerRollResult.criticalSuccess) {
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

  let toHitMessage: string = `${attacker.name} attacks ${target.name}: ${displayDiceSum(attackerRollResult, attackerBonus)} vs ${displayDiceSum(defenderRollResult, defenderBonus)} ${displayHitMessage(hit, criticalHit, attackerRollResult.criticalSuccess)}`;

  return {
    hit,
    toHitMessage,
    attackerRoll,
    defenderRoll,
    attackerDoubleCritical: attackerRollResult.criticalSuccess,
    defenderDoubleCritical: defenderRollResult.criticalSuccess,
    criticalHit,
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
  
  // Check for back attack bonus
  let backAttackBonus = 0;
  if (attacker.wasBehindTargetAtTurnStart(target) && isBackAttack(attacker, target)) {
    backAttackBonus = COMBAT_CONSTANTS.BACK_ATTACK_BONUS;
  }

  const distance = calculateDistanceBetween(attacker.x, attacker.y, target.x, target.y);

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

  const totalModifier = backAttackBonus + agilityPenalty + movementPenalty + rangePenalty;
  const toHitRollResult = attacker.performAttributeTest('ranged', totalModifier);
  let criticalHit = isCriticalHit(toHitRollResult.dice);

  // Check if target is more than half the weapon's range away
  const attackerEquipment = new EquipmentSystem(attacker.equipment);
  const weaponRange = attackerEquipment.getWeaponRange('normal') as number;
  const halfRange = Math.ceil(weaponRange / 2);

  // If target is more than half range away, critical hits and double criticals are not possible
  if (distance > halfRange) {
    toHitRollResult.criticalSuccess = false;
    criticalHit = false;
  }

  const toHitMessage = `${attacker.name} makes a ranged attack at ${target.name}: ${displayDiceSum(toHitRollResult, toHitRollResult.modifier)} ${displayHitMessage(toHitRollResult.success, criticalHit, toHitRollResult.criticalSuccess)}`;

  return {
    hit: toHitRollResult.success,
    toHitMessage,
    attackerDoubleCritical: toHitRollResult.criticalSuccess,
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
  
  // Check if this is a back attack (shields can't block back attacks)
  const isBackAttackFromAttacker = isBackAttack(attacker, target);

  // Double criticals are unblockable
  if (attackerDoubleCritical) {
    return {
      blockMessage: ``,
      blockSuccess: false
    };
  }

  // Shields can't block back attacks
  if (targetEquipment.hasShield(false) && isBackAttackFromAttacker) {
    return {
      blockMessage: ``,
      blockSuccess: false
    };
  }

  // Process shield block if available
  if (targetEquipment.hasShield(isBackAttackFromAttacker)) {
    return processShieldBlock(target, targetEquipment, isBackAttackFromAttacker, criticalHit);
  }

  return { blockMessage: '', blockSuccess: false };
}

/**
 * Process shield block attempt
 */
function processShieldBlock(
  target: Creature,
  targetEquipment: EquipmentSystem,
  isBackAttack: boolean,
  criticalHit: boolean
): BlockResult {
  let shieldBlockValue = targetEquipment.getShieldBlockValue(isBackAttack);

  // Critical hits make shields harder to use (increase block value by 1)
  if (criticalHit) {
    shieldBlockValue += 1;
  }

  const shieldResult = checkShieldBlock(shieldBlockValue);
  const blockMessage = shieldResult.blocked ? `${target.name} blocks: ${displayDiceRoll([shieldResult.roll])}` : '';
  
  return {
    blockMessage,
    blockSuccess: shieldResult.blocked
  };
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
  const damageMessage = `${attacker.name} deals ${damage} damage: ${displayDiceRoll(diceRolls)} vs ${armorValue} Armor`;

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

function displayHitMessage(hit: boolean, criticalHit: boolean, doubleCritical: boolean): string {
  return hit ? `${doubleCritical ? '(Double Critical)' : criticalHit ? '(Critical Hit)' : '(Hit)'}` : '(Miss)';
}