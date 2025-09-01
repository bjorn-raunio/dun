import { Creature } from '../../creatures/index';
import { EquipmentSystem } from '../../items/equipment';
import { validateCombat } from '../../validation/combat';
import { updateCombatStates } from '../combatStateUtils';
import { CombatResult } from './types';
import { CombatSkillTriggerManager } from '../../skills';
import { applyStatusEffect, STATUS_EFFECT_PRESETS } from '../../statusEffects';
import { logCombat } from '../logging';
import {
  executeToHitRollMelee,
  executeToHitRollRanged,
  executeBlockRoll,
  executeDamageRoll
} from './phases';
import { getDirectionFromTo } from '../geometry';
import { isAreaStandable } from '../pathfinding/helpers';
import { rollXd6 } from '../dice';
import { DIRECTIONS } from '../constants';
import { MapDefinition } from '../../maps/types';
import { RangedWeapon } from '../../items/types';

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

/**
 * Unified combat execution for both melee and ranged combat
 */
function executeCombatPhase(
  attacker: Creature,
  target: Creature,
  isRanged: boolean,
  allCreatures: Creature[],
  mapDefinition?: MapDefinition,
  mapData?: { tiles: string[][] }
): CombatResult {
  const messages = [];
  // === PART 1: TO-HIT ROLL ===
  const toHitResult = isRanged
    ? executeToHitRollRanged(attacker, target)
    : executeToHitRollMelee(attacker, target, mapDefinition);
  messages.push(toHitResult.toHitMessage);

  // Consume action (regardless of hit or miss)
  attacker.setRemainingActions(attacker.remainingActions - 1);

  if (!toHitResult.hit) {
    // Process miss triggers
    const missResult = {
      success: true,
      damage: 0,
      targetDefeated: false,
      messages: messages
    };

    CombatSkillTriggerManager.processAttackMiss(attacker, target, missResult);
    return missResult;
  }

  // Process hit-related triggers
  const hitResult = {
    success: true,
    damage: 0,
    targetDefeated: false,
    messages: messages
  };

  CombatSkillTriggerManager.processAttackHit(attacker, target, hitResult);

  // Process critical hit triggers
  if (toHitResult.criticalHit) {
    CombatSkillTriggerManager.processCriticalHit(attacker, target, hitResult);
  }

  // Process double critical triggers
  if (toHitResult.attackerDoubleCritical) {
    CombatSkillTriggerManager.processDoubleCritical(attacker, target, hitResult);

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

  // Process double result triggers (any doubles: 2&2, 3&3, 4&4, 5&5, 6&6)
  if (toHitResult.attackerDice) {
    CombatSkillTriggerManager.processDoubleResultFromDice(attacker, target, hitResult, toHitResult.attackerDice);
  }

  // === PART 2: BLOCK ROLL ===
  const blockResult = executeBlockRoll(attacker, target, toHitResult.attackerDoubleCritical, toHitResult.criticalHit);
  messages.push(blockResult.blockMessage);

  if (blockResult.blockSuccess) {
    // Shield blocked the attack - no damage
    return {
      success: true,
      damage: 0,
      targetDefeated: false,
      messages: messages
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
  messages.push(damageResult.damageMessage);

  // Apply damage using the proper method
  target.takeDamage(damageResult.damage);

  if (!isRanged) {
    pushback(attacker, target, allCreatures, true, mapData, mapDefinition);
  }

  // Check if target is defeated
  const targetDefeated = target.isDead();

  // Create final result
  const finalResult = {
    success: true,
    damage: damageResult.damage,
    targetDefeated,
    messages: messages.filter(message => !!message)
  };

  // Process target defeated triggers if applicable
  if (targetDefeated) {
    CombatSkillTriggerManager.processTargetDefeated(attacker, target, finalResult);
  }

  return finalResult;
}

function pushback(attacker: Creature, target: Creature, allCreatures: Creature[], takePosition: boolean, mapData?: { tiles: string[][] }, mapDefinition?: MapDefinition) {
  if (attacker.size >= target.size && mapData) {
    if (!target.isDead()) {
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
      const validPositions = candidateDirs.map(dir => {
        const [dx, dy] = directionDeltas[dir];
        return {
          x: target.x! + dx,
          y: target.y! + dy,
          dir
        };
      }).filter(pos =>
        isAreaStandable(
          pos.x,
          pos.y,
          targetDims,
          true,
          allCreatures,
          mapCols,
          mapRows,
          mapData,
          mapDefinition
        )
      );
      if (validPositions.length > 0) {
        // Pick one at random
        const idx = Math.floor(Math.random() * validPositions.length);
        const chosen = validPositions[idx];
        if (takePosition) {
          attacker.x = target.x!;
          attacker.y = target.y!;
        }
        target.x = chosen.x;
        target.y = chosen.y;
      }
    } else if (takePosition) {
      attacker.x = target.x!;
      attacker.y = target.y!;
    }
  }
}