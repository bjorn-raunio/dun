import { Creature } from '../creatures';
import { AITarget, AIState } from './types';
import { chebyshevDistance } from '../utils/geometry';
import { calculateThreatLevel, calculateVulnerability, calculateDistancePriority } from '../utils/creatureAnalysis';

// --- AI Targeting Logic ---







/**
 * Evaluate all potential targets for an AI creature
 */
export function evaluateTargets(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[]
): AITarget[] {
  const targets: AITarget[] = [];
  
  for (const target of allCreatures) {
    // Skip dead creatures and self
    if (target.vitality <= 0 || target.id === creature.id) {
      continue;
    }
    
    // Skip allies (assuming different creature types are enemies)
    if (target.constructor.name === creature.constructor.name) {
      continue;
    }
    
    const distance = chebyshevDistance(creature.x, creature.y, target.x, target.y);
    const threat = calculateThreatLevel(target);
    const vulnerability = calculateVulnerability(target);
    const distancePriority = calculateDistancePriority(distance, ai.behavior);
    
    // Calculate overall priority
    let priority = distancePriority;
    
    // Adjust based on behavior
    switch (ai.behavior) {
      case 'aggressive':
        priority += threat * 0.5; // Prefer dangerous targets
        break;
      case 'cautious':
        priority += vulnerability * 2; // Prefer vulnerable targets
        priority -= threat * 0.3; // Avoid dangerous targets
        break;
      case 'defensive':
        priority += vulnerability * 1.5; // Prefer vulnerable targets
        priority -= threat * 0.5; // Avoid dangerous targets
        break;
      case 'berserker':
        priority += threat * 1; // Strongly prefer dangerous targets
        break;
      case 'ambush':
        priority += vulnerability * 3; // Strongly prefer vulnerable targets
        break;
    }
    
    // Consider tactical memory
    if (ai.tacticalMemory.lastAttack?.targetId === target.id) {
      if (ai.tacticalMemory.lastAttack.success) {
        priority += 1; // Prefer targets we've successfully hit
      } else {
        priority -= 1; // Avoid targets we've missed
      }
    }
    
    targets.push({
      creature: target,
      distance,
      threat,
      vulnerability,
      priority: Math.max(0, priority)
    });
  }
  
  // Sort by priority (highest first)
  return targets.sort((a, b) => b.priority - a.priority);
}

/**
 * Select the best target for an AI creature
 */
export function selectBestTarget(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[]
): Creature | null {
  const targets = evaluateTargets(ai, creature, allCreatures);
  
  if (targets.length === 0) {
    return null;
  }
  
  // For some behaviors, we might want to consider multiple targets
  if (ai.behavior === 'cautious' || ai.behavior === 'defensive') {
    // Look for the most vulnerable target within reasonable distance
    const closeTargets = targets.filter(t => t.distance <= 6);
    if (closeTargets.length > 0) {
      return closeTargets.sort((a, b) => b.vulnerability - a.vulnerability)[0].creature;
    }
  }
  
  // Return the highest priority target
  return targets[0].creature;
}

/**
 * Update AI state with information about visible targets
 */
export function updateTargetInformation(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[]
): AIState {
  const newState = { ...ai };
  
  // Update last known positions of enemies
  for (const target of allCreatures) {
    if (target.vitality <= 0 || target.id === creature.id) {
      continue;
    }
    
    if (target.constructor.name !== creature.constructor.name) {
      const distance = chebyshevDistance(creature.x, creature.y, target.x, target.y);
      
      // Assume creatures can "see" within 8 tiles
      if (distance <= 8) {
        newState.lastKnownPlayerPositions.set(target.id, {
          x: target.x,
          y: target.y,
          turn: Date.now() // Use timestamp as turn number for now
        });
      }
    }
  }
  
  // Update threat assessment
  newState.threatAssessment.clear();
  for (const target of allCreatures) {
    if (target.vitality <= 0 || target.id === creature.id) {
      continue;
    }
    
    if (target.constructor.name !== creature.constructor.name) {
      const threat = calculateThreatLevel(target);
      newState.threatAssessment.set(target.id, threat);
    }
  }
  
  return newState;
}
