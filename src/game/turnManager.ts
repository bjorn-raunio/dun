import { Creature, CreatureGroup } from '../creatures/index';
import { GameActions } from './types';
import { TurnState, TurnExecutionContext } from './turnManagement';
import { 
  startAITurnPhase, 
  continueAITurnPhase,
  newTurn,
  getNextCreature,
  setActiveCreature as setActiveCreatureLogic
} from './turnManagement';
import { MapDefinition } from '../maps/types';
import { AITurnState } from './turnManagement/types';

// --- Game-Specific Turn Management ---

/**
 * End turn and start AI turn phase
 */
export function endTurn(
  groups: CreatureGroup[],
  mapData: { tiles: string[][] },
  dispatch: React.Dispatch<any>,
  lastMovement: React.MutableRefObject<{creatureId: string; x: number; y: number} | null>,
  currentTurnState: TurnState,
  mapDefinition?: MapDefinition
) {
  let playerControlledGroup = groups.find(group => group.isPlayerControlled());

  if(playerControlledGroup) {
    playerControlledGroup.endTurn();
  }

  // Create context for AI turn phase
  const context: TurnExecutionContext = {
    groups,
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

  if(playerControlledGroup) {
    playerControlledGroup.startTurn();
  }
  
  // Advance to next turn (this will reset all turns internally)
  const newTurnState = newTurn(currentTurnState, groups, dispatch, lastMovement);
  dispatch({ type: 'SET_TURN_STATE', payload: newTurnState });
  
}

/**
 * Execute the next AI group's turns
 */
export function executeNextAIGroup(
  aiTurnState: AITurnState,
  context: TurnExecutionContext,
  dispatch: React.Dispatch<any>
) {
  const group = aiTurnState.currentGroup;
  if(group) {
    group.startTurn();
  }

  // Continue AI turn phase
  const newAITurnState = continueAITurnPhase(aiTurnState, context);
  dispatch({ type: 'SET_AI_TURN_STATE', payload: newAITurnState });

  
  if (newAITurnState.isAITurnActive && newAITurnState.currentGroup) {
    executeNextAIGroup(newAITurnState, context, dispatch);
  }

  if(group) {
    group.endTurn();
  }
}