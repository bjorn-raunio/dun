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
import { QuestMap } from '../maps/types';
import { AITurnState } from './turnManagement/types';
import { addTurnMessage } from '../utils/messageSystem';

// --- Game-Specific Turn Management ---

/**
 * End turn and start AI turn phase
 */
export function endTurn(
  groups: CreatureGroup[],
  mapDefinition: QuestMap | undefined,
  dispatch: React.Dispatch<any>,
  lastMovement: React.MutableRefObject<{creatureId: string; x: number; y: number} | null>,
  currentTurnState: TurnState
) {
  if(!mapDefinition) {
    return;
  }
  let playerControlledGroup = groups.find(group => group.isPlayerControlled());

  if(playerControlledGroup) {
    playerControlledGroup.endTurn();
  }

  // Create context for AI turn phase
  const context: TurnExecutionContext = {
    groups,
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

  // Advance to next turn (this will reset all turns internally)
  const newTurnState = newTurn(currentTurnState, groups, dispatch, lastMovement);
  dispatch({ type: 'SET_TURN_STATE', payload: newTurnState });

  if(playerControlledGroup) {
    const messages = playerControlledGroup.startTurn();
    // Messages are now handled by the centralized message system
    // The startTurn method already calls addTurnMessage for each message
  }
  
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
    const messages = group.startTurn();
    messages.forEach(message => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    });
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