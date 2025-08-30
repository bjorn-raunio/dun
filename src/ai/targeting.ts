import { Creature } from '../creatures/index';
import { AITarget, AIState, AIBehaviorType } from './types';
import { calculateDistanceToCreature, canReachAndAttack, canAttackImmediately, isCreatureVisible } from '../utils/pathfinding';
import { filterValidTargets, evaluateTargetWithScoring } from './helpers';
import { PathfindingSystem } from '../utils/pathfinding';

// --- AI Targeting Logic ---

/**
 * Evaluate all potential targets for an AI creature
 */
export function evaluateTargets(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[],
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): AITarget[] {
  const validTargets = filterValidTargets(creature, allCreatures);
  
  const targets = validTargets.map(target => 
    evaluateTargetWithScoring(target, creature, ai, allCreatures, mapData, cols, rows, mapDefinition)
  );

  // Sort by priority (highest first)
  return targets.sort((a, b) => b.priority - a.priority);
}

/**
 * Select the best target for an AI creature
 */
export function selectBestTarget(
  ai: AIState,
  creature: Creature,
  allCreatures: Creature[],
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): Creature | null {
  const targets = evaluateTargets(ai, creature, allCreatures, mapData, cols, rows, mapDefinition);

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
  allCreatures: Creature[],
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): AIState {
  const newState = { ...ai };

  // Update last known positions of enemies
  for (const target of allCreatures) {
    if (target.isDead() || target.id === creature.id) {
      continue;
    }

    if (creature.isHostileTo(target)) {
      // Check if target is visible using line of sight
      let isVisible = false;
      
      if (mapData && cols !== undefined && rows !== undefined) {
        isVisible = isCreatureVisible(
          creature.x, 
          creature.y, 
          target, 
          mapData, 
          cols, 
          rows, 
          mapDefinition,
          {},
          creature,
          allCreatures
        );
      } else {
        // Fallback: assume visible if no map data available
        isVisible = true;
      }

      if (isVisible) {
        // Target is visible, update current position
        const distance = calculateDistanceToCreature(creature.x, creature.y, target, {
          usePathfinding: !!(mapData && cols !== undefined && rows !== undefined),
          mapData,
          cols,
          rows,
          mapDefinition,
          allCreatures
        });

        newState.lastKnownPlayerPositions.set(target.id, {
          x: target.x,
          y: target.y,
          turn: Date.now() // Use timestamp as turn number for now
        });
      } else {
        // Target is not visible, keep last known position if it exists
        // This allows AI to remember where enemies were last seen
        if (!newState.lastKnownPlayerPositions.has(target.id)) {
          // If we've never seen this target, we can't target it
          continue;
        }
      }
    }
  }

  return newState;
}
