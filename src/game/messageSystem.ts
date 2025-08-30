import { GameActions } from './types';
import { VALIDATION_MESSAGES } from '../validation/messages';
import { logGame } from '../utils/logging';

// --- Message System ---

export function addMessage(
  message: string, 
  setMessages: GameActions['setMessages']
) {
  setMessages(m => [message, ...m].slice(0, 50));
}

export function addCombatMessage(
  combatResult: { message: string; targetDefeated: boolean },
  targetName: string,
  setMessages: GameActions['setMessages']
) {
  // Add combat message
  addMessage(combatResult.message, setMessages);
  
  // Add defeat message if target was defeated
  if (combatResult.targetDefeated) {
    addMessage(VALIDATION_MESSAGES.TARGET_DEFEATED(targetName), setMessages);
  }
}

export function addMovementMessage(
  creatureName: string, 
  facingDirection: string,
  setMessages: GameActions['setMessages']
) {
  logGame(`${creatureName} faces ${facingDirection}`);
}

export function addErrorMessage(
  message: string,
  setMessages: GameActions['setMessages']
) {
  addMessage(message, setMessages);
}
