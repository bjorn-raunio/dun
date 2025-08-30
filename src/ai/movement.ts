import { Creature } from '../creatures/index';
import { AIState, AIMovementOption, AIDecision, AIBehaviorType } from './types';
import { isPositionAccessibleWithBounds, calculateDistanceToCreature, calculateDistanceToAttackablePosition, canAttackImmediately } from '../utils/pathfinding';
import { createAIDecision, updateAIStateWithAction } from './helpers';
import { logAI } from '../utils/logging';

// --- AI Movement Logic ---









/**
 * Evaluate a movement option based solely on the movement cost to reach the target
 */
export function evaluateMovementOption(
  x: number,
  y: number,
  cost: number,
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[],
  costMap: Map<string, number>,
  target?: Creature,
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): AIMovementOption {
  const benefits = {
    closerToTarget: false,
    betterPosition: false,
    saferPosition: false,
    tacticalAdvantage: false,
    inAttackRange: false,
    combatBonus: false
  };
  
  const risks = {
    exposedToAttack: false,
    trapped: false,
    isolated: false
  };
  
  let score = 0;
  
  // Only consider the movement cost to reach the target
  if (target) {
    const currentPathDistance = calculateDistanceToAttackablePosition(creature.x, creature.y, target, creature, allCreatures, mapData, cols, rows, mapDefinition);
    const newPathDistance = calculateDistanceToAttackablePosition(x, y, target, creature, allCreatures, mapData, cols, rows, mapDefinition);
    const attackRange = creature.getAttackRange();
    
    // Check if this position puts us in attack range
    if (newPathDistance <= attackRange) {
      benefits.inAttackRange = true;
      score += 100; // High priority for getting into attack range
    }
    
    // Check if this position gets us closer to target
    if (newPathDistance < currentPathDistance) {
      benefits.closerToTarget = true;
      const distanceImprovement = currentPathDistance - newPathDistance;
      score += distanceImprovement * 100; // Much higher weight for getting closer to target
    }
    
      // Don't penalize movement cost if we're getting closer to target
  // The goal is to reach the target with minimal total movement, not minimal immediate movement
  
  // Add a small penalty for positions that are dead ends (limited future movement options)
  if (benefits.closerToTarget && mapData && cols !== undefined && rows !== undefined) {
    const accessibleNeighbors = countAccessibleNeighbors(x, y, allCreatures, mapData, cols, rows, mapDefinition);
    if (accessibleNeighbors <= 2) {
      score -= 10; // Penalty for positions with very limited movement options
    }
  }
  }
  
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
  target: Creature,
  creature: Creature,
  reachableTiles: Array<{ x: number; y: number }>,
  costMap: Map<string, number>,
  allCreatures: Creature[],
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): boolean {
      const destinationPathDistance = calculateDistanceToAttackablePosition(destination.x, destination.y, target, creature, allCreatures, mapData, cols, rows, mapDefinition);
  
  // Check if any other reachable tile is closer to the target
  for (const tile of reachableTiles) {
    // Skip the destination itself
    if (tile.x === destination.x && tile.y === destination.y) {
      continue;
    }
    
          const tilePathDistance = calculateDistanceToAttackablePosition(tile.x, tile.y, target, creature, allCreatures, mapData, cols, rows, mapDefinition);
    
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
  creature: Creature,
  allCreatures: Creature[],
  reachableTiles: Array<{ x: number; y: number }>,
  costMap: Map<string, number>,
  target?: Creature,
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
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
      mapData,
      cols,
      rows,
      mapDefinition
    );
    
         const currentPathDistance = calculateDistanceToAttackablePosition(creature.x, creature.y, target!, creature, allCreatures, mapData, cols, rows, mapDefinition);
     const newPathDistance = calculateDistanceToAttackablePosition(tile.x, tile.y, target!, creature, allCreatures, mapData, cols, rows, mapDefinition);
    logAI(`Option (${tile.x}, ${tile.y}): cost=${cost}, score=${option.score}, closerToTarget=${option.benefits.closerToTarget}, pathDistance=${newPathDistance} (current=${currentPathDistance})`);
    
    options.push(option);
  }
  
  // Sort by score (highest first)
  options.sort((a, b) => b.score - a.score);
  
  logAI(`Top 3 options:`, options.slice(0, 3).map((option, i) => ({
    rank: i + 1,
    x: option.x,
    y: option.y,
    score: option.score,
    closerToTarget: option.benefits.closerToTarget
  })));
  
  // If we have a target, validate that the best option is actually the closest
  if (target && options.length > 0) {
    const bestOption = options[0];
    
    // If the best option claims to get us closer to target, validate it
    if (bestOption.benefits.closerToTarget) {
             const isValidClosest = validateClosestDestination(bestOption, target, creature, reachableTiles, costMap, allCreatures, mapData, cols, rows, mapDefinition);
      
      if (!isValidClosest) {
        logAI(`WARNING: Best option is not actually closest to target!`);
        // Find the actual closest option
        let actualClosestOption: AIMovementOption | null = null;
        let closestDistance = Infinity;
        
        for (const option of options) {
                             const pathDistance = calculateDistanceToAttackablePosition(option.x, option.y, target, creature, allCreatures, mapData, cols, rows, mapDefinition);
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
  creature: Creature,
  allCreatures: Creature[],
  reachableTiles: Array<{ x: number; y: number }>,
  costMap: Map<string, number>,
  target?: Creature,
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): boolean {
  // If no target, movement is less important
  if (!target) {
    return false;
  }
  
  // Check if we can attack immediately from current position
  const canAttackNow = canAttackImmediately(creature, target);
  
  // If we can't attack now, we should try to move to get into attack range
  if (!canAttackNow) {
    return true;
  }
  
  // If we can attack now, check if we should still move for better positioning
  const hasRangedWeapon = creature.equipment.mainHand?.kind === 'ranged_weapon' || creature.equipment.offHand?.kind === 'ranged_weapon';
  const isRangedBehavior = ai.behavior === AIBehaviorType.RANGED;
  
  if (hasRangedWeapon || isRangedBehavior) {
    // For ranged weapons, check if we're at optimal range
    const currentDistance = Math.max(
      Math.abs(target.x - creature.x),
      Math.abs(target.y - creature.y)
    );
    const attackRange = creature.getAttackRange();
    
    // If we're too close (within 80% of max range), consider moving to a better position
    if (currentDistance < attackRange * 0.8) {
      // Check if there's a better position available
      const betterPositionAvailable = reachableTiles.some(tile => {
        const newDistance = Math.max(
          Math.abs(target.x - tile.x),
          Math.abs(target.y - tile.y)
        );
        // Prefer positions that are closer to optimal range
        return newDistance >= attackRange * 0.8 && newDistance <= attackRange;
      });
      
      if (betterPositionAvailable) {
        return true;
      }
    }
  }
  
  // If we can attack now and we're well-positioned, don't move
  return false;
}

/**
 * Create a movement decision
 */
export function createMovementDecision(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[],
  reachableTiles: Array<{ x: number; y: number }>,
  costMap: Map<string, number>,
  target?: Creature,
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): AIDecision | null {
  if (!shouldMove(ai, creature, allCreatures, reachableTiles, costMap, target, mapData, cols, rows, mapDefinition)) {
    return null;
  }
  
  const bestMove = findBestMovement(ai, creature, allCreatures, reachableTiles, costMap, target, mapData, cols, rows, mapDefinition);
  
  if (!bestMove) {
    return null;
  }
  
  let reason = `Moving to (${bestMove.x}, ${bestMove.y})`;
  
  if (bestMove.benefits.closerToTarget && target) {
    reason += ` to get closer to ${target.name}`;
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
  creature: Creature,
  newX: number,
  newY: number
): AIState {
  return updateAIStateWithAction(ai, {
    type: 'move',
    destination: { x: newX, y: newY }
  });
}



/**
 * Count accessible neighboring tiles for a position
 */
function countAccessibleNeighbors(
  x: number,
  y: number,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  cols: number,
  rows: number,
  mapDefinition?: any
): number {
  let count = 0;
  
  // Check all 8 adjacent tiles using direction constants
  // [dx, dy] for each direction: South, East, North, West, Southeast, Southwest, Northwest, Northeast
  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0], // Cardinal directions
    [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonal directions
  ];
  
  for (const [dx, dy] of directions) {
    const neighborX = x + dx;
    const neighborY = y + dy;
    
    if (isPositionAccessibleWithBounds(neighborX, neighborY, allCreatures, mapData, cols, rows, mapDefinition)) {
      count++;
    }
  }
  
  return count;
}



