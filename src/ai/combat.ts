import { Creature } from '../creatures/index';
import { AIState, AIDecision, AIBehaviorType } from './types';
import { calculateDistance } from '../utils/geometry';
import { isBackAttack } from '../utils/combatUtils';

// --- AI Combat Logic ---





/**
 * Update AI state after attack
 */
export function updateAIStateAfterAttack(
  ai: AIState,
  creature: Creature,
  target: Creature,
  success: boolean,
  damage: number
): AIState {
  // Check if the target is still alive after the attack
  const targetStillAlive = target.isAlive();
  
  return {
    ...ai,
    currentTarget: (success && targetStillAlive) ? target : null, // Clear target if dead
    tacticalMemory: {
      ...ai.tacticalMemory,
      lastAttack: {
        targetId: target.id,
        success
      }
    }
  };
}

/**
 * Check if a target is still valid (alive and hostile)
 */
export function isTargetValid(target: Creature, creature: Creature): boolean {
  return target.isAlive() && creature.isHostileTo(target);
}

/**
 * Evaluate whether to flee from combat
 */
export function shouldFlee(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[]
): boolean {
  // Only consider fleeing if health is low
  const healthRatio = creature.remainingVitality / (creature.remainingVitality + 10);
  
  if (healthRatio > 0.4) {
    return false; // Health is good, no need to flee
  }
  
  // Count nearby enemies
  const enemiesNearby = allCreatures.filter(c => 
    c.isAlive() && 
    c.id !== creature.id && 
    creature.isHostileTo(c) &&
    calculateDistance(c.x, c.y, creature.x, creature.y, 'chebyshev') <= 3
  );
  
  // Flee if outnumbered or very low health
  if (enemiesNearby.length > 2 || healthRatio < 0.2) {
    return true;
  }
  
  // Some behaviors are more likely to flee
  switch (ai.behavior) {
    case AIBehaviorType.RANGED:
      return healthRatio < 0.5 && enemiesNearby.length > 1;
    case AIBehaviorType.ANIMAL:
      return healthRatio < 0.3 && enemiesNearby.length > 2;
    case AIBehaviorType.MELEE:
      return healthRatio < 0.2 && enemiesNearby.length > 3; // Melee fighters are more stubborn
    default:
      return healthRatio < 0.4 && enemiesNearby.length > 2;
  }
}

/**
 * Create a flee decision
 */
export function createFleeDecision(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[]
): AIDecision {
  return {
    type: 'flee',
    priority: 10, // High priority when fleeing
    reason: `Fleeing from combat (low health: ${creature.remainingVitality})`
  };
}
