import { Creature } from '../creatures/index';
import { AIState, AIMovementOption, AIDecision, AIBehaviorType } from './types';
import { chebyshevDistance } from '../utils/geometry';

// --- AI Movement Logic ---

/**
 * Evaluate a movement option for tactical benefits and risks
 */
export function evaluateMovementOption(
  x: number,
  y: number,
  cost: number,
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[],
  target?: Creature
): AIMovementOption {
  const benefits = {
    closerToTarget: false,
    betterPosition: false,
    saferPosition: false,
    tacticalAdvantage: false
  };
  
  const risks = {
    exposedToAttack: false,
    trapped: false,
    isolated: false
  };
  
  let score = 0;
  
  // Check if this position gets us closer to target
  if (target) {
    const currentDistance = chebyshevDistance(creature.x, creature.y, target.x, target.y);
    const newDistance = chebyshevDistance(x, y, target.x, target.y);
    
    if (newDistance < currentDistance) {
      benefits.closerToTarget = true;
      score += (currentDistance - newDistance) * 2;
    }
  }
  
  // Check tactical positioning
  const enemiesNearby = allCreatures.filter(c => 
    c.isAlive() && 
    c.id !== creature.id && 
    creature.isHostileTo(c) &&
    chebyshevDistance(x, y, c.x, c.y) <= 3
  );
  
  const alliesNearby = allCreatures.filter(c => 
    c.isAlive() && 
    c.id !== creature.id && 
    creature.isFriendlyTo(c) &&
    chebyshevDistance(x, y, c.x, c.y) <= 3
  );
  
  // Evaluate safety
  if (enemiesNearby.length === 0) {
    benefits.saferPosition = true;
    score += 3;
  } else if (enemiesNearby.length === 1) {
    // One enemy nearby might be manageable
    score += 1;
  } else {
    // Multiple enemies nearby is risky
    risks.exposedToAttack = true;
    score -= enemiesNearby.length * 2;
  }
  
  // Check for tactical advantages
  if (target && chebyshevDistance(x, y, target.x, target.y) <= creature.getAttackRange()) {
    benefits.tacticalAdvantage = true;
    score += 5;
  }
  
  // Check for flanking opportunities
  if (target && alliesNearby.length > 0) {
    const allyDistances = alliesNearby.map(a => chebyshevDistance(a.x, a.y, target!.x, target!.y));
    const myDistance = chebyshevDistance(x, y, target.x, target.y);
    
    if (allyDistances.some(d => d <= 2) && myDistance <= 2) {
      benefits.tacticalAdvantage = true;
      score += 3; // Flanking bonus
    }
  }
  
  // Check for isolation
  if (alliesNearby.length === 0 && enemiesNearby.length > 1) {
    risks.isolated = true;
    score -= 4;
  }
  
  // Check for being trapped
  const escapeRoutes = allCreatures.filter(c => 
    c.isAlive() && 
    chebyshevDistance(x, y, c.x, c.y) <= 1
  ).length;
  
  if (escapeRoutes <= 1) {
    risks.trapped = true;
    score -= 3;
  }
  
  // Adjust score based on behavior
  switch (ai.behavior) {
    case AIBehaviorType.MELEE:
      if (benefits.closerToTarget) score += 3;
      if (benefits.tacticalAdvantage) score += 2;
      if (risks.exposedToAttack) score -= 1; // Less concerned about exposure
      break;
    case AIBehaviorType.RANGED:
      if (benefits.saferPosition) score += 4;
      if (benefits.tacticalAdvantage) score += 2;
      if (risks.exposedToAttack) score -= 3;
      if (risks.isolated) score -= 1;
      break;
    case AIBehaviorType.ANIMAL:
      if (benefits.closerToTarget) score += 2;
      if (benefits.tacticalAdvantage) score += 1;
      if (risks.exposedToAttack) score -= 2;
      // Animals are less concerned about isolation
      break;
  }
  
  // Consider movement cost
  score -= cost * 0.5;
  
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
 * Find the best movement option for an AI creature
 */
export function findBestMovement(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[],
  reachableTiles: Array<{ x: number; y: number }>,
  target?: Creature
): AIMovementOption | null {
  if (reachableTiles.length === 0) {
    return null;
  }
  
  const options: AIMovementOption[] = [];
  
  for (const tile of reachableTiles) {
    // Skip current position
    if (tile.x === creature.x && tile.y === creature.y) {
      continue;
    }
    
    // Calculate movement cost (simplified)
    const cost = chebyshevDistance(creature.x, creature.y, tile.x, tile.y);
    
    const option = evaluateMovementOption(
      tile.x,
      tile.y,
      cost,
      ai,
      creature,
      allCreatures,
      target
    );
    
    options.push(option);
  }
  
  // Sort by score (highest first)
  options.sort((a, b) => b.score - a.score);
  
  return options.length > 0 ? options[0] : null;
}

/**
 * Decide whether to move or stay in place
 */
export function shouldMove(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[],
  reachableTiles: Array<{ x: number; y: number }>,
  target?: Creature
): boolean {
  // If no target, movement is less important
  if (!target) {
    return Math.random() < 0.3; // 30% chance to move randomly
  }
  
  // Check if we're already in a good position
  const currentDistance = chebyshevDistance(creature.x, creature.y, target.x, target.y);
  const inRange = currentDistance <= creature.getAttackRange();
  
  // If we're not in range, we should definitely try to move
  if (!inRange) {
    return true;
  }
  
  // If we are in range, movement might not be necessary
  return Math.random() < 0.2; // 20% chance to reposition
}

/**
 * Create a movement decision
 */
export function createMovementDecision(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[],
  reachableTiles: Array<{ x: number; y: number }>,
  target?: Creature
): AIDecision | null {
  if (!shouldMove(ai, creature, allCreatures, reachableTiles, target)) {
    return null;
  }
  
  const bestMove = findBestMovement(ai, creature, allCreatures, reachableTiles, target);
  
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
  
  return {
    type: 'move',
    destination: { x: bestMove.x, y: bestMove.y },
    priority: bestMove.score,
    reason
  };
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
  return {
    ...ai,
    tacticalMemory: {
      ...ai.tacticalMemory,
      lastMove: { x: newX, y: newY }
    }
  };
}
