import { Creature, CreatureGroup } from '../../creatures/index';
import { shouldAITakeTurn } from '../../ai/decisionMaking';
import { AITurnState, TurnExecutionContext } from './types';
import { compareAICreaturesByBehavior } from './turnOrder';
import { executeAITurnForCreature } from './aiTurnExecution';

/**
 * Initialize AI turn state
 */
export function initializeAITurnState(): AITurnState {
  return {
    isAITurnActive: false,
    currentGroup: null,
    groupTurnOrder: [],
    groupTurnIndex: 0,
    processedCreatures: new Set()
  };
}

/**
 * Get all AI-controlled creature groups
 */
export function getAIControlledGroups(creatures: CreatureGroup[]): CreatureGroup[] {
  return creatures.filter(creature => creature.isAIControlled());
}

/**
 * Execute AI turns for all creatures in a group
 */
export function executeAITurnsForGroup(
  group: CreatureGroup,
  context: TurnExecutionContext
): void {
  const allCreatures = context.groups.flatMap(group => group.getLivingCreatures());
  // Sort by behavior (ranged before melee) then by agility for turn order within group
  const sortedGroup = [...group.getLivingCreatures()].sort((a, b) => compareAICreaturesByBehavior(a, b));
  
  // Execute turns for each creature in the group
  sortedGroup.forEach(creature => {
    if (shouldAITakeTurn(creature, allCreatures)) {
      executeAITurnForCreature(creature, context);
    }
  });
}

/**
 * Start AI turn phase
 */
export function startAITurnPhase(
  context: TurnExecutionContext
): AITurnState {
  const { groups } = context;
  const aiGroups = getAIControlledGroups(groups);
  
  if (aiGroups.length === 0) {
    return initializeAITurnState();
  }
  
  aiGroups.sort((a, b) => {
    if (a.name === 'enemy' && b.name !== 'enemy') return -1;
    if (b.name === 'enemy' && a.name !== 'enemy') return 1;
    return 0;
  });
  
  return {
    isAITurnActive: true,
    currentGroup: aiGroups[0],
    groupTurnOrder: aiGroups,
    groupTurnIndex: 0,
    processedCreatures: new Set()
  };
}

/**
 * Continue AI turn phase
 */
export function continueAITurnPhase(
  aiTurnState: AITurnState,
  context: TurnExecutionContext
): AITurnState {
  if (!aiTurnState.isAITurnActive || !aiTurnState.currentGroup) {
    return aiTurnState;
  }
  
  // Execute turns for current group
  executeAITurnsForGroup(aiTurnState.currentGroup, context);
  
  // Move to next group
  const nextGroupIndex = aiTurnState.groupTurnIndex + 1;
  
  if (nextGroupIndex >= aiTurnState.groupTurnOrder.length) {
    // All groups have acted, end AI turn phase
    return initializeAITurnState();
  }
  
  // Continue with next group
  return {
    ...aiTurnState,
    currentGroup: aiTurnState.groupTurnOrder[nextGroupIndex],
    groupTurnIndex: nextGroupIndex
  };
}