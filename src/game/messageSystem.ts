import { GameActions } from './types';

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
    addMessage(`${targetName} has been defeated!`, setMessages);
  }
}

export function addMovementMessage(
  creatureName: string, 
  facingDirection: string,
  setMessages: GameActions['setMessages']
) {
  addMessage(`${creatureName} faces ${facingDirection}`, setMessages);
}

export function addErrorMessage(
  message: string,
  setMessages: GameActions['setMessages']
) {
  addMessage(message, setMessages);
}
