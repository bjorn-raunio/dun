import { Creature } from '../creatures/index';
import { AIState, AIDecision, AIBehaviorType } from './types';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { isBackAttack } from '../utils/combatUtils';
import { createAIDecision, updateAIStateWithAction, assessThreatLevel, getBehaviorModifiers } from './helpers';

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
  const threatAssessment = assessThreatLevel(creature, allCreatures, 3);
  const behaviorModifiers = getBehaviorModifiers(ai.behavior);
  
  // Don't flee if health is good
  if (threatAssessment.healthRatio > 0.4) {
    return false;
  }
  
  // Flee if threat level is critical
  if (threatAssessment.threatLevel === 'critical') {
    return true;
  }
  
  // Apply behavior-specific modifiers
  const fleeThreshold = behaviorModifiers.riskTolerance;
  
  switch (threatAssessment.threatLevel) {
    case 'high':
      return threatAssessment.healthRatio < (0.3 + fleeThreshold * 0.2);
    case 'medium':
      return threatAssessment.healthRatio < (0.2 + fleeThreshold * 0.1);
    default:
      return false;
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
  return createAIDecision('flee', {
    priority: 10,
    reason: `Fleeing from combat (low health: ${creature.remainingVitality})`
  });
}
