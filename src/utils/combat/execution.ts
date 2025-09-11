import { Creature, ICreature } from '../../creatures/index';
import { EquipmentSystem } from '../../items/equipment';
import { validateCombat } from '../../validation/combat';
import { updateCombatStates } from '../combatStateUtils';
import { CombatResult, ToHitResult } from './types';
import { STATUS_EFFECT_PRESETS } from '../../statusEffects';
import {
  executeToHitRollMelee,
  executeToHitRollRanged,
  executeBlockRoll,
  executeDamageRoll
} from './phases';
import { getDirectionFromTo } from '../geometry';
import { isAreaStandable } from '../pathfinding/helpers';
import { QuestMap } from '../../maps/types';
import { BaseWeapon, Shield, WeaponAttack } from '../../items';
import { CombatTriggers } from './combatTriggers';
import { diagonalMovementBlocked } from '../movement';
import { addCombatMessage } from '../messageSystem';
import { calculateDistanceBetween } from '../pathfinding';
import { getRandomElement } from '../dice';

// --- Combat Execution ---
// Streamlined combat execution with optimized object creation and message building

/**
 * Execute a combat attack between two creatures
 */
export function executeCombat(
  attacker: Creature,
  target: Creature,
  allCreatures: Creature[],
  mapDefinition: QuestMap,
  offhand: boolean = false
): CombatResult {
  // Face the target when attacking (only if both creatures are on the map)
  if (attacker.x !== undefined && attacker.y !== undefined &&
    target.x !== undefined && target.y !== undefined) {
    attacker.faceTowards(target.x, target.y);
  }

  // Determine the weapon being used for the attack
  const equipment = attacker.getEquipmentSystem();
  let weapon = offhand ? equipment.getOffHandWeapon() : equipment.getMainWeapon();

  // Use consolidated validation
  const validation = validateCombat(attacker, target, weapon, allCreatures, mapDefinition);

  if (!validation.isValid) {
    addCombatMessage(validation.reason || '');
    return {
      success: false,
      damage: 0,
      targetDefeated: false
    };
  }

  if (attacker.x === undefined || attacker.y === undefined || target.x === undefined || target.y === undefined) {
    return {
      success: false,
      damage: 0,
      targetDefeated: false
    };
  }

  let attack: WeaponAttack | undefined;
  const distance = calculateDistanceBetween(attacker.x, attacker.y, target.x, target.y);
  weapon.attacks.forEach(a => {
    if (distance >= a.minRange && distance <= a.range) {
      attack = a;
    }
  });

  if (!attack) {
    weapon = attacker.getUnarmedWeapon();
    attack = weapon.attacks[0];
  }

  const combatEventData: CombatEventData = {
    attacker,
    target,
    weapon,
    attack,
    mapDefinition
  };

  // Execute unified combat
  const result = executeCombatPhase(combatEventData, allCreatures);

  // Update combat states for all creatures after combat
  updateCombatStates(allCreatures);

  return result;
}

// --- Combat Event Names ---
export const COMBAT_EVENTS = {
  HIT_ROLL: 'onHitRoll',
  DEFEND_ROLL: 'onDefendRoll',
  ATTACK_HIT: 'onAttackHit',
  ATTACK_MISS: 'onAttackMiss',
} as const;

export type CombatEventName = typeof COMBAT_EVENTS[keyof typeof COMBAT_EVENTS];

// --- Combat Event Types ---
export interface CombatEventData {
  attacker: ICreature;
  target: ICreature;
  weapon: BaseWeapon;
  attack: WeaponAttack;
  mapDefinition?: QuestMap;
}

/**
 * Unified combat execution for both melee and ranged combat
 */
function executeCombatPhase(combatEventData: CombatEventData, allCreatures: Creature[]): CombatResult {
  /*if (attacker.x === undefined || attacker.y === undefined || target.x === undefined || target.y === undefined) {
    return {
      success: false,
      damage: 0,
      targetDefeated: false
    };
  }*/

  // === PART 1: TO-HIT ROLL ===
  const toHitResult = combatEventData.attack.type === "melee" ? executeToHitRollMelee(combatEventData, combatEventData.mapDefinition) : executeToHitRollRanged(combatEventData);

  // Consume action (regardless of hit or miss)
  combatEventData.attacker.setRemainingActions(combatEventData.attacker.remainingActions - 1);

  if (!toHitResult.hit && combatEventData.attack.type !== "melee" && toHitResult.attackerRoll.dice.includes(1)) {
    const adjacent = combatEventData.target.getAdjacentEnemies(allCreatures).filter(c => c.size >= combatEventData.target.size);

    const newTarget = getRandomElement(adjacent);
    if (newTarget) {
      combatEventData.target = newTarget;
      toHitResult.hit = true;
      addCombatMessage(`${combatEventData.attacker.name} hits ${newTarget.name} instead!`);
    }
  }
  if (!toHitResult.hit) {
    // Process miss triggers
    const missResult = {
      success: true,
      damage: 0,
      targetDefeated: false
    };

    // Emit attack miss event
    CombatTriggers.processCombatTriggers(COMBAT_EVENTS.ATTACK_MISS, combatEventData, toHitResult.attackerRoll);
    return missResult;
  }

  // Emit attack hit event
  CombatTriggers.processCombatTriggers(COMBAT_EVENTS.ATTACK_HIT, combatEventData, toHitResult.attackerRoll);

  // Process double critical triggers
  if (toHitResult.attackerRoll.criticalSuccess) {
    // Universal rule: Double critical hits apply knocked down status unless target has greater size
    if (combatEventData.target.size <= combatEventData.attacker.size) {
      const knockedDownEffect = STATUS_EFFECT_PRESETS.knockedDown.createEffect();
      combatEventData.target.addStatusEffect(knockedDownEffect);
    }
  }

  let pushbackResult = null;
  let bonusDamage = 0;
  if (combatEventData.attack.type === "melee" && combatEventData.mapDefinition) {
    pushbackResult = pushback(combatEventData.attacker, combatEventData.target, allCreatures, combatEventData.mapDefinition);
    bonusDamage += pushbackResult.bonusDamage;
  }

  // === PART 2: BLOCK ROLL ===
  let blockResult = null;
  if (!toHitResult.defenderRoll?.fumble) {
    blockResult = executeBlockRoll(combatEventData, toHitResult);
    addCombatMessage(blockResult.blockMessage);
  }

  // === PART 3: DAMAGE ROLL ===
  let damage = 0;
  if (!blockResult?.blockSuccess) {
    const damageResult = executeDamageRoll(
      combatEventData,
      toHitResult,
      bonusDamage
    );
    addCombatMessage(damageResult.damageMessage);

    // Apply damage using the proper method
    combatEventData.target.takeDamage(damageResult.damage);
    damage = damageResult.damage;
  } else if (blockResult?.shield) {
    handleShieldBreak(combatEventData, toHitResult, blockResult.shield);
  }

  if (pushbackResult && pushbackResult.position && combatEventData.mapDefinition) {
    applyPushback(combatEventData.attacker, combatEventData.target, pushbackResult.position, combatEventData.mapDefinition, true);
  }

  // Check if target is defeated
  const targetDefeated = combatEventData.target.isDead();

  // Create final result
  const finalResult = {
    success: true,
    damage: damage,
    targetDefeated
  };

  return finalResult;
}

function pushback(attacker: ICreature, target: ICreature, allCreatures: Creature[], mapDefinition: QuestMap): { bonusDamage: number, position?: { x: number, y: number } } {
  if (attacker.size < target.size || !attacker.canPushCreature(target.id)) {
    return { bonusDamage: 0 };
  }
  // Skip pushback if either creature is not on the map (undefined position)
  if (attacker.x === undefined || attacker.y === undefined ||
    target.x === undefined || target.y === undefined) {
    return { bonusDamage: 0 };
  }

  // Calculate direction from attacker to target
  const direction = getDirectionFromTo(attacker.x, attacker.y, target.x, target.y);
  const backArcLeft = (direction + 7) % 8;
  const backArcRight = (direction + 1) % 8;
  // Direction deltas (dx, dy) for each direction
  const directionDeltas = [
    [0, -1],  // N
    [1, -1],  // NE
    [1, 0],   // E
    [1, 1],   // SE
    [0, 1],   // S
    [-1, 1],  // SW
    [-1, 0],  // W
    [-1, -1], // NW
  ];
  // Get possible pushback positions
  const candidateDirs = [direction, backArcLeft, backArcRight];
  const targetDims = target.getDimensions();
  const mapRows = mapDefinition.tiles.length;
  const mapCols = mapDefinition.tiles[0].length;
  const positions = candidateDirs.filter(dir => !diagonalMovementBlocked(target.x!, target.y!, target.x! + directionDeltas[dir][0], target.y! + directionDeltas[dir][1], mapDefinition)).map(dir => {
    const [dx, dy] = directionDeltas[dir];
    const x = target.x! + dx;
    const y = target.y! + dy;
    return {
      x: x,
      y: y,
      dir,
      result: isAreaStandable(x, y, targetDims, true, allCreatures, mapCols, mapRows, mapDefinition)
    };
  });
  const validPositions = positions.filter(r => r.result.isValid);
  if (validPositions.length > 0) {
    // Prioritize straight-line pushback when available
    let chosen;
    const straightLinePosition = validPositions.find(pos => pos.dir === direction);

    if (straightLinePosition) {
      // Use straight-line pushback if available
      chosen = straightLinePosition;
    } else {
      // Fall back to random selection if straight-line is not available
      const idx = Math.floor(Math.random() * validPositions.length);
      chosen = validPositions[idx];
    }
    return { bonusDamage: 0, position: { x: chosen.x, y: chosen.y } };
  } else if (!positions.some(r => !!r.result.blockingCreature)) {
    return { bonusDamage: 1 };
  }
  return { bonusDamage: 0 };
}

function applyPushback(attacker: ICreature, target: ICreature, position: { x: number, y: number }, mapDefinition: QuestMap, takePosition: boolean) {
  if (target.y === undefined || target.x === undefined) {
    return;
  }
  const targetPosition = { x: target.x, y: target.y };
  if (!target.isDead()) {
    target.enterTile(position.x, position.y, mapDefinition);
  }
  if (takePosition) {
    attacker.enterTile(targetPosition.x, targetPosition.y, mapDefinition);
  }
  // Record that this attacker has pushed this target this turn
  attacker.recordPushedCreature(target.id);
}

function handleShieldBreak(combatEventData: CombatEventData, toHitResult: ToHitResult, shield: Shield) {
  let breakShield = false;
  let autoBreak = false;
  if (combatEventData.attack.breaksShieldsOnCritical && toHitResult.attackerRoll.criticalHit) {
    breakShield = true;
    autoBreak = true;
  } else if (combatEventData.attacker.size > 2 && combatEventData.attacker.size > combatEventData.target.size) {
    breakShield = true;
    if (combatEventData.attacker.size > 3 || combatEventData.attack.shieldBreaking) {
      autoBreak = true;
    }
  } else if (combatEventData.attack.shieldBreaking) {
    breakShield = true;
  }
  if(!breakShield) {
    return false;
  }
  let broken = shield.break(combatEventData.target, autoBreak);
  if (broken) {
    combatEventData.target.takeDamage(1);
  }
  return broken
}