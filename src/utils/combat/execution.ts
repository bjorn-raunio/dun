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
import { RangedWeapon } from '../../items/types';
import { CombatTriggers } from './combatTriggers';
import { diagonalMovementBlocked } from '../movementCost';

// --- Combat Execution ---
// Streamlined combat execution with optimized object creation and message building

/**
 * Execute a combat attack between two creatures
 */
export function executeCombat(
  attacker: Creature,
  target: Creature,
  allCreatures: Creature[],
  mapDefinition?: any,
  mapData?: { tiles: string[][] }
): CombatResult {
  // Face the target when attacking (only if both creatures are on the map)
  if (attacker.x !== undefined && attacker.y !== undefined &&
    target.x !== undefined && target.y !== undefined) {
    attacker.faceTowards(target.x, target.y);
  }

  // Determine the weapon being used for the attack
  const equipment = new EquipmentSystem(attacker.equipment);
  const weapon = equipment.getMainWeapon();

  if (!weapon) {
    return {
      success: false,
      damage: 0,
      targetDefeated: false,
      messages: [`${attacker.name} has no weapon equipped.`]
    };
  }

  // Use consolidated validation
  const validation = validateCombat(attacker, target, weapon, allCreatures, mapDefinition, mapData);

  if (!validation.isValid) {
    return {
      success: false,
      damage: 0,
      targetDefeated: false,
      messages: [validation.reason || ``]
    };
  }

  // Check if this is a ranged attack
  const isRanged = weapon instanceof RangedWeapon;

  // Execute unified combat
  const result = executeCombatPhase(attacker, target, isRanged, allCreatures, mapDefinition, mapData);

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
  isRanged: boolean;
  messages: string[];
}

/**
 * Unified combat execution for both melee and ranged combat
 */
function executeCombatPhase(
  attacker: Creature,
  target: Creature,
  isRanged: boolean,
  allCreatures: Creature[],
  mapDefinition?: QuestMap,
  mapData?: { tiles: string[][] }
): CombatResult {
  const combatEventData: CombatEventData = {
    attacker,
    target,
    isRanged,
    messages: []
  };

  // === PART 1: TO-HIT ROLL ===
  const toHitResult = isRanged
    ? executeToHitRollRanged(combatEventData)
    : executeToHitRollMelee(combatEventData, mapDefinition);
  combatEventData.messages.push(toHitResult.toHitMessage);

  // Consume action (regardless of hit or miss)
  attacker.setRemainingActions(attacker.remainingActions - 1);

  if (!toHitResult.hit) {
    // Process miss triggers
    const missResult = {
      success: true,
      damage: 0,
      targetDefeated: false,
      messages: combatEventData.messages
    };

    // Emit attack miss event
    CombatTriggers.processCombatTriggers(COMBAT_EVENTS.ATTACK_MISS, combatEventData);
    return missResult;
  }

  // Process hit-related triggers
  const hitResult = {
    success: true,
    damage: 0,
    targetDefeated: false,
    messages: combatEventData.messages
  };

  // Emit attack hit event
  CombatTriggers.processCombatTriggers(COMBAT_EVENTS.ATTACK_HIT, combatEventData);

  // Process double critical triggers
  if (toHitResult.attackerDoubleCritical) {
    // Universal rule: Double critical hits apply knocked down status unless target has greater size
    if (target.size <= attacker.size) {
      const knockedDownEffect = STATUS_EFFECT_PRESETS.knockedDown.createEffect();
      applyStatusEffect(target, knockedDownEffect, (msg: string) => {
        if (hitResult && hitResult.messages) {
          hitResult.messages.push(msg);
        }
      });
    }
  }

  let bonusDamage = 0;
  if (!isRanged) {
    if(!pushback(attacker, target, allCreatures, true, mapData, mapDefinition)) {
      bonusDamage++;
    }
  }

  // === PART 2: BLOCK ROLL ===
  const blockResult = executeBlockRoll(attacker, target, toHitResult.attackerDoubleCritical, toHitResult.criticalHit);
  combatEventData.messages.push(blockResult.blockMessage);

  if (blockResult.blockSuccess) {
    // Shield blocked the attack - no damage
    return {
      success: true,
      damage: 0,
      targetDefeated: false,
      messages: combatEventData.messages
    };
  }

  // === PART 3: DAMAGE ROLL ===
  const damageResult = executeDamageRoll(
    attacker,
    target,
    toHitResult.attackerDoubleCritical,
    toHitResult.criticalHit,
    isRanged,
    bonusDamage
  );
  combatEventData.messages.push(damageResult.damageMessage);

  // Apply damage using the proper method
  target.takeDamage(damageResult.damage);

  // Check if target is defeated
  const targetDefeated = target.isDead();

  // Create final result
  const finalResult = {
    success: true,
    damage: damageResult.damage,
    targetDefeated,
    messages: combatEventData.messages.filter(message => !!message)
  };

  return finalResult;
}

function pushback(attacker: Creature, target: Creature, allCreatures: Creature[], takePosition: boolean, mapData?: { tiles: string[][] }, mapDefinition?: QuestMap) {
  if (attacker.size >= target.size && mapData) {
    if (!target.isDead()) {
      // Check if this attacker can push this target this turn
      if (!attacker.canPushCreature(target.id)) {
        return; // Cannot push this target again this turn
      }
      
      // Skip pushback if either creature is not on the map (undefined position)
      if (attacker.x === undefined || attacker.y === undefined ||
        target.x === undefined || target.y === undefined) {
        return;
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
      const mapRows = mapData.tiles.length;
      const mapCols = mapData.tiles[0].length;
      const positions = candidateDirs.filter(dir => !diagonalMovementBlocked(target.x!, target.y!, target.x! + directionDeltas[dir][0], target.y! + directionDeltas[dir][1], mapDefinition)).map(dir => {
        const [dx, dy] = directionDeltas[dir];
        const x = target.x! + dx;
        const y = target.y! + dy;
        return {
          x: x,
          y: y,
          dir,
          result: isAreaStandable(x, y, targetDims, true, allCreatures, mapCols, mapRows, mapData, mapDefinition)
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
        
        if (takePosition) {
          attacker.x = target.x!;
          attacker.y = target.y!;
        }
        target.x = chosen.x;
        target.y = chosen.y;
        
        // Record that this attacker has pushed this target this turn
        attacker.recordPushedCreature(target.id);
      } else if(!positions.some(r => !!r.result.blockingCreature)) {        
        return false;
      }
    } else if (takePosition) {
      attacker.x = target.x!;
      attacker.y = target.y!;
    }
  }
  return true;
}
