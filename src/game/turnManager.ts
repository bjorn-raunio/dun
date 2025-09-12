import { Creature, CreatureGroup, ICreature } from '../creatures/index';
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
export async function endTurn(
  groups: CreatureGroup[],
  creatures: ICreature[],
  mapDefinition: QuestMap | undefined,
  dispatch: React.Dispatch<any>,
  lastMovement: React.MutableRefObject<{ creatureId: string; x: number; y: number } | null>,
  currentTurnState: TurnState,
  setReachableKey: (updater: (prev: number) => number) => void
) {
  if (!mapDefinition) {
    return;
  }
  let playerControlledGroup = groups.find(group => group.isPlayerControlled());

  if (playerControlledGroup) {
    playerControlledGroup.endTurn(creatures);
  }

  // Create context for AI turn phase
  const context: TurnExecutionContext = {
    groups,
    creatures,
    dispatch,
    mapDefinition
  };

  // Start AI turn phase
  const newAITurnState = startAITurnPhase(context);
  dispatch({ type: 'SET_AI_TURN_STATE', payload: newAITurnState });

  // If there are AI creatures, execute their first group's turns
  if (newAITurnState.isAITurnActive && newAITurnState.currentGroup) {
    await executeNextAIGroup(newAITurnState, context, dispatch);
  }

  // Advance to next turn (this will reset all turns internally)
  const newTurnState = newTurn(currentTurnState, groups, creatures, dispatch, lastMovement);
  dispatch({ type: 'SET_TURN_STATE', payload: newTurnState });

  if (playerControlledGroup) {
    playerControlledGroup.startTurn(creatures);
  }

  // Update reachable tiles overlay for the new active creature
  setReachableKey(prev => prev + 1);

}

/**
 * Execute the next AI group's turns
 */
export async function executeNextAIGroup(
  aiTurnState: AITurnState,
  context: TurnExecutionContext,
  dispatch: React.Dispatch<any>
) {
  const group = aiTurnState.currentGroup;
  if (group) {
    group.startTurn(context.creatures);
  }

  // Continue AI turn phase
  const newAITurnState = await continueAITurnPhase(aiTurnState, context);
  dispatch({ type: 'SET_AI_TURN_STATE', payload: newAITurnState });


  if (newAITurnState.isAITurnActive && newAITurnState.currentGroup) {
    await executeNextAIGroup(newAITurnState, context, dispatch);
  }

  if (group) {
    group.endTurn(context.creatures);
  }
}