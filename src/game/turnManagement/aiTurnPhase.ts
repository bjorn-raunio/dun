import { Creature } from '../../creatures/index';
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
export function getAIControlledGroups(creatures: Creature[]): string[] {
  const groups = new Set<string>();
  creatures.forEach(creature => {
    if (creature.isAIControlled() && creature.isAlive()) {
      groups.add(creature.group);
    }
  });
  return Array.from(groups);
}

/**
 * Get creatures in a specific group that can take actions
 */
export function getAICreaturesInGroup(creatures: Creature[], group: string): Creature[] {
  return creatures.filter(creature => 
    creature.isAIControlled() && 
    creature.group === group && 
    creature.isAlive() && 
    shouldAITakeTurn(creature, creatures)
  );
}

/**
 * Execute AI turns for all creatures in a group
 */
export function executeAITurnsForGroup(
  group: string,
  context: TurnExecutionContext
): void {
  const { creatures } = context;
  const groupCreatures = getAICreaturesInGroup(creatures, group);
  
  // Sort by behavior (ranged before melee) then by agility for turn order within group
  groupCreatures.sort(compareAICreaturesByBehavior);
  
  // Execute turns for each creature in the group
  groupCreatures.forEach(creature => {
    if (shouldAITakeTurn(creature, creatures)) {
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
  const { creatures } = context;
  const aiGroups = getAIControlledGroups(creatures);
  
  if (aiGroups.length === 0) {
    return initializeAITurnState();
  }
  
  // Sort groups by priority (enemy first, then neutral)
  aiGroups.sort((a, b) => {
    if (a === 'enemy' && b !== 'enemy') return -1;
    if (b === 'enemy' && a !== 'enemy') return 1;
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

/**
 * Check if AI turn phase is complete
 */
export function isAITurnPhaseComplete(aiTurnState: AITurnState): boolean {
  return !aiTurnState.isAITurnActive;
}
