import { Creature } from '../creatures/index';
import { AITarget, AIState, AIBehaviorType } from './types';
import { chebyshevDistance } from '../utils/geometry';

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
    if (target.isDead() || target.id === creature.id) {
      continue;
    }

    // Skip allies (creatures from the same group)
    if (creature.isFriendlyTo(target)) {
      continue;
    }

    const distance = chebyshevDistance(creature.x, creature.y, target.x, target.y);
    const attackRange = creature.getAttackRange();
    const movementRange = creature.remainingMovement;

    // Check if target can be reached and attacked this round
    const canReachAndAttack = distance <= (movementRange + attackRange);
    const canAttackNow = distance <= attackRange;

    // If we can't reach and attack this round, give very low priority
    if (!canReachAndAttack) {
      targets.push({
        creature: target,
        distance,
        priority: 0.1 // Very low priority for unreachable targets
      });
      continue;
    }

    // Calculate base priority based on reachability and attackability
    let priority = 0;

    if (canAttackNow) {
      // Can attack immediately - high priority
      priority += 100;
    } else if (canReachAndAttack) {
      // Can reach and attack this round - medium priority
      priority += 50;
    }

    // Prioritize easier-to-hit targets when multiple are reachable
    // Calculate hit difficulty based on attacker's combat/ranged vs defender's combat
    let defenderCombatValue: number;

    if (ai.behavior === AIBehaviorType.RANGED) {
      defenderCombatValue = 0;
    } else {
      // Melee and animal behaviors use combat
      defenderCombatValue = target.combat;
    }

    // Hit ease: lower defender combat value = easier to hit = higher priority
    // We want to prioritize targets with lower combat values
    const hitEase = Math.max(0, 10 - defenderCombatValue); // Higher value = easier to hit
    priority += hitEase * 2; // Give significant weight to hit ease

    // Adjust based on behavior
    switch (ai.behavior) {
      case AIBehaviorType.MELEE:
        // Melee fighters prefer close targets they can reach
        if (distance <= movementRange + 1) {
          priority += 3;
        }

        break;
      case AIBehaviorType.RANGED:
        // Ranged fighters prefer targets at optimal range
        if (distance >= 2 && distance <= 6) {
          priority += 4;
        } else if (distance <= 1) {
          priority -= 2; // Penalty for too close
        }

        break;
      case AIBehaviorType.ANIMAL:
        // Animals prefer close targets
        if (distance <= movementRange + 1) {
          priority += 2;
        }
        break;
    }

    targets.push({
      creature: target,
      distance,
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

  // Filter for targets that can be reached and attacked this round
  const reachableTargets = targets.filter(t => t.priority > 1);

  if (reachableTargets.length === 0) {
    // If no reachable targets, return the highest priority unreachable target
    // (for movement planning)
    return targets[0].creature;
  }

  // Among reachable targets, prioritize by ease of hitting
  // Sort by priority (which now includes hit ease)
  reachableTargets.sort((a, b) => b.priority - a.priority);

  return reachableTargets[0].creature;
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
    if (target.isDead() || target.id === creature.id) {
      continue;
    }

    if (creature.isHostileTo(target)) {
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



  return newState;
}
