import { Creature } from '../creatures/index';
import { validateMovement } from '../validation/movement';
import { VALIDATION_MESSAGES } from '../validation/messages';

// --- Movement Logic ---

export interface MovementResult {
  success: boolean;
  message?: string;
  cost: number;
}

/**
 * Execute movement for a creature through a path
 */
export function executeMovement(
  creature: Creature,
  path: Array<{x: number; y: number}>,
  allCreatures: Creature[],
  stepCost: number,
  mapData: { tiles: string[][] },
  mapDefinition?: any
): MovementResult {
  if (path.length === 0) {
    return {
      success: false,
      message: "No path provided for movement.",
      cost: 0
    };
  }

  // Get the destination from the last tile in the path
  const destination = path[path.length - 1];
  
  // Validate movement using extracted validation logic
  const validation = validateMovement(creature, destination.x, destination.y, allCreatures, mapData, stepCost, mapDefinition);
  
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.reason || VALIDATION_MESSAGES.CANNOT_MOVE_THERE(creature.name),
      cost: 0
    };
  }
  
  // Try to move through the path with zone of control checks
  const moveResult = creature.moveTo(path, allCreatures);
  
  if (!moveResult.success) {
    return {
      success: false,
      message: moveResult.message || VALIDATION_MESSAGES.CANNOT_MOVE_THERE(creature.name),
      cost: 0
    };
  }
  
  // Apply movement cost
  creature.useMovement(stepCost);
  
  // Reset actions for other creatures in the same group that have already acted
  creature.resetGroupActions(allCreatures);
  
  // Check if movement resulted in engagement
  const isEngaged = creature.isEngagedWithAll(allCreatures);
  if (isEngaged) {
    // Set remaining movement to zero when entering hostile zone of control
    creature.remainingMovement = 0;
  }
  
  return {
    success: true,
    cost: stepCost
  };
}

/**
 * Reset all creatures' turns
 */
export function resetAllTurns(
  creatures: Creature[],
  setCreatures: (updater: (prev: Creature[]) => Creature[]) => void,
  setMessages: (updater: (prev: string[]) => string[]) => void,
  lastMovement: React.MutableRefObject<{ creatureId: string; x: number; y: number } | null>
): void {
  setCreatures(prev => prev.map(c => {
    // Reset turn for the existing creature instead of cloning
    c.resetTurn();
    return c;
  }));
  
  setMessages(prev => ['New turn begins!', ...prev].slice(0, 50));
  
  // Reset last movement tracking
  lastMovement.current = null;
}
