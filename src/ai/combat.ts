import { Creature } from '../creatures/index';
import { AIState, AIDecision } from './types';
import { createAIDecision, updateAIStateWithAction } from './helpers';

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
  return updateAIStateWithAction(ai, {
    type: 'attack',
    target,
    success
  });
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
  return false;
}

/**
 * Create a flee decision
 */
export function createFleeDecision(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[]
): AIDecision {
  return createAIDecision('flee', {
    priority: 10,
    reason: `Fleeing from combat (low health: ${creature.remainingVitality})`
  });
}
