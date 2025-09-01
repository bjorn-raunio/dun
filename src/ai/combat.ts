import { Creature, ICreature } from '../creatures/index';
import { AIState, AIDecision } from './types';
import { createAIDecision, updateAIStateWithAction } from './helpers';

// --- AI Combat Logic ---

/**
 * Update AI state after attack
 */
export function updateAIStateAfterAttack(
  ai: AIState,
  creature: ICreature,
  target: ICreature,
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
export function isTargetValid(target: ICreature, creature: ICreature): boolean {
  return target.isAlive() && creature.isHostileTo(target);
}

/**
 * Evaluate whether to flee from combat
 */
export function shouldFlee(
  ai: AIState,
  creature: ICreature,
  allCreatures: ICreature[]
): boolean {
  return false;
}

/**
 * Create a flee decision
 */
export function createFleeDecision(
  ai: AIState,
  creature: ICreature,
  allCreatures: ICreature[]
): AIDecision {
  return createAIDecision('flee', {
    priority: 10,
    reason: `Fleeing from combat (low health: ${creature.remainingVitality})`
  });
}
