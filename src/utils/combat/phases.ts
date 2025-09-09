import { Creature, Hero, ICreature } from '../../creatures/index';
import { EquipmentSystem } from '../../items/equipment';
import { CombatCalculator } from '../../items/equipment/combat';
import { Weapon, RangedWeapon, Shield, BaseWeapon, WeaponAttack } from '../../items';
import { Light } from '../../maps/types';
import { calculateAttributeRoll, displayDiceRoll, displayDiceSum, displayDieRoll, rollXd6 } from '../dice';
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
import { addCombatMessage } from '../messageSystem';
import { dropItem } from '../itemDropping';

// --- Combat Phase 1: To-Hit Roll ---

/**
 * Handle weapon breaking when a hero fumbles
 */
function handleFumble(creature: ICreature, weapon: BaseWeapon | Shield, mapDefinition: any): void {

  if (creature.x === undefined || creature.y === undefined || !mapDefinition) {
    return;
  }

  if (creature.kind === 'hero' && dropItem(creature, mapDefinition, undefined, true, 'mainHand')) {
    // Add combat message
    addCombatMessage(`${creature.name} fumbles and drops their ${weapon.name}!`);
  }
  weapon.break(creature);
}

/**
 * Execute to-hit roll for melee combat
 */
export function executeToHitRollMelee(
  combatEventData: CombatEventData,
  mapDefinition?: any
): ToHitResult {

  // Roll for combat
  const attackerRollResult = calculateAttributeRoll(0);

  CombatTriggers.processCombatTriggers(COMBAT_EVENTS.HIT_ROLL, combatEventData, attackerRollResult);  

  const defenderRollResult = calculateAttributeRoll(0);

  CombatTriggers.processCombatTriggers(COMBAT_EVENTS.DEFEND_ROLL, { ...combatEventData, target: combatEventData.attacker, attacker: combatEventData.target }, defenderRollResult);  

  // Use cached EquipmentSystem instances from combat managers
  const attackerEquipment = combatEventData.attacker.getEquipmentSystem();
  const targetEquipment = combatEventData.target.getEquipmentSystem();

  let attackerBonus = combatEventData.attack.toHitModifier + combatEventData.attacker.combat;
  const defenderWeapon = targetEquipment.getHighestCombatBonusWeapon();
  let defenderBonus = (defenderWeapon.attacks.find(a => a.type === "melee")?.toHitModifier ?? 0) + combatEventData.target.combat;

  // Check for back attack bonus
  if (combatEventData.attacker.wasBehindTargetAtTurnStart(combatEventData.target) && isBackAttack(combatEventData.attacker, combatEventData.target)) {
    attackerBonus += COMBAT_CONSTANTS.BACK_ATTACK_BONUS;
  }

  // Check for elevation bonus
  const elevationBonus = calculateElevationBonus(combatEventData.attacker, combatEventData.target, mapDefinition);
  attackerBonus += elevationBonus.attackerBonus;
  defenderBonus += elevationBonus.defenderBonus;

  attackerRollResult.total += attackerBonus;
  defenderRollResult.total += defenderBonus;

  // Check if attack hits
  const isBackAttackForHit = isBackAttack(combatEventData.attacker, combatEventData.target);
  const attackerHasShield = attackerEquipment.hasShield();
  const defenderHasShield = targetEquipment.hasShield(isBackAttackForHit);

  // Double criticals always hit unless defender also rolls double 6
  let hit: boolean;
  if (attackerRollResult.fumble) {
    hit = false;
  } else if (attackerRollResult.criticalSuccess && defenderRollResult.criticalSuccess) {
    // Epic tie - both rolled double 6s, use normal hit determination
    hit = determineHit(
      attackerRollResult.total,
      defenderRollResult.total,
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
      attackerRollResult.total,
      defenderRollResult.total,
      combatEventData.attacker.agility,
      combatEventData.target.agility,
      attackerHasShield,
      defenderHasShield
    );
  }

  addCombatMessage(`${combatEventData.attacker.name} attacks ${combatEventData.target.name}: 
    ${displayDiceSum(attackerRollResult, attackerBonus)} vs ${displayDiceSum(defenderRollResult, defenderBonus)} 
    ${displayHitMessage(hit, attackerRollResult.criticalHit, attackerRollResult.criticalSuccess, attackerRollResult.fumble)}`);

  if (attackerRollResult.fumble) {
    handleFumble(combatEventData.attacker, combatEventData.weapon, mapDefinition);
    combatEventData.attacker.endTurn();
  }
  if (defenderRollResult.fumble) {
    let weapon: BaseWeapon | Shield = defenderWeapon;
    let shield = combatEventData.target.getShield();
    if (shield && !shield.isBroken()) {
      weapon = shield;
    }
    handleFumble(combatEventData.target, weapon, mapDefinition);
    combatEventData.target.endTurn();
  }

  return {
    hit,
    attackerRoll: attackerRollResult,
    defenderRoll: defenderRollResult
  };
}

/**
 * Execute to-hit roll for ranged combat
 * 
 * Applies various penalties including:
 * - Range penalty: -1 over 3, -2 over 6, -3 over 9
 * - Agility penalty: -1 if target has higher agility
 * - Movement penalty: -1 if moved up to half movement, -2 if moved more than half
 * - Lighting penalty: -1 if target is in dimly lit or darker conditions
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
      attackerRoll: { total: 0, dice: [], fumble: false, criticalHit: false, criticalSuccess: false },
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

  // Apply lighting penalty: -1 to hit if target is in dimly lit or darker conditions
  let lightingPenalty = 0;
  if (combatEventData.mapDefinition && combatEventData.target.x !== undefined && combatEventData.target.y !== undefined) {
    // Light.lit = 2, Light.darkness = 1, Light.totalDarkness = 0
    // Apply penalty if light level is below lit (i.e., darkness or totalDarkness)
    if (combatEventData.attacker.getVision(combatEventData.target.x, combatEventData.target.y, combatEventData.mapDefinition) < Light.lit) {
      lightingPenalty = COMBAT_CONSTANTS.LIGHTING_PENALTY;
    }
  }
  const totalModifier = combatEventData.attack.toHitModifier + backAttackBonus + agilityPenalty + movementPenalty + rangePenalty + lightingPenalty;
  const toHitRollResult = combatEventData.attacker.performAttributeTest('ranged', totalModifier);

  // Check if target is more than half the weapon's range away
  const halfRange = Math.ceil(combatEventData.attack.range / 2);

  // If target is more than half range away, critical hits and double criticals are not possible
  if (distance > halfRange) {
    toHitRollResult.criticalSuccess = false;
    toHitRollResult.criticalHit = false;
  }

  addCombatMessage(`${combatEventData.attacker.name} makes a ranged attack at ${combatEventData.target.name}: 
    ${displayDiceSum(toHitRollResult, toHitRollResult.modifier)} 
    ${displayHitMessage(toHitRollResult.success, toHitRollResult.criticalHit, toHitRollResult.criticalSuccess, toHitRollResult.fumble)}`);

  if (toHitRollResult.fumble) {
    handleFumble(combatEventData.attacker, combatEventData.weapon, combatEventData.mapDefinition);
    combatEventData.attacker.endTurn();
  }

  return {
    hit: toHitRollResult.success,
    attackerRoll: toHitRollResult,
  };
}

// --- Combat Phase 2: Block Roll ---

/**
 * Execute block roll
 */
export function executeBlockRoll(
  attacker: ICreature,
  target: ICreature,
  attackerDoubleCritical: boolean,
  criticalHit: boolean
): BlockResult {
  const targetEquipment = target.getEquipmentSystem();

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
  target: ICreature,
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
  const blockMessage = shieldResult.blocked ? `${target.name} blocks: ${displayDieRoll(shieldResult.roll)}` : '';

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
  attacker: ICreature,
  target: ICreature,
  attack: WeaponAttack,
  attackerDoubleCritical: boolean,
  criticalHit: boolean,
  bonusDamage: number = 0
): DamageResult {
  const targetEquipment = target.getEquipmentSystem();

  // Calculate weapon damage with critical bonuses
  let weaponDamage = attack.damageModifier;
  if (attackerDoubleCritical) {
    weaponDamage += 2;
  } else if (criticalHit) {
    weaponDamage += 1;
  }

  let totalDamage = weaponDamage + bonusDamage;
  if (attack.addStrength) {
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
  const armorValue = calculateEffectiveArmor(target, targetEquipment, attack, armorModifier);

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

function displayHitMessage(hit: boolean, criticalHit: boolean, doubleCritical: boolean, fumble: boolean): string {
  return hit ? `${doubleCritical ? '(Double Critical)' : criticalHit ? '(Critical Hit)' : '(Hit)'}` : fumble ? '(Fumble)' : '(Miss)';
}