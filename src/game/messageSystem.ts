import { GameActions } from './types';
import { VALIDATION_MESSAGES } from '../validation/messages';
import { logGame } from '../utils/logging';
import { addCombatMessage, addMovementMessage, addErrorMessage, addMessage } from '../utils/messageSystem';

// --- Legacy Message System (for backward compatibility) ---

export function addMessageLegacy(
  message: string, 
  dispatch: React.Dispatch<any>
) {
  if(message === '') {
    return;
  }
  dispatch({ type: 'ADD_MESSAGE', payload: message });
}

export function addCombatMessageLegacy(
  combatResult: { messages: string[]; targetDefeated: boolean },
  targetName: string,
  dispatch: React.Dispatch<any>
) {
  // Add combat messages
  if (combatResult.messages && combatResult.messages.length > 0) {
    combatResult.messages.forEach(message => {
      addMessageLegacy(message, dispatch);
    });
  }
  
  // Add defeat message if target was defeated
  if (combatResult.targetDefeated) {
    addMessageLegacy(VALIDATION_MESSAGES.TARGET_DEFEATED(targetName), dispatch);
  }
}

export function addMovementMessageLegacy(
  creatureName: string, 
  facingDirection: string,
  dispatch: React.Dispatch<any>
) {
  logGame(`${creatureName} faces ${facingDirection}`);
}

export function addErrorMessageLegacy(
  message: string,
  dispatch: React.Dispatch<any>
) {
  addMessageLegacy(message, dispatch);
}

// --- New Message System (re-exports for convenience) ---
export { addMessage, addCombatMessage, addMovementMessage, addErrorMessage };
