import { Creature } from '../creatures/index';
import { GameActions } from './types';
import { TurnState, TurnExecutionContext } from './turnManagement';
import { resetAllTurns } from './movement';
import { 
  startAITurnPhase, 
  continueAITurnPhase,
  advanceTurn as advanceTurnLogic,
  getNextCreature,
  setActiveCreature as setActiveCreatureLogic
} from './turnManagement';

// --- Game-Specific Turn Management ---

/**
 * End turn and start AI turn phase
 */
export function endTurnWithAI(
  creatures: Creature[],
  mapData: { tiles: string[][] },
  dispatch: React.Dispatch<any>,
  lastMovement: React.MutableRefObject<{creatureId: string; x: number; y: number} | null>,
  currentTurnState: TurnState,
  mapDefinition?: any
) {
  // Advance to next turn (this will reset all turns internally)
  const newTurnState = advanceTurnLogic(currentTurnState, creatures, dispatch, lastMovement);
  dispatch({ type: 'SET_TURN_STATE', payload: newTurnState });
  
  // Create context for AI turn phase
  const context: TurnExecutionContext = {
    creatures,
    mapData,
    dispatch,
    mapDefinition
  };
  
  // Start AI turn phase
  const newAITurnState = startAITurnPhase(context);
  dispatch({ type: 'SET_AI_TURN_STATE', payload: newAITurnState });
  
  // If there are AI creatures, execute their first group's turns
  if (newAITurnState.isAITurnActive && newAITurnState.currentGroup) {
    executeNextAIGroup(newAITurnState, context, dispatch);
  }
}

/**
 * Execute the next AI group's turns
 */
export function executeNextAIGroup(
  aiTurnState: any,
  context: TurnExecutionContext,
  dispatch: React.Dispatch<any>
) {
  // Continue AI turn phase
  const newAITurnState = continueAITurnPhase(aiTurnState, context);
  dispatch({ type: 'SET_AI_TURN_STATE', payload: newAITurnState });
  
  // If there are more groups to process, continue after a short delay
  if (newAITurnState.isAITurnActive && newAITurnState.currentGroup) {
    setTimeout(() => {
      executeNextAIGroup(newAITurnState, context, dispatch);
    }, 1000); // 1 second delay between groups
  }
}

/**
 * Set the active creature (game-specific wrapper)
 */
export function setActiveCreatureInGame(
  turnState: TurnState,
  creatureId: string | null,
  setTurnState: GameActions['setTurnState']
) {
  const newTurnState = setActiveCreatureLogic(turnState, creatureId);
  setTurnState(() => newTurnState);
}

/**
 * Get the next creature in turn order
 */
export function getNextCreatureInOrder(
  turnState: TurnState,
  creatures: Creature[]
): Creature | null {
  return getNextCreature(turnState, creatures);
}
