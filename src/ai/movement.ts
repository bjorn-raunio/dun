import { ICreature } from '../creatures/index';
import { AIState, AIMovementOption, AIDecision, AIBehaviorType } from './types';
import { calculateDistanceToAttackablePosition, canAttackImmediately, isCreatureVisible } from '../utils/pathfinding';
import { getEngagingCreaturesAtPosition } from '../utils/zoneOfControl';
import { createAIDecision, updateAIStateWithAction } from './helpers';
import { logAI } from '../utils/logging';
import { QuestMap } from '../maps/types';

/**
 * Evaluate a movement option based solely on the movement cost to reach the target
 */
export function evaluateMovementOption(
  x: number,
  y: number,
  cost: number,
  ai: AIState,
  creature: ICreature,
  allCreatures: ICreature[],
  costMap: Map<string, number>,
  target?: ICreature,
  mapDefinition?: QuestMap
): AIMovementOption {
  const benefits = {
    closerToTarget: false,
    betterPosition: false,
    saferPosition: false,
    tacticalAdvantage: false,
    inAttackRange: false,
    combatBonus: false,
    hasLineOfSight: false
  };

  const risks = {
    exposedToAttack: false,
    trapped: false,
    isolated: false
  };

  let score = 0;

  return {
    x,
    y,
    cost,
    benefits,
    risks,
    score: Math.max(0, score)
  };
}

/**
 * Validate that a movement destination is actually the closest to the target
 * when considering terrain movement costs
 */
function validateClosestDestination(
  destination: AIMovementOption,
  target: ICreature,
  creature: ICreature,
  reachableTiles: Array<{ x: number; y: number }>,
  costMap: Map<string, number>,
  allCreatures: ICreature[],
  mapDefinition: QuestMap,
  cols: number,
  rows: number
): boolean {
  const destinationPathDistance = calculateDistanceToAttackablePosition(destination.x, destination.y, target, creature, allCreatures, cols, rows, mapDefinition);

  // Check if any other reachable tile is closer to the target
  for (const tile of reachableTiles) {
    // Skip the destination itself
    if (tile.x === destination.x && tile.y === destination.y) {
      continue;
    }

    const tilePathDistance = calculateDistanceToAttackablePosition(tile.x, tile.y, target, creature, allCreatures, cols, rows, mapDefinition);

    // If we find a tile that's significantly closer (with some tolerance for equal distances)
    if (tilePathDistance < destinationPathDistance - 0.5) {
      return false; // This destination is not the closest
    }
  }

  return true; // This destination is the closest (or tied for closest)
}

/**
 * Find the best movement option for an AI creature
 */
export function findBestMovement(
  ai: AIState,
  creature: ICreature,
  allCreatures: ICreature[],
  reachableTiles: Array<{ x: number; y: number }>,
  costMap: Map<string, number>,
  target?: ICreature,
  mapDefinition?: QuestMap
): AIMovementOption | null {
  if (reachableTiles.length === 0) {
    return null;
  }

  logAI(`AI Movement Decision for ${creature.name} at (${creature.x}, ${creature.y})`, { target: target ? { name: target.name, x: target.x, y: target.y } : null });

  const options: AIMovementOption[] = [];

  for (const tile of reachableTiles) {
    // Skip current position
    if (tile.x === creature.x && tile.y === creature.y) {
      continue;
    }

    // Get the actual movement cost from the cost map
    const cost = costMap.get(`${tile.x},${tile.y}`) ?? Infinity;

    const option = evaluateMovementOption(
      tile.x,
      tile.y,
      cost,
      ai,
      creature,
      allCreatures,
      costMap,
      target,
      mapDefinition
    );

    const currentPathDistance = creature.x !== undefined && creature.y !== undefined && mapDefinition ? 
      calculateDistanceToAttackablePosition(creature.x, creature.y, target!, creature, allCreatures, mapDefinition.tiles[0].length, mapDefinition.tiles.length, mapDefinition) : Infinity;
    const newPathDistance = mapDefinition ? calculateDistanceToAttackablePosition(tile.x, tile.y, target!, creature, allCreatures, mapDefinition.tiles[0].length, mapDefinition.tiles.length, mapDefinition) : Infinity;
    logAI(`Option (${tile.x}, ${tile.y}): cost=${cost}, score=${option.score}, closerToTarget=${option.benefits.closerToTarget}, hasLineOfSight=${option.benefits.hasLineOfSight}, pathDistance=${newPathDistance} (current=${currentPathDistance}), movementEfficiency=${cost <= 2 ? 'HIGH' : cost <= 4 ? 'MEDIUM' : 'LOW'}`);

    options.push(option);
  }

  // Sort by score (highest first)
  options.sort((a, b) => b.score - a.score);

  logAI(`Top 3 options:`, options.slice(0, 3).map((option, i) => ({
    rank: i + 1,
    x: option.x,
    y: option.y,
    score: option.score,
    closerToTarget: option.benefits.closerToTarget,
    hasLineOfSight: option.benefits.hasLineOfSight,
    movementCost: option.cost,
    efficiency: option.cost <= 2 ? 'HIGH' : option.cost <= 4 ? 'MEDIUM' : 'LOW'
  })));

  // If we have a target, validate that the best option is actually the closest
  if (target && options.length > 0) {
    const bestOption = options[0];

    // If the best option claims to get us closer to target, validate it
    if (bestOption.benefits.closerToTarget && mapDefinition) {
      const isValidClosest = validateClosestDestination(bestOption, target, creature, reachableTiles, costMap, allCreatures, mapDefinition, mapDefinition.tiles[0].length, mapDefinition.tiles.length);

      if (!isValidClosest) {
        logAI(`WARNING: Best option is not actually closest to target!`);
        // Find the actual closest option
        let actualClosestOption: AIMovementOption | null = null;
        let closestDistance = Infinity;

        for (const option of options) {
          const pathDistance = calculateDistanceToAttackablePosition(option.x, option.y, target, creature, allCreatures, mapDefinition.tiles[0].length, mapDefinition.tiles.length, mapDefinition);
          if (pathDistance < closestDistance) {
            closestDistance = pathDistance;
            actualClosestOption = option;
          }
        }

        // If we found a closer option, use it instead
        if (actualClosestOption && actualClosestOption !== bestOption) {
          logAI(`Correcting: Using actually closest option (${actualClosestOption.x}, ${actualClosestOption.y}) instead of (${bestOption.x}, ${bestOption.y})`);
          // Re-evaluate the closest option with a bonus for being actually closest
          const reEvaluatedOption = {
            ...actualClosestOption,
            score: actualClosestOption.score + 25, // Bonus for being actually closest
            benefits: {
              ...actualClosestOption.benefits,
              closerToTarget: true
            }
          };

          // Replace the best option with the validated closest option
          options[0] = reEvaluatedOption;
        }
      }
    }
  }

  const finalChoice = options.length > 0 ? options[0] : null;
  if (finalChoice) {
    logAI(`Final choice: (${finalChoice.x}, ${finalChoice.y}) with score ${finalChoice.score}`);
  }

  return finalChoice;
}

/**
 * Decide whether to move or stay in place
 */
export function shouldMove(
  ai: AIState,
  creature: ICreature,
  allCreatures: ICreature[],
  reachableTiles: Array<{ x: number; y: number }>,
  costMap: Map<string, number>,
  target?: ICreature,
  mapDefinition?: QuestMap
): boolean {
  // If no target, movement is less important
  if (!target) {
    return false;
  }

  // If we can attack now and we're well-positioned, don't move
  return false;
}

/**
 * Create a movement decision
 */
export function createMovementDecision(
  ai: AIState,
  creature: ICreature,
  allCreatures: ICreature[],
  reachableTiles: Array<{ x: number; y: number }>,
  costMap: Map<string, number>,
  target?: ICreature,
  mapDefinition?: QuestMap
): AIDecision | null {
  if (!shouldMove(ai, creature, allCreatures, reachableTiles, costMap, target, mapDefinition)) {
    return null;
  }

  const bestMove = findBestMovement(ai, creature, allCreatures, reachableTiles, costMap, target, mapDefinition);

  if (!bestMove) {
    return null;
  }

  let reason = `Moving to (${bestMove.x}, ${bestMove.y})`;

  if (bestMove.benefits.hasLineOfSight && target) {
    const efficiency = bestMove.cost <= 2 ? 'efficiently' : bestMove.cost <= 4 ? 'moderately' : 'with effort';
    reason += ` to gain line of sight to ${target.name} ${efficiency}`;
  } else if (bestMove.benefits.closerToTarget && target) {
    const efficiency = bestMove.cost <= 2 ? 'efficiently' : bestMove.cost <= 4 ? 'moderately' : 'with effort';
    reason += ` to get closer to ${target.name} ${efficiency}`;
  } else if (bestMove.benefits.tacticalAdvantage) {
    reason += ` for tactical advantage`;
  } else if (bestMove.benefits.saferPosition) {
    reason += ` for better positioning`;
  } else {
    reason += ` to reposition`;
  }

  return createAIDecision('move', {
    destination: { x: bestMove.x, y: bestMove.y },
    priority: bestMove.score,
    reason
  });
}

/**
 * Update AI state after movement
 */
export function updateAIStateAfterMovement(
  ai: AIState,
  creature: ICreature,
  newX: number,
  newY: number
): AIState {
  return updateAIStateWithAction(ai, {
    type: 'move',
    destination: { x: newX, y: newY }
  });
}
