import { Creature, ICreature } from '../creatures/index';
import { AIState, AIDecision, AITarget, AIBehaviorType } from './types';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { calculateDistanceToCreature, canReachAndAttack, canAttackImmediately } from '../utils/pathfinding';
import { QuestMap } from '../maps/types';

// --- AI Helper Functions ---

/**
 * Common target filtering logic used across AI systems
 */
export function filterValidTargets(
  creature: ICreature,
  allCreatures: ICreature[]
): ICreature[] {
  return allCreatures.filter(target => 
    target.isAlive() && 
    target.id !== creature.id && 
    creature.isHostileTo(target) &&
    target.x !== undefined && 
    target.y !== undefined
  );
}

/**
 * Common target evaluation logic with configurable scoring
 */
export function evaluateTargetWithScoring(
  target: ICreature,
  creature: ICreature,
  ai: AIState,
  allCreatures: ICreature[],
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: QuestMap,
  scoringOptions: {
    basePriority?: number;
    distanceWeight?: number;
    hitEaseWeight?: number;
    reachabilityWeight?: number;
  } = {}
): AITarget {
  const {
    basePriority = 0,
    distanceWeight = 1,
    hitEaseWeight = 2,
    reachabilityWeight = 50
  } = scoringOptions;

  if (creature.x === undefined || creature.y === undefined) {
    return {
      creature: target,
      distance: Infinity,
      priority: 0
    };
  }
  
  const distance = calculateDistanceToCreature(creature.x, creature.y, target, {
    usePathfinding: !!(mapData && cols !== undefined && rows !== undefined),
    mapData,
    cols,
    rows,
    mapDefinition,
    allCreatures
  });

  const canReachAndAttackThisTurn = canReachAndAttack(creature, target, allCreatures, mapData, cols, rows, mapDefinition);
  const canAttackNow = canAttackImmediately(creature, target);

  let priority = basePriority;

  // Reachability scoring
  if (canAttackNow) {
    priority += reachabilityWeight * 2; // Can attack immediately
  } else if (canReachAndAttackThisTurn) {
    priority += reachabilityWeight; // Can reach and attack this round
  } else {
    priority = 0.1; // Very low priority for unreachable targets
  }

  // Hit ease scoring
  let defenderCombatValue: number;
  if (ai.behavior === AIBehaviorType.RANGED) {
    defenderCombatValue = 0;
  } else {
    defenderCombatValue = target.combat;
  }
  const hitEase = Math.max(0, 10 - defenderCombatValue);
  priority += hitEase * hitEaseWeight;

  return {
    creature: target,
    distance,
    priority: Math.max(0, priority)
  };
}

/**
 * Common decision creation patterns
 */
export function createAIDecision(
  type: AIDecision['type'],
  options: {
    target?: ICreature;
    destination?: { x: number; y: number };
    priority?: number;
    reason?: string;
  } = {}
): AIDecision {
  const { target, destination, priority = 1, reason = 'AI decision' } = options;

  const baseDecision: AIDecision = {
    type,
    priority,
    reason
  };

  switch (type) {
    case 'attack':
      return {
        ...baseDecision,
        target,
        priority: Math.max(priority, 8) // Attacks should have high priority
      };
    case 'move':
      return {
        ...baseDecision,
        destination,
        priority: Math.max(priority, 5) // Movement should have medium-high priority
      };
    case 'flee':
      return {
        ...baseDecision,
        priority: Math.max(priority, 10) // Fleeing should have highest priority
      };
    case 'wait':
      return {
        ...baseDecision,
        priority: Math.min(priority, 1) // Waiting should have lowest priority
      };
    case 'special':
      return {
        ...baseDecision,
        priority: Math.max(priority, 6) // Special abilities should have high priority
      };
    default:
      return baseDecision;
  }
}

/**
 * Common AI state update patterns
 */
export function updateAIStateWithAction(
  ai: AIState,
  action: {
    type: 'attack' | 'move' | 'flee' | 'wait' | 'special';
    target?: ICreature;
    destination?: { x: number; y: number };
    success?: boolean;
  }
): AIState {
  const newState = { ...ai };

  switch (action.type) {
    case 'attack':
      if (action.target) {
        newState.currentTarget = (action.success && action.target.isAlive()) ? action.target : null;
        newState.tacticalMemory = {
          ...newState.tacticalMemory,
          lastAttack: {
            targetId: action.target.id,
            success: action.success || false
          }
        };
      }
      break;
    case 'move':
      if (action.destination) {
        newState.tacticalMemory = {
          ...newState.tacticalMemory,
          lastMove: {
            x: action.destination.x,
            y: action.destination.y
          }
        };
      }
      break;
    case 'flee':
      newState.currentTarget = null; // Clear target when fleeing
      break;
  }

  return newState;
}

/**
 * Common validation patterns for AI actions
 */
export function validateAIAction(
  creature: ICreature,
  action: AIDecision,
  allCreatures: ICreature[],
  mapData?: { tiles: string[][] },
  mapDefinition?: QuestMap
): { isValid: boolean; reason?: string } {
  // Basic creature state validation
  if (!creature.isAlive()) {
    return { isValid: false, reason: 'Creature is dead' };
  }

  switch (action.type) {
    case 'attack':
      if (!action.target) {
        return { isValid: false, reason: 'No target specified for attack' };
      }
      if (!action.target.isAlive()) {
        return { isValid: false, reason: 'Target is dead' };
      }
      if (!creature.isHostileTo(action.target)) {
        return { isValid: false, reason: 'Target is not hostile' };
      }
      if (!canAttackImmediately(creature, action.target)) {
        return { isValid: false, reason: 'Cannot attack target from current position' };
      }
      break;
    case 'move':
      if (!action.destination) {
        return { isValid: false, reason: 'No destination specified for movement' };
      }
      // Additional movement validation could be added here
      break;
  }

  return { isValid: true };
}