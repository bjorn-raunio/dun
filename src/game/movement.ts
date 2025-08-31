import { Creature } from '../creatures/index';
import { validateMovement } from '../validation/movement';
import { VALIDATION_MESSAGES } from '../validation/messages';

// --- Movement Logic ---

export type MovementStatus = 'success' | 'partial' | 'failed';

export interface MovementResult {
  status: MovementStatus;
  message?: string;
  cost: number;
  finalPosition?: { x: number; y: number };
  intendedDestination?: { x: number; y: number };
  tilesMoved: number;
  totalPathLength: number;
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
      status: 'failed',
      message: "No path provided for movement.",
      cost: 0,
      tilesMoved: 0,
      totalPathLength: 0
    };
  }

  // Get the destination from the last tile in the path
  const destination = path[path.length - 1];
  
  // Validate movement using extracted validation logic
  const validation = validateMovement(creature, destination.x, destination.y, allCreatures, mapData, stepCost, mapDefinition);
  
  if (!validation.isValid) {
    return {
      status: 'failed',
      message: validation.reason || VALIDATION_MESSAGES.CANNOT_MOVE_THERE(creature.name),
      cost: 0,
      tilesMoved: 0,
      totalPathLength: path.length - 1
    };
  }
  
  // Try to move through the path with zone of control checks
  const moveResult = creature.moveTo(path, allCreatures, mapData, mapDefinition);
  
  if (moveResult.status === 'failed') {
    return {
      status: 'failed',
      message: moveResult.message || VALIDATION_MESSAGES.CANNOT_MOVE_THERE(creature.name),
      cost: moveResult.cost || 0,
      tilesMoved: 0,
      totalPathLength: path.length - 1
    };
  }
  
  // Movement cost is already applied by moveTo function
  // Don't reset group actions during movement - this should only happen when turns actually end
  // creature.resetGroupActions(allCreatures);
  
  // Check if movement resulted in engagement
  const isEngaged = creature.isEngagedWithAll(allCreatures);
  if (isEngaged) {
    // Set remaining movement to zero when entering hostile zone of control
    creature.setRemainingMovement(0);
  }
  
  // Use the result from moveTo directly since it now returns MovementResult
  return {
    status: moveResult.status,
    message: moveResult.message,
    cost: moveResult.cost,
    finalPosition: moveResult.finalPosition,
    intendedDestination: destination,
    tilesMoved: moveResult.tilesMoved,
    totalPathLength: moveResult.totalPathLength
  };
}


