import { Creature } from '../creatures/index';
import { AIState, AIDecision, AIBehaviorType } from './types';
import { chebyshevDistance, getDirectionFromTo } from '../utils/geometry';

// --- AI Combat Logic ---

/**
 * Calculate tactical bonus for attacking
 */
export function calculateTacticalBonus(
  ai: AIState,
  creature: Creature,
  target: Creature,
  allCreatures: Creature[]
): number {
  let bonus = 0;
  
  // Check for flanking bonus
  const alliesNearby = allCreatures.filter(c => 
    c.isAlive() && 
    c.id !== creature.id && 
    creature.isFriendlyTo(c) &&
    chebyshevDistance(c.x, c.y, target.x, target.y) <= 2
  );
  
  if (alliesNearby.length > 0) {
    bonus += 0.2; // Flanking bonus
  }
  
  // Check for back attack opportunity
  const attackDirection = getDirectionFromTo(creature.x, creature.y, target.x, target.y);
  const targetFacing = target.facing;
  const isBackAttack = Math.abs(attackDirection - targetFacing) >= 6 || 
                      Math.abs(attackDirection - targetFacing) <= 2;
  
  if (isBackAttack) {
    bonus += 0.3; // Back attack bonus
  }
  
  // Check if target is engaged with others
  if (target.isEngagedWithAll(allCreatures)) {
    bonus += 0.1; // Target is distracted
  }
  
  // Check if we're in a good position
  const enemiesNearby = allCreatures.filter(c => 
    c.isAlive() && 
    c.id !== creature.id && 
    creature.isHostileTo(c) &&
    chebyshevDistance(c.x, c.y, creature.x, creature.y) <= 2
  );
  
  if (enemiesNearby.length === 0) {
    bonus += 0.1; // Safe position
  } else if (enemiesNearby.length === 1 && enemiesNearby[0].id === target.id) {
    bonus += 0.05; // Only target nearby
  } else {
    bonus -= 0.1; // Multiple enemies nearby
  }
  
  return bonus;
}

/**
 * Create an attack decision
 */
export function createAttackDecision(
  ai: AIState,
  creature: Creature,
  target: Creature,
  allCreatures: Creature[]
): AIDecision {
  const distance = chebyshevDistance(creature.x, creature.y, target.x, target.y);
  const tacticalBonus = calculateTacticalBonus(ai, creature, target, allCreatures);
  
  let priority = 5; // Base priority
  priority += tacticalBonus * 10;
  
  // Adjust priority based on behavior
  switch (ai.behavior) {
    case AIBehaviorType.MELEE:
      priority += 3;
      break;
    case AIBehaviorType.RANGED:
      priority += 2;
      break;
    case AIBehaviorType.ANIMAL:
      priority += 2;
      break;
  }
  
  let reason = `Attacking ${target.name}`;
  
  if (tacticalBonus > 0.2) {
    reason += ` (tactical advantage)`;
  }
  
  return {
    type: 'attack',
    target,
    priority: Math.max(0, priority),
    reason
  };
}

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
  return {
    ...ai,
    currentTarget: success ? target : null, // Keep target if attack was successful
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
    chebyshevDistance(c.x, c.y, creature.x, creature.y) <= 3
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
