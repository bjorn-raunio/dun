import { Creature } from '../../creatures/index';
import { EquipmentSystem } from '../../items/equipment';
import { Weapon } from '../../items/types';
import { calculateAttributeRoll, displayDiceRoll, displayDiceSum, isCriticalHit, rollXd6 } from '../dice';
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
  calculateEffectiveArmor,
  calculateElevationBonus,
  calculateDamage
} from './calculations';
import { COMBAT_CONSTANTS } from '../constants';
import { COMBAT_EVENTS, CombatEventData } from './execution';
import { CombatTriggers } from './combatTriggers';

// --- Combat Phase 1: To-Hit Roll ---

/**
 * Execute to-hit roll for melee combat
 */
export function executeToHitRollMelee(
  combatEventData: CombatEventData,
  mapDefinition?: any
): ToHitResult {
  // Create EquipmentSystem instances once and reuse
  const attackerEquipment = new EquipmentSystem(combatEventData.attacker.equipment);
  const targetEquipment = new EquipmentSystem(combatEventData.target.equipment);

  let attackerBonus = attackerEquipment.getAttackBonus(combatEventData.attacker.combat, combatEventData.attacker.ranged);
  let defenderBonus = targetEquipment.getAttackBonus(combatEventData.target.combat, combatEventData.target.ranged);

  // Check for back attack bonus
  if (combatEventData.attacker.wasBehindTargetAtTurnStart(combatEventData.target) && isBackAttack(combatEventData.attacker, combatEventData.target)) {
    attackerBonus += COMBAT_CONSTANTS.BACK_ATTACK_BONUS;
  }

  // Check for elevation bonus
  const elevationBonus = calculateElevationBonus(combatEventData.attacker, combatEventData.target, mapDefinition);
  attackerBonus += elevationBonus.attackerBonus;
  defenderBonus += elevationBonus.defenderBonus;

  // Roll for combat
  const attackerRollResult = calculateAttributeRoll(attackerBonus);
  if (attackerRollResult.fumble) {
    combatEventData.attacker.endTurn();
  }

  if (attackerRollResult.dice && attackerRollResult.dice.length === 2) {
    const [die1, die2] = attackerRollResult.dice;
    if (die1 === die2 && die1 > 1) {
      CombatTriggers.processCombatTriggers(COMBAT_EVENTS.DOUBLE_RESULT, combatEventData);
    }
  }

  const defenderRollResult = calculateAttributeRoll(defenderBonus);

  if (defenderRollResult.dice && defenderRollResult.dice.length === 2) {
    const [die1, die2] = defenderRollResult.dice;
    if (die1 === die2 && die1 > 1) {
      CombatTriggers.processCombatTriggers(COMBAT_EVENTS.DOUBLE_RESULT, { ...combatEventData, target: combatEventData.attacker, attacker: combatEventData.target });
    }
  }

  const attackerRoll = attackerRollResult.total;
  const defenderRoll = defenderRollResult.total;

  // Check for double criticals and critical hits
  const criticalHit = isCriticalHit(attackerRollResult.dice);

  // Check if attack hits
  const isBackAttackForHit = isBackAttack(combatEventData.attacker, combatEventData.target);
  const attackerHasShield = attackerEquipment.hasShield();
  const defenderHasShield = targetEquipment.hasShield(isBackAttackForHit);

  // Double criticals always hit unless defender also rolls double 6
  let hit: boolean;
  if (attackerRollResult.criticalSuccess && defenderRollResult.criticalSuccess) {
    // Epic tie - both rolled double 6s, use normal hit determination
    hit = determineHit(
      attackerRoll,
      defenderRoll,
      combatEventData.attacker.agility,
      combatEventData.target.agility,
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
      combatEventData.attacker.agility,
      combatEventData.target.agility,
      attackerHasShield,
      defenderHasShield
    );
  }

  let toHitMessage: string = `${combatEventData.attacker.name} attacks ${combatEventData.target.name}: ${displayDiceSum(attackerRollResult, attackerBonus)} vs ${displayDiceSum(defenderRollResult, defenderBonus)} ${displayHitMessage(hit, criticalHit, attackerRollResult.criticalSuccess)}`;

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
  combatEventData: CombatEventData
): RangedToHitResult {

  // Check for back attack bonus
  let backAttackBonus = 0;
  if (combatEventData.attacker.wasBehindTargetAtTurnStart(combatEventData.target) && isBackAttack(combatEventData.attacker, combatEventData.target)) {
    backAttackBonus = COMBAT_CONSTANTS.BACK_ATTACK_BONUS;
  }

  // Return early if either creature is not on the map (undefined position)
  if (combatEventData.attacker.x === undefined || combatEventData.attacker.y === undefined ||
    combatEventData.target.x === undefined || combatEventData.target.y === undefined) {
    return {
      hit: false,
      toHitMessage: `${combatEventData.attacker.name} cannot attack ${combatEventData.target.name} - target not on map`,
      attackerDoubleCritical: false,
      criticalHit: false,
      attackerDice: []
    };
  }

  const distance = calculateDistanceBetween(combatEventData.attacker.x, combatEventData.attacker.y, combatEventData.target.x, combatEventData.target.y);

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
  if (combatEventData.target.agility > combatEventData.attacker.agility) {
    agilityPenalty = -1;
  }

  // Apply movement penalty: -1 if moved up to half movement, -2 if moved more than half
  let movementPenalty = 0;
  const maxMovement = combatEventData.attacker.movement;
  const movementUsed = maxMovement - combatEventData.attacker.remainingMovement;

  if (movementUsed > 0) {
    const halfMovement = Math.ceil(maxMovement / 2);

    if (movementUsed <= halfMovement) {
      movementPenalty = -1;
    } else {
      movementPenalty = -2;
    }
  }

  const totalModifier = backAttackBonus + agilityPenalty + movementPenalty + rangePenalty;
  const toHitRollResult = combatEventData.attacker.performAttributeTest('ranged', totalModifier);
  if (toHitRollResult.criticalSuccess) {
    combatEventData.attacker.endTurn();
  }
  let criticalHit = isCriticalHit(toHitRollResult.dice);

  // Check if target is more than half the weapon's range away
  const attackerEquipment = new EquipmentSystem(combatEventData.attacker.equipment);
  const weaponRange = attackerEquipment.getWeaponRange('normal') as number;
  const halfRange = Math.ceil(weaponRange / 2);

  // If target is more than half range away, critical hits and double criticals are not possible
  if (distance > halfRange) {
    toHitRollResult.criticalSuccess = false;
    criticalHit = false;
  }

  const toHitMessage = `${combatEventData.attacker.name} makes a ranged attack at ${combatEventData.target.name}: ${displayDiceSum(toHitRollResult, toHitRollResult.modifier)} ${displayHitMessage(toHitRollResult.success, criticalHit, toHitRollResult.criticalSuccess)}`;

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
  isRanged: boolean,
  bonusDamage: number = 0
): DamageResult {
  const attackerEquipment = new EquipmentSystem(attacker.equipment);
  const targetEquipment = new EquipmentSystem(target.equipment);

  // Calculate weapon damage with critical bonuses
  let weaponDamage = attackerEquipment.getWeaponDamage();
  if (attackerDoubleCritical) {
    weaponDamage += 2;
  } else if (criticalHit) {
    weaponDamage += 1;
  }

  let totalDamage = weaponDamage + bonusDamage;
  if (!isRanged) {
    totalDamage += attacker.strength;
  }

  let armorModifier = 0;
  if (totalDamage <= 0) {
    totalDamage = 1;
    armorModifier = 1;
  }

  // Roll dice based on attack type
  const diceRolls = rollXd6(totalDamage);

  // Calculate effective armor value
  const armorValue = calculateEffectiveArmor(target, targetEquipment, attackerEquipment, armorModifier);

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