import { Creature } from '../creatures';
import { AIState, AIDecision } from './types';
import { chebyshevDistance, getDirectionFromTo } from '../utils/geometry';
import { calculateVulnerability, calculateHealthRatio } from '../utils/creatureAnalysis';
import { hasShield } from '../utils/equipment';

// --- AI Combat Logic ---

/**
 * Evaluate whether an AI creature should attack a target
 */
export function shouldAttack(
  ai: AIState,
  creature: Creature,
  target: Creature,
  allCreatures: Creature[]
): boolean {
  // Check if we have actions remaining
  if (!creature.hasActionsRemaining()) {
    return false;
  }
  
  // Check if target is in range
  const distance = chebyshevDistance(creature.x, creature.y, target.x, target.y);
  const attackRange = creature.getAttackRange();
  
  if (distance > attackRange) {
    return false;
  }
  
  // Check if target is alive
  if (target.vitality <= 0) {
    return false;
  }
  
  // Base attack probability based on behavior
  let attackProbability = 0.5; // Default 50% chance
  
  switch (ai.behavior) {
    case 'aggressive':
      attackProbability = 0.9; // 90% chance to attack
      break;
    case 'berserker':
      attackProbability = 1.0; // Always attack if possible
      break;
    case 'defensive':
      attackProbability = 0.7; // 70% chance to attack
      break;
    case 'cautious':
      attackProbability = 0.6; // 60% chance to attack
      break;
    case 'ambush':
      // Only attack if we have a significant advantage
      if (distance <= 1 && target.vitality < creature.vitality) {
        attackProbability = 0.8;
      } else {
        attackProbability = 0.2;
      }
      break;
    case 'guard':
      // Attack if target is close
      if (distance <= 2) {
        attackProbability = 0.8;
      } else {
        attackProbability = 0.3;
      }
      break;
  }
  
  // Adjust based on tactical considerations
  const tacticalBonus = calculateTacticalBonus(ai, creature, target, allCreatures);
  attackProbability += tacticalBonus;
  
  // Adjust based on health status
  const healthRatio = calculateHealthRatio(creature);
  if (healthRatio < 0.3) {
    // Low health - more cautious
    attackProbability *= 0.7;
  } else if (healthRatio > 0.8) {
    // High health - more aggressive
    attackProbability *= 1.2;
  }
  
  // Adjust based on target vulnerability
  const targetVulnerability = calculateVulnerability(target);
  attackProbability += targetVulnerability * 0.1;
  
  // Cap probability between 0 and 1
  attackProbability = Math.max(0, Math.min(1, attackProbability));
  
  return Math.random() < attackProbability;
}

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
    c.vitality > 0 && 
    c.id !== creature.id && 
    c.constructor.name === creature.constructor.name &&
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
    c.vitality > 0 && 
    c.id !== creature.id && 
    c.constructor.name !== creature.constructor.name &&
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
  const targetVulnerability = calculateVulnerability(target);
  
  let priority = 5; // Base priority
  priority += tacticalBonus * 10;
  priority += targetVulnerability * 2;
  
  // Adjust priority based on behavior
  switch (ai.behavior) {
    case 'aggressive':
    case 'berserker':
      priority += 3;
      break;
    case 'cautious':
      priority += 1;
      break;
    case 'defensive':
      priority += 2;
      break;
  }
  
  let reason = `Attacking ${target.name}`;
  
  if (tacticalBonus > 0.2) {
    reason += ` (tactical advantage)`;
  } else if (targetVulnerability > 1) {
    reason += ` (vulnerable target)`;
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
  const healthRatio = creature.vitality / (creature.vitality + 10);
  
  if (healthRatio > 0.4) {
    return false; // Health is good, no need to flee
  }
  
  // Count nearby enemies
  const enemiesNearby = allCreatures.filter(c => 
    c.vitality > 0 && 
    c.id !== creature.id && 
    c.constructor.name !== creature.constructor.name &&
    chebyshevDistance(c.x, c.y, creature.x, creature.y) <= 3
  );
  
  // Flee if outnumbered or very low health
  if (enemiesNearby.length > 2 || healthRatio < 0.2) {
    return true;
  }
  
  // Some behaviors are more likely to flee
  switch (ai.behavior) {
    case 'cautious':
      return healthRatio < 0.5 && enemiesNearby.length > 1;
    case 'defensive':
      return healthRatio < 0.6 && enemiesNearby.length > 1;
    case 'berserker':
      return false; // Berserkers never flee
    case 'aggressive':
      return healthRatio < 0.3 && enemiesNearby.length > 2;
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
    reason: `Fleeing from combat (low health: ${creature.vitality})`
  };
}
