import { Creature, Monster, ICreature } from '../creatures/index';
import { AIState, AIDecision, AIContext, AIActionResult, AIBehaviorType } from './types';
import { selectBestTarget, updateTargetInformation } from './targeting';
import { createMovementDecision, updateAIStateAfterMovement } from './movement';
import { shouldFlee, createFleeDecision, updateAIStateAfterAttack, isTargetValid } from './combat';
import { calculateTargetsInRange } from '../utils/combat';
import { canAttackImmediately, isCreatureVisible } from '../utils/pathfinding';
import { validateCombat } from '../validation/combat';
import { executeMovement } from '../utils/movement';
import { CreatureMovement } from '../creatures/movement';
import { AI_MESSAGES, createMovementMessage } from '../utils/messageUtils';
import { createAIDecision } from './helpers';
import creatureServices from '../creatures/services';
import { QuestMap } from '../maps/types';
import { MonsterPreset, MercenaryPreset } from '../creatures/presets/types';
import { EquipmentSystem } from '../items/equipment';

// --- AI Decision Making Logic ---

// --- AI Decision Making Logic ---

/**
 * Check if an AI creature should continue its turn after killing a target
 */
export function shouldContinueTurnAfterKill(
  creature: ICreature,
  allCreatures: ICreature[]
): boolean {
  // Check if the creature has remaining movement
  const hasRemainingMovement = creature.remainingMovement > 0;

  // Check if there are other hostile targets available
  const hasOtherTargets = allCreatures.some(c =>
    c.isAlive() &&
    c.id !== creature.id &&
    creature.isHostileTo(c)
  );

  return hasRemainingMovement && hasOtherTargets;
}

/**
 * Make a decision for an AI creature's turn
 */
export function makeAIDecision(context: AIContext): AIActionResult {
  const { ai, creature, allCreatures, currentTurn, reachableTiles, targetsInRange, mapDefinition } = context;

  // Update AI state with current information
  const updatedAI = updateTargetInformation(ai, creature, allCreatures, mapDefinition, mapDefinition.tiles[0].length, mapDefinition.tiles.length);

  // Check if creature should flee
  if (shouldFlee(updatedAI, creature, allCreatures)) {
    const fleeDecision = createFleeDecision(updatedAI, creature, allCreatures);
    return {
      success: true,
      action: fleeDecision,
      message: AI_MESSAGES.flee(creature.name),
      newState: updatedAI
    };
  }

  // Check if current target is still valid
  let target = updatedAI.currentTarget;
  if (target && !isTargetValid(target, creature)) {
    // Current target is no longer valid (dead or no longer hostile), clear it
    updatedAI.currentTarget = null;
    target = null;

    // If we just killed our target and have remaining movement, select a new target
  }

  // Select best target if we don't have a valid one
  if (!target) {
    target = selectBestTarget(updatedAI, creature, allCreatures, mapDefinition, mapDefinition.tiles[0].length, mapDefinition.tiles.length);
  }

  if (!target) {
    // No target available, wait
    const waitDecision = createAIDecision('wait', { reason: 'No targets available' });

    return {
      success: true,
      action: waitDecision,
      message: AI_MESSAGES.wait(creature.name, 'no targets'),
      newState: updatedAI
    };
  }

  // Check if we can attack the target from current position
  const canAttackNow = canAttackImmediately(creature, target);
  // Get the weapon for validation
  const equipment = new EquipmentSystem(creature.equipment);
  const weapon = equipment.getMainWeapon();
  const attackValidation = canAttackNow && weapon ? validateCombat(creature, target, weapon, allCreatures, mapDefinition) : { isValid: false };

  // For ranged creatures, check if we have line of sight before attacking
  const hasRangedWeapon = creature.equipment.mainHand?.kind === 'ranged_weapon' || creature.equipment.offHand?.kind === 'ranged_weapon';
  const isRangedBehavior = updatedAI.behavior === AIBehaviorType.RANGED;

  if (canAttackNow) {
    if (attackValidation.isValid) {
      if ((hasRangedWeapon || isRangedBehavior) && context.mapDefinition &&
        creature.x !== undefined && creature.y !== undefined) {
        const hasLineOfSight = isCreatureVisible(
          creature.x,
          creature.y,
          target,
          context.mapDefinition.tiles[0].length,
          context.mapDefinition.tiles.length,
          context.mapDefinition,
          {},
          creature,
          allCreatures
        );

        // If we don't have line of sight, try to move instead of attacking
        if (!hasLineOfSight) {
          if (context.reachableTiles.tiles.length > 0) {
            const movementDecision = createMovementDecision(
              updatedAI,
              creature,
              allCreatures,
              context.reachableTiles.tiles,
              context.reachableTiles.costMap,
              target,
              context.mapDefinition
            );

            if (movementDecision) {
              const message = createMovementMessage(creature.name, target.name, updatedAI.currentTarget === null);

              return {
                success: true,
                action: movementDecision,
                message,
                newState: updatedAI
              };
            }
          }
        }
      }

      // Attack from current position - no movement when already in attack range and have line of sight
      const attackDecision = createAIDecision('attack', {
        target,
        priority: 8,
        reason: `Attacking ${target.name}`
      });

      return {
        success: true,
        action: attackDecision,
        message: AI_MESSAGES.attack(creature.name, target.name),
        newState: updatedAI
      };
    } else {
      // If target is in range but we can't attack (e.g., no actions remaining), wait
      const waitDecision = createAIDecision('wait', { reason: 'Target in range but cannot attack' });

      return {
        success: true,
        action: waitDecision,
        message: AI_MESSAGES.waitEngaged(creature.name, target.name),
        newState: updatedAI
      };
    }
  }

  // Can't attack now, but we have a target - try to move toward it
  if (reachableTiles.tiles.length > 0) {
    const movementDecision = createMovementDecision(updatedAI, creature, allCreatures, reachableTiles.tiles, reachableTiles.costMap, target, context.mapDefinition);

    if (movementDecision) {
      const message = createMovementMessage(creature.name, target.name, updatedAI.currentTarget === null);

      return {
        success: true,
        action: movementDecision,
        message,
        newState: updatedAI
      };
    }
  }

  // If no good action is available, wait
  const waitDecision = createAIDecision('wait', { reason: 'No advantageous action available' });

  return {
    success: true,
    action: waitDecision,
    message: AI_MESSAGES.wait(creature.name),
    newState: updatedAI
  };
}

/**
 * Execute an AI decision
 */
export function executeAIDecision(
  decision: AIDecision,
  context: AIContext
): { success: boolean; messages: string[]; newState: AIState; targetDefeated?: boolean } {
  const { ai, creature, allCreatures, currentTurn, reachableTiles, targetsInRange, mapDefinition } = context;

  switch (decision.type) {
    case 'attack':
      if (decision.target) {
        // Perform the attack
        const attackResult = creature.attack(decision.target, allCreatures, mapDefinition);

        // Update AI state
        const newState = updateAIStateAfterAttack(
          ai,
          creature,
          decision.target,
          attackResult.success,
          attackResult.damage
        );

        return {
          success: true,
          messages: attackResult.messages && attackResult.messages.length > 0 ? attackResult.messages : ['Attack completed'],
          newState,
          targetDefeated: attackResult.targetDefeated
        };
      }
      break;

    case 'move':
      if (decision.destination) {
        // Get the actual movement cost and path from the reachable tiles calculation
        const { costMap, pathMap } = creatureServices.getMovementService().getReachableTiles(creature, allCreatures, mapDefinition, mapDefinition.tiles[0].length, mapDefinition.tiles.length);
        console.log(costMap, pathMap);
        const destKey = `${decision.destination.x},${decision.destination.y}`;
        const cost = costMap.get(destKey) ?? Infinity;
        const path = pathMap.get(destKey);

        if (!path) {
          return {
            success: false,
            messages: [`No path found to destination (${decision.destination.x}, ${decision.destination.y})`],
            newState: ai,
            targetDefeated: false
          };
        }

        // Use the same movement validation and execution as heroes
        const moveResult = executeMovement(creature, path, allCreatures, cost, mapDefinition);

        if (moveResult.status === 'success' || moveResult.status === 'partial') {
          // Update AI state with final position (either destination or where they stopped)
          const finalPosition = moveResult.finalPosition || { x: creature.x ?? 0, y: creature.y ?? 0 };
          if (finalPosition.x !== undefined && finalPosition.y !== undefined) {
            const newState = updateAIStateAfterMovement(
              ai,
              creature,
              finalPosition.x,
              finalPosition.y
            );

            let message = AI_MESSAGES.moveToPosition(creature.name, finalPosition.x, finalPosition.y);
            if (moveResult.status === 'partial') {
              message = `${message} (partial: moved ${moveResult.tilesMoved}/${moveResult.totalPathLength} tiles)`;
            }

            return {
              success: true,
              messages: [message],
              newState,
              targetDefeated: false
            };
          }
        } else {
          return {
            success: false,
            messages: [moveResult.message || AI_MESSAGES.cannotMove(creature.name)],
            newState: ai,
            targetDefeated: false
          };
        }
      }
      break;

    case 'flee':
      // For now, fleeing just means ending the turn
      return {
        success: true,
        messages: [AI_MESSAGES.flee(creature.name)],
        newState: ai,
        targetDefeated: false
      };

    case 'wait':
      return {
        success: true,
        messages: [AI_MESSAGES.wait(creature.name)],
        newState: ai,
        targetDefeated: false
      };

    case 'special':
      // Handle special abilities (to be implemented)
      return {
        success: true,
        messages: [AI_MESSAGES.specialAbility(creature.name)],
        newState: ai,
        targetDefeated: false
      };
  }

  return {
    success: false,
    messages: [AI_MESSAGES.unknownAction(decision.type)],
    newState: ai,
    targetDefeated: false
  };
}

/**
 * Create a default AI state for a creature
 */
export function createDefaultAIState(behavior: AIBehaviorType = AIBehaviorType.MELEE): AIState {
  return {
    behavior,
    currentTarget: null,
    lastKnownPlayerPositions: new Map(),
    threatAssessment: new Map(),
    tacticalMemory: {
      lastMove: null,
      lastAttack: null,
      preferredPositions: []
    }
  };
}

/**
 * Create AI state based on creature type and preset
 */
export function createAIStateForCreature(creature: Monster, preset?: MonsterPreset): AIState {
  // Determine behavior based on creature type or preset
  let behavior: AIBehaviorType = AIBehaviorType.MELEE;

  if (preset?.aiBehavior) {
    behavior = preset.aiBehavior as AIBehaviorType;
  }

  const baseState = createDefaultAIState(behavior);

  return {
    ...baseState
  };
}

/**
 * Check if an AI creature should take its turn
 */
export function shouldAITakeTurn(creature: ICreature, allCreatures: ICreature[] = []): boolean {
  const targetsInRange = calculateTargetsInRange(creature, allCreatures);
  return creature.isAlive() &&
    (creature.remainingMovement > 0 ||
      creature.remainingQuickActions > 0 ||
      (creature.remainingActions > 0 && targetsInRange.size > 0));
}