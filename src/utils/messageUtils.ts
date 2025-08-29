import { VALIDATION_MESSAGES } from '../validation/messages';

// --- Message Utilities ---

/**
 * Create a standardized AI action message
 */
export function createAIActionMessage(
  creatureName: string,
  action: string,
  targetName?: string
): string {
  if (targetName) {
    return `${creatureName} ${action} ${targetName}.`;
  }
  return `${creatureName} ${action}.`;
}

/**
 * Common AI action messages
 */
export const AI_MESSAGES = {
  flee: (creatureName: string) => createAIActionMessage(creatureName, 'decides to flee from combat'),
  wait: (creatureName: string, reason?: string) => {
    const baseMessage = createAIActionMessage(creatureName, 'decides to wait');
    return reason ? `${creatureName} has no targets and decides to wait.` : baseMessage;
  },
  attack: (creatureName: string, targetName: string) => 
    createAIActionMessage(creatureName, 'decides to attack', targetName),
  move: (creatureName: string, targetName?: string) => {
    if (targetName) {
      return `${creatureName} decides to move toward ${targetName}.`;
    }
    return createAIActionMessage(creatureName, 'moves');
  },
  moveToPosition: (creatureName: string, x: number, y: number) => 
    `${creatureName} moves to (${x}, ${y}).`,
  moveToNewTarget: (creatureName: string, targetName: string) => 
    `${creatureName} moves toward new target ${targetName}.`,
  waitEngaged: (creatureName: string, targetName: string) => 
    `${creatureName} waits while engaged with ${targetName}.`,
  specialAbility: (creatureName: string) => 
    createAIActionMessage(creatureName, 'uses a special ability'),
  cannotMove: (creatureName: string) => 
    VALIDATION_MESSAGES.CANNOT_MOVE_THERE(creatureName),
  unknownAction: (actionType: string) => 
    `Unknown action type: ${actionType}`
} as const;

/**
 * Create a movement message based on context
 */
export function createMovementMessage(
  creatureName: string,
  targetName: string,
  isNewTarget: boolean
): string {
  return isNewTarget 
    ? AI_MESSAGES.moveToNewTarget(creatureName, targetName)
    : AI_MESSAGES.move(creatureName, targetName);
}
