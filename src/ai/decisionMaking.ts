import { Creature, Monster, ICreature } from '../creatures/index';
import { AIState, AIDecision, AIContext, AIActionResult, AIBehaviorType } from './types';
import { selectBestTarget, updateTargetInformation } from './targeting';
import { createMovementDecision, updateAIStateAfterMovement } from './movement';
import { shouldFlee, createFleeDecision, updateAIStateAfterAttack, isTargetValid } from './combat';
import { calculateTargetsInRange } from '../utils/combat';
import { canAttackImmediately, isCreatureVisible } from '../utils/pathfinding';
import { validateCombat } from '../validation/combat';
import { executeMovement } from '../utils/movement';
import { CreatureMovement } from '../creatures/movement';
import { addCombatMessage } from '../utils/messageSystem';
import { AI_MESSAGES, createMovementMessage } from '../utils/messageUtils';
import { createAIDecision } from './helpers';
import creatureServices from '../creatures/services';
import { QuestMap } from '../maps/types';
import { MonsterPreset, MercenaryPreset } from '../creatures/presets/types';
import { EquipmentSystem } from '../items/equipment';

// --- AI Decision Making Logic ---

// --- AI Decision Making Logic ---

/**
 * Check if an AI creature should continue its turn after killing a target
 */
export function shouldContinueTurnAfterKill(
  creature: ICreature,
  allCreatures: ICreature[]
): boolean {
  // Check if the creature has remaining movement
  const hasRemainingMovement = creature.remainingMovement > 0;

  // Check if there are other hostile targets available
  const hasOtherTargets = allCreatures.some(c =>
    c.isAlive() &&
    c.id !== creature.id &&
    creature.isHostileTo(c)
  );

  return hasRemainingMovement && hasOtherTargets;
}

/**
 * Make a decision for an AI creature's turn
 */
export function makeAIDecision(context: AIContext): AIActionResult {
  const { ai, creature, allCreatures, currentTurn, reachableTiles, targetsInRange, mapDefinition } = context;

  // Update AI state with current information
  const updatedAI = updateTargetInformation(ai, creature, allCreatures, mapDefinition, mapDefinition.tiles[0].length, mapDefinition.tiles.length);

  // If no good action is available, wait
  const waitDecision = createAIDecision('wait', { reason: 'No advantageous action available' });

  return {
    success: true,
    action: waitDecision,
    message: AI_MESSAGES.wait(creature.name),
    newState: updatedAI
  };
}

/**
 * Execute an AI decision
 */
export function executeAIDecision(
  decision: AIDecision,
  context: AIContext
): { success: boolean; messages: string[]; newState: AIState; targetDefeated?: boolean } {
  const { ai, creature, allCreatures, currentTurn, reachableTiles, targetsInRange, mapDefinition } = context;

  addCombatMessage(AI_MESSAGES.unknownAction(decision.type));
  return {
    success: false,
    messages: [],
    newState: ai,
    targetDefeated: false
  };
}

/**
 * Create a default AI state for a creature
 */
export function createDefaultAIState(behavior: AIBehaviorType = AIBehaviorType.MELEE): AIState {
  return {
    behavior,
    currentTarget: null,
    lastKnownPlayerPositions: new Map(),
    threatAssessment: new Map(),
    tacticalMemory: {
      lastMove: null,
      lastAttack: null,
      preferredPositions: []
    }
  };
}

/**
 * Create AI state based on creature type and preset
 */
export function createAIStateForCreature(creature: Monster, preset?: MonsterPreset): AIState {
  // Determine behavior based on creature type or preset
  let behavior: AIBehaviorType = AIBehaviorType.MELEE;

  if (preset?.aiBehavior) {
    behavior = preset.aiBehavior as AIBehaviorType;
  }

  const baseState = createDefaultAIState(behavior);

  return {
    ...baseState
  };
}

/**
 * Check if an AI creature should take its turn
 */
export function shouldAITakeTurn(creature: ICreature, allCreatures: ICreature[] = []): boolean {
  const targetsInRange = calculateTargetsInRange(creature, allCreatures);
  return creature.isAlive() &&
    (creature.remainingMovement > 0 ||
      creature.remainingQuickActions > 0 ||
      (creature.remainingActions > 0 && targetsInRange.size > 0));
}