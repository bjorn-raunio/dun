import { Creature } from '../creatures/index';
import { GameActions, TurnState } from './types';
import { resetAllTurns } from '../gameLogic/movement';
import { 
  startAITurnPhase, 
  continueAITurnPhase,
  advanceTurn as advanceTurnLogic,
  getNextCreature,
  setActiveCreature as setActiveCreatureLogic
} from '../gameLogic/turnManagement';

// --- Game-Specific Turn Management ---

/**
 * End turn and start AI turn phase
 */
export function endTurnWithAI(
  creatures: Creature[],
  mapData: { tiles: string[][] },
  setCreatures: GameActions['setCreatures'],
  setMessages: GameActions['setMessages'],
  setAITurnState: GameActions['setAITurnState'],
  setTurnState: GameActions['setTurnState'],
  lastMovement: React.MutableRefObject<{creatureId: string; x: number; y: number} | null>,
  currentTurnState: TurnState,
  mapDefinition?: any
) {
  // Reset all turns first
  resetAllTurns(creatures, setCreatures, setMessages, lastMovement);
  
  // Advance to next turn
  const newTurnState = advanceTurnLogic(currentTurnState, creatures, setCreatures, setMessages, lastMovement);
  setTurnState(() => newTurnState);
  
  // Start AI turn phase
  const newAITurnState = startAITurnPhase(creatures, mapData, setCreatures, setMessages, mapDefinition);
  setAITurnState(() => newAITurnState);
  
  // If there are AI creatures, execute their first group's turns
  if (newAITurnState.isAITurnActive && newAITurnState.currentGroup) {
    executeNextAIGroup(newAITurnState, creatures, mapData, setCreatures, setMessages, setAITurnState, mapDefinition);
  }
}

/**
 * Execute the next AI group's turns
 */
export function executeNextAIGroup(
  aiTurnState: any,
  creatures: Creature[],
  mapData: { tiles: string[][] },
  setCreatures: GameActions['setCreatures'],
  setMessages: GameActions['setMessages'],
  setAITurnState: GameActions['setAITurnState'],
  mapDefinition?: any
) {
  // Continue AI turn phase
  const newAITurnState = continueAITurnPhase(aiTurnState, creatures, mapData, setCreatures, setMessages, mapDefinition);
  setAITurnState(() => newAITurnState);
  
  // If there are more groups to process, continue after a short delay
  if (newAITurnState.isAITurnActive && newAITurnState.currentGroup) {
    setTimeout(() => {
      executeNextAIGroup(newAITurnState, creatures, mapData, setCreatures, setMessages, setAITurnState, mapDefinition);
    }, 1000); // 1 second delay between groups
  }
}

/**
 * Set the active creature
 */
export function setActiveCreature(
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
