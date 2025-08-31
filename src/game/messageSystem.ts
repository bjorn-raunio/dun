import { GameActions } from './types';
import { VALIDATION_MESSAGES } from '../validation/messages';
import { logGame } from '../utils/logging';

// --- Message System ---

export function addMessage(
  message: string, 
  dispatch: React.Dispatch<any>
) {
  dispatch({ type: 'ADD_MESSAGE', payload: message });
}

export function addCombatMessage(
  combatResult: { message: string; targetDefeated: boolean },
  targetName: string,
  dispatch: React.Dispatch<any>
) {
  // Add combat message
  addMessage(combatResult.message, dispatch);
  
  // Add defeat message if target was defeated
  if (combatResult.targetDefeated) {
    addMessage(VALIDATION_MESSAGES.TARGET_DEFEATED(targetName), dispatch);
  }
}

export function addMovementMessage(
  creatureName: string, 
  facingDirection: string,
  dispatch: React.Dispatch<any>
) {
  logGame(`${creatureName} faces ${facingDirection}`);
}

export function addErrorMessage(
  message: string,
  dispatch: React.Dispatch<any>
) {
  addMessage(message, dispatch);
}
