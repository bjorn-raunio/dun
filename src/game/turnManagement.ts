import { Creature } from '../creatures/index';
import { TurnState } from './types';
import { resetAllTurns } from './movement';
import { makeAIDecision, executeAIDecision, shouldAITakeTurn, shouldContinueTurnAfterKill } from '../ai/decisionMaking';
import { CreatureMovement } from '../creatures/movement';
import { calculateTargetsInRange } from '../utils/combatUtils';
import { addMessage } from './messageSystem';
import { getLivingCreatures } from '../validation/creature';
import { findCreatureById } from '../utils/pathfinding';

// --- Turn Management Logic ---

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
  const turnOrder = getLivingCreatures(creatures)
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
    shouldAITakeTurn(creature, creatures)
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
  setMessages: (updater: (prev: string[]) => string[]) => void,
  mapDefinition?: any
): boolean {
  // Get AI state from the creature (assuming it's a Monster)
  const aiState = (creature as any).getAIState?.() || null;
  if (!aiState) {
    console.warn(`Creature ${creature.name} has no AI state`);
    return false;
  }

  let success = false;
  let previousActions = creature.remainingActions;
  let previousMovement = creature.remainingMovement;
  let previousQuickActions = creature.remainingQuickActions;

  // Continue taking actions until no progress is made (remaining actions/movement/quick actions don't change)
  while (true) {
    // Get updated reachable tiles and targets in range (may have changed after movement)
    const { tiles: reachableTiles, costMap: reachableTilesCostMap } = CreatureMovement.getReachableTiles(creature, allCreatures, mapData, mapData.tiles[0].length, mapData.tiles.length, mapDefinition);
    const targetsInRangeIds = calculateTargetsInRange(creature, allCreatures);
    const targetsInRange = allCreatures.filter(c => targetsInRangeIds.has(c.id));

    // Create AI context
    const context = {
      ai: aiState,
      creature,
      allCreatures,
      mapData,
      mapDefinition,
      currentTurn: 1, // TODO: Get actual turn number
      reachableTiles,
      reachableTilesCostMap,
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
      addMessage(executionResult.message, setMessages);
      
      success = true;
      
      // If we attacked, check if we should continue the turn
      if (decisionResult.action.type === 'attack') {
        // Check if the target was actually killed
        const targetWasKilled = executionResult.targetDefeated;
        
        if (targetWasKilled) {
          // Target was killed, check if we should continue the turn
          if (!shouldContinueTurnAfterKill(creature, allCreatures)) {
            break;
          }
          
          // If we have remaining movement and other targets, continue the turn
          // The AI will automatically select a new target and move towards it
          console.log(`${creature.name} killed its target but has remaining movement. Continuing turn to find new target.`);
        } else {
          // Target was not killed, end the turn
          console.log(`${creature.name} attacked but did not kill the target. Ending turn.`);
          break;
        }
      }
    } else {
      // No valid decision found, break out of the loop
      break;
    }

    // Check if any progress was made (remaining actions, movement, or quick actions changed)
    const currentActions = creature.remainingActions;
    const currentMovement = creature.remainingMovement;
    const currentQuickActions = creature.remainingQuickActions;
    
    if (currentActions === previousActions && 
        currentMovement === previousMovement && 
        currentQuickActions === previousQuickActions) {
      // No progress made, break out of the loop
      break;
    }
    
    // Update previous values for next iteration
    previousActions = currentActions;
    previousMovement = currentMovement;
    previousQuickActions = currentQuickActions;
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
  setMessages: (updater: (prev: string[]) => string[]) => void,
  mapDefinition?: any
): void {
  const groupCreatures = getAICreaturesInGroup(creatures, group);
  
  // Sort by agility (highest first) for turn order within group
  groupCreatures.sort((a, b) => b.agility - a.agility);
  
  // Execute turns for each creature in the group
  groupCreatures.forEach(creature => {
    if (shouldAITakeTurn(creature, creatures)) {
      executeAITurnForCreature(creature, creatures, mapData, setCreatures, setMessages, mapDefinition);
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
  setMessages: (updater: (prev: string[]) => string[]) => void,
  mapDefinition?: any
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
  setMessages: (updater: (prev: string[]) => string[]) => void,
  mapDefinition?: any
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
    setMessages,
    mapDefinition
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
  const livingCreatures = getLivingCreatures(creatures);
  
  if (livingCreatures.length === 0) {
    return null; // No living creatures
  }
  
  // Find next creature in turn order
  let nextIndex = turnState.turnIndex + 1;
  if (nextIndex >= turnState.turnOrder.length) {
    nextIndex = 0; // Wrap around to first creature
  }
  
  const nextCreatureId = turnState.turnOrder[nextIndex];
  return findCreatureById(creatures, nextCreatureId);
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
  const newTurnOrder = getLivingCreatures(creatures)
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
  return getLivingCreatures(creatures)
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
  return findCreatureById(creatures, turnState.activeCreatureId);
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

/**
 * Advance to the next creature in turn order
 */
export function advanceToNextCreature(
  turnState: TurnState,
  creatures: Creature[]
): TurnState {
  const livingCreatures = getLivingCreatures(creatures);
  
  if (livingCreatures.length === 0) {
    return {
      ...turnState,
      activeCreatureId: null
    };
  }
  
  // Find current creature index
  const currentIndex = turnState.turnOrder.findIndex(id => id === turnState.activeCreatureId);
  
  // Find next creature that can take actions
  let nextIndex = currentIndex + 1;
  if (nextIndex >= turnState.turnOrder.length) {
    nextIndex = 0; // Wrap around to first creature
  }
  
  // Look for the next creature that can take actions
  let checkedCount = 0;
  while (checkedCount < turnState.turnOrder.length) {
    const nextCreatureId = turnState.turnOrder[nextIndex];
    const nextCreature = findCreatureById(creatures, nextCreatureId);
    
    if (nextCreature && canTakeActions(nextCreature)) {
      return {
        ...turnState,
        activeCreatureId: nextCreatureId,
        turnIndex: nextIndex
      };
    }
    
    nextIndex = (nextIndex + 1) % turnState.turnOrder.length;
    checkedCount++;
  }
  
  // If no creature can take actions, end the turn
  return {
    ...turnState,
    activeCreatureId: null
  };
}

/**
 * Check if the current turn should end (no creatures can take actions)
 */
export function shouldEndTurn(
  turnState: TurnState,
  creatures: Creature[]
): boolean {
  const livingCreatures = getLivingCreatures(creatures);
  return livingCreatures.every(c => !canTakeActions(c));
}
