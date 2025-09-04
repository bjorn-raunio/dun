import { Creature } from '../../creatures/index';
import { EquipmentSystem } from '../../items/equipment';
import { validateCombat } from '../../validation/combat';
import { updateCombatStates } from '../combatStateUtils';
import { CombatResult } from './types';
import { applyStatusEffect, STATUS_EFFECT_PRESETS } from '../../statusEffects';
import {
  executeToHitRollMelee,
  executeToHitRollRanged,
  executeBlockRoll,
  executeDamageRoll
} from './phases';
import { getDirectionFromTo } from '../geometry';
import { isAreaStandable } from '../pathfinding/helpers';
import { QuestMap } from '../../maps/types';
import { RangedWeapon, Weapon } from '../../items/types';
import { CombatTriggers } from './combatTriggers';
import { diagonalMovementBlocked } from '../movement';
import { addCombatMessage } from '../messageSystem';

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
  const equipment = new EquipmentSystem(attacker.equipment);
  const weapon = offhand ? equipment.getOffHandWeapon() : equipment.getMainWeapon();

  if (!weapon) {
    addCombatMessage(`${attacker.name} has no weapon equipped.`);
    return {
      success: false,
      damage: 0,
      targetDefeated: false
    };
  }

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

  // Execute unified combat
  const result = executeCombatPhase(attacker, target, weapon, allCreatures, mapDefinition);

  // Update combat states for all creatures after combat
  updateCombatStates(allCreatures);

  return result;
}

// --- Combat Event Names ---
export const COMBAT_EVENTS = {
  ATTACK_HIT: 'onAttackHit',
  ATTACK_MISS: 'onAttackMiss',
  DOUBLE_RESULT: 'onDoubleResult'
} as const;

export type CombatEventName = typeof COMBAT_EVENTS[keyof typeof COMBAT_EVENTS];

// --- Combat Event Types ---
export interface CombatEventData {
  attacker: Creature;
  target: Creature;
  weapon: Weapon | RangedWeapon;
  isRanged: boolean;
  mapDefinition?: QuestMap;
}

/**
 * Unified combat execution for both melee and ranged combat
 */
function executeCombatPhase(
  attacker: Creature,
  target: Creature,
  weapon: Weapon | RangedWeapon,
  allCreatures: Creature[],
  mapDefinition: QuestMap
): CombatResult {
  // Determine if this is a ranged attack from the weapon
  const isRanged = weapon instanceof RangedWeapon;
  
  const combatEventData: CombatEventData = {
    attacker,
    target,
    weapon,
    isRanged,
    mapDefinition
  };

  // === PART 1: TO-HIT ROLL ===
  const toHitResult = isRanged
    ? executeToHitRollRanged(combatEventData)
    : executeToHitRollMelee(combatEventData, mapDefinition);
  addCombatMessage(toHitResult.toHitMessage);

  // Consume action (regardless of hit or miss)
  attacker.setRemainingActions(attacker.remainingActions - 1);

  if (!toHitResult.hit) {
    // Process miss triggers
    const missResult = {
      success: true,
      damage: 0,
      targetDefeated: false
    };

    // Emit attack miss event
    CombatTriggers.processCombatTriggers(COMBAT_EVENTS.ATTACK_MISS, combatEventData);
    return missResult;
  }

  // Emit attack hit event
  CombatTriggers.processCombatTriggers(COMBAT_EVENTS.ATTACK_HIT, combatEventData);

  // Process double critical triggers
  if (toHitResult.attackerDoubleCritical) {
    // Universal rule: Double critical hits apply knocked down status unless target has greater size
    if (target.size <= attacker.size) {
      const knockedDownEffect = STATUS_EFFECT_PRESETS.knockedDown.createEffect();
      applyStatusEffect(target, knockedDownEffect);
    }
  }

  let pushbackResult = null;
  let bonusDamage = 0;
  if (!isRanged) {
    pushbackResult = pushback(attacker, target, allCreatures, mapDefinition);
    bonusDamage += pushbackResult.bonusDamage;
  }

  // === PART 2: BLOCK ROLL ===
  const blockResult = executeBlockRoll(attacker, target, toHitResult.attackerDoubleCritical, toHitResult.criticalHit);
  addCombatMessage(blockResult.blockMessage);

  if (blockResult.blockSuccess) {
    // Shield blocked the attack - no damage
    return {
      success: true,
      damage: 0,
      targetDefeated: false
    };
  }

  // === PART 3: DAMAGE ROLL ===
  const damageResult = executeDamageRoll(
    attacker,
    target,
    weapon,
    toHitResult.attackerDoubleCritical,
    toHitResult.criticalHit,
    isRanged,
    bonusDamage
  );
  addCombatMessage(damageResult.damageMessage);

  // Apply damage using the proper method
  const damageApplied = target.takeDamage(damageResult.damage);

  if (pushbackResult && pushbackResult.position) {
    applyPushback(attacker, target, pushbackResult.position, mapDefinition, true);
  }

  // Check if target is defeated
  const targetDefeated = target.isDead();

  // Create final result
  const finalResult = {
    success: true,
    damage: damageResult.damage,
    targetDefeated
  };

  return finalResult;
}

function pushback(attacker: Creature, target: Creature, allCreatures: Creature[], mapDefinition: QuestMap): { bonusDamage: number, position?: { x: number, y: number } } {
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

function applyPushback(attacker: Creature, target: Creature, position: { x: number, y: number }, mapDefinition: QuestMap, takePosition: boolean) {
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