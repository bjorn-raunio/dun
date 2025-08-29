import { Creature } from '../creatures/index';
import { GameActions } from './types';
import { resetAllTurns as resetAllTurnsLogic } from '../gameLogic/movement';
import { 
  startAITurnPhase, 
  continueAITurnPhase, 
  isAITurnPhaseComplete,
  initializeAITurnState 
} from '../gameLogic/turnManagement';

// --- Turn Management ---

export function resetAllTurns(
  creatures: Creature[], 
  setCreatures: GameActions['setCreatures'],
  setMessages: GameActions['setMessages'],
  lastMovement: React.MutableRefObject<{creatureId: string; x: number; y: number} | null>
) {
  resetAllTurnsLogic(creatures, setCreatures, setMessages, lastMovement);
}

/**
 * End turn and start AI turn phase
 */
export function endTurnWithAI(
  creatures: Creature[],
  mapData: { tiles: string[][] },
  setCreatures: GameActions['setCreatures'],
  setMessages: GameActions['setMessages'],
  setAITurnState: GameActions['setAITurnState'],
  lastMovement: React.MutableRefObject<{creatureId: string; x: number; y: number} | null>
) {
  // Reset all turns first
  resetAllTurns(creatures, setCreatures, setMessages, lastMovement);
  
  // Start AI turn phase
  const newAITurnState = startAITurnPhase(creatures, mapData, setCreatures, setMessages);
  setAITurnState(() => newAITurnState);
  
  // If there are AI creatures, execute their first group's turns
  if (newAITurnState.isAITurnActive && newAITurnState.currentGroup) {
    executeNextAIGroup(newAITurnState, creatures, mapData, setCreatures, setMessages, setAITurnState);
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
  setAITurnState: GameActions['setAITurnState']
) {
  // Continue AI turn phase
  const newAITurnState = continueAITurnPhase(aiTurnState, creatures, mapData, setCreatures, setMessages);
  setAITurnState(() => newAITurnState);
  
  // If there are more groups to process, continue after a short delay
  if (newAITurnState.isAITurnActive && newAITurnState.currentGroup) {
    setTimeout(() => {
      executeNextAIGroup(newAITurnState, creatures, mapData, setCreatures, setMessages, setAITurnState);
    }, 1000); // 1 second delay between groups
  }
}

/**
 * Check if AI turn phase is active
 */
export function isAITurnActive(aiTurnState: any): boolean {
  return aiTurnState.isAITurnActive;
}
