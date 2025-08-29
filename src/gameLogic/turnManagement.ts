import { Creature } from '../creatures/index';
import { resetAllTurns } from './movement';
import { makeAIDecision, executeAIDecision, shouldAITakeTurn } from '../ai/decisionMaking';
import { CreatureMovement } from '../creatures/movement';
import { getTargetsInRangeForCreature } from '../utils/combat';

// --- Turn Management Logic ---

export interface TurnState {
  currentTurn: number;
  activeCreatureId: string | null;
  turnOrder: string[];
  turnIndex: number;
}

export interface AITurnState {
  isAITurnActive: boolean;
  currentGroup: string | null;
  groupTurnOrder: string[];
  groupTurnIndex: number;
  processedCreatures: Set<string>;
}

/**
 * Initialize turn state for a new game
 */
export function initializeTurnState(creatures: Creature[]): TurnState {
  const turnOrder = creatures
    .filter(c => c.isAlive()) // Only living creatures
    .sort((a, b) => b.agility - a.agility) // Sort by agility (highest first)
    .map(c => c.id);
  
  return {
    currentTurn: 1,
    activeCreatureId: turnOrder.length > 0 ? turnOrder[0] : null,
    turnOrder,
    turnIndex: 0
  };
}

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
    shouldAITakeTurn(creature)
  );
}

/**
 * Execute AI turn for a single creature
 */
export function executeAITurnForCreature(
  creature: Creature,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  setCreatures: (updater: (prev: Creature[]) => Creature[]) => void,
  setMessages: (updater: (prev: string[]) => string[]) => void
): boolean {
  // Get AI state from the creature (assuming it's a Monster)
  const aiState = (creature as any).getAIState?.() || null;
  if (!aiState) {
    console.warn(`Creature ${creature.name} has no AI state`);
    return false;
  }

  let actionsTaken = 0;
  const maxActions = creature.remainingActions;
  let success = false;

  // Continue taking actions until we run out of actions or can't do anything more
  while (actionsTaken < maxActions && creature.hasActionsRemaining()) {
    // Get updated reachable tiles and targets in range (may have changed after movement)
    const { tiles: reachableTiles } = CreatureMovement.getReachableTiles(creature, allCreatures, mapData, mapData.tiles[0].length, mapData.tiles.length);
    const targetsInRangeIds = getTargetsInRangeForCreature(creature, allCreatures);
    const targetsInRange = allCreatures.filter(c => targetsInRangeIds.has(c.id));

    // Create AI context
    const context = {
      ai: aiState,
      creature,
      allCreatures,
      mapData,
      currentTurn: 1, // TODO: Get actual turn number
      reachableTiles,
      targetsInRange
    };

    // Make AI decision
    const decisionResult = makeAIDecision(context);
    
    if (decisionResult.success) {
      // Execute the decision
      const executionResult = executeAIDecision(decisionResult.action, context);
      
      // Update creature's AI state
      if ((creature as any).updateAIState) {
        (creature as any).updateAIState(executionResult.newState);
      }
      
      // Add message
      setMessages(prev => [...prev, executionResult.message]);
      
      actionsTaken++;
      success = true;
      
      // If we attacked, we're done (attacking uses an action)
      if (decisionResult.action.type === 'attack') {
        break;
      }
    } else {
      // No valid decision found, break out of the loop
      break;
    }
  }
  
  return success;
}

/**
 * Execute AI turns for all creatures in a group
 */
export function executeAITurnsForGroup(
  group: string,
  creatures: Creature[],
  mapData: { tiles: string[][] },
  setCreatures: (updater: (prev: Creature[]) => Creature[]) => void,
  setMessages: (updater: (prev: string[]) => string[]) => void
): void {
  const groupCreatures = getAICreaturesInGroup(creatures, group);
  
  // Sort by agility (highest first) for turn order within group
  groupCreatures.sort((a, b) => b.agility - a.agility);
  
  // Execute turns for each creature in the group
  groupCreatures.forEach(creature => {
    if (shouldAITakeTurn(creature)) {
      executeAITurnForCreature(creature, creatures, mapData, setCreatures, setMessages);
    }
  });
}

/**
 * Start AI turn phase
 */
export function startAITurnPhase(
  creatures: Creature[],
  mapData: { tiles: string[][] },
  setCreatures: (updater: (prev: Creature[]) => Creature[]) => void,
  setMessages: (updater: (prev: string[]) => string[]) => void
): AITurnState {
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
  creatures: Creature[],
  mapData: { tiles: string[][] },
  setCreatures: (updater: (prev: Creature[]) => Creature[]) => void,
  setMessages: (updater: (prev: string[]) => string[]) => void
): AITurnState {
  if (!aiTurnState.isAITurnActive || !aiTurnState.currentGroup) {
    return aiTurnState;
  }
  
  // Execute turns for current group
  executeAITurnsForGroup(
    aiTurnState.currentGroup,
    creatures,
    mapData,
    setCreatures,
    setMessages
  );
  
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

/**
 * Get the next creature in turn order
 */
export function getNextCreature(
  turnState: TurnState,
  creatures: Creature[]
): Creature | null {
  const livingCreatures = creatures.filter(c => c.isAlive());
  
  if (livingCreatures.length === 0) {
    return null; // No living creatures
  }
  
  // Find next creature in turn order
  let nextIndex = turnState.turnIndex + 1;
  if (nextIndex >= turnState.turnOrder.length) {
    nextIndex = 0; // Wrap around to first creature
  }
  
  const nextCreatureId = turnState.turnOrder[nextIndex];
  return creatures.find(c => c.id === nextCreatureId) || null;
}

/**
 * Advance to the next turn
 */
export function advanceTurn(
  turnState: TurnState,
  creatures: Creature[],
  setCreatures: (updater: (prev: Creature[]) => Creature[]) => void,
  setMessages: (updater: (prev: string[]) => string[]) => void,
  lastMovement: React.MutableRefObject<{ creatureId: string; x: number; y: number } | null>
): TurnState {
  // Reset all creatures for new turn
  resetAllTurns(creatures, setCreatures, setMessages, lastMovement);
  
  // Recalculate turn order (in case creatures died)
  const newTurnOrder = creatures
    .filter(c => c.isAlive())
    .sort((a, b) => b.agility - a.agility)
    .map(c => c.id);
  
  return {
    currentTurn: turnState.currentTurn + 1,
    activeCreatureId: newTurnOrder.length > 0 ? newTurnOrder[0] : null,
    turnOrder: newTurnOrder,
    turnIndex: 0
  };
}

/**
 * Check if a creature can take actions
 */
export function canTakeActions(creature: Creature): boolean {
  return creature.isAlive() && 
         (creature.remainingMovement > 0 || creature.remainingActions > 0);
}

/**
 * Check if all creatures have finished their turns
 */
export function allCreaturesFinished(creatures: Creature[]): boolean {
  return creatures
    .filter(c => c.isAlive())
    .every(c => !canTakeActions(c));
}

/**
 * Get the current active creature
 */
export function getActiveCreature(
  turnState: TurnState,
  creatures: Creature[]
): Creature | null {
  if (!turnState.activeCreatureId) return null;
  return creatures.find(c => c.id === turnState.activeCreatureId) || null;
}

/**
 * Set the active creature
 */
export function setActiveCreature(
  turnState: TurnState,
  creatureId: string | null
): TurnState {
  return {
    ...turnState,
    activeCreatureId: creatureId
  };
}
