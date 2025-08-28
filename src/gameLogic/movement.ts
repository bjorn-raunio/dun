import { Creature } from '../creatures';
import { validateMovement } from '../validation/movement';

// --- Movement Logic ---

export interface MovementResult {
  success: boolean;
  message?: string;
  cost: number;
}

/**
 * Calculate movement cost for a step
 */
export function calculateStepCost(
  currentCost: number,
  destCost: number
): number {
  return Math.max(0, destCost - currentCost);
}

/**
 * Check if a creature can afford the movement cost
 */
export function canAffordMovement(
  creature: Creature,
  cost: number
): boolean {
  return creature.remainingMovement >= cost;
}

/**
 * Apply movement cost to a creature
 */
export function applyMovementCost(
  creature: Creature,
  cost: number
): void {
  creature.remainingMovement -= cost;
}

/**
 * Check if movement would result in engagement
 */
export function wouldBeEngagedAfterMovement(
  creature: Creature,
  newX: number,
  newY: number,
  allCreatures: Creature[]
): boolean {
  // Temporarily move the creature to check engagement
  const originalX = creature.x;
  const originalY = creature.y;
  
  creature.x = newX;
  creature.y = newY;
  
  const isEngaged = creature.isEngagedWithAll(allCreatures);
  
  // Restore original position
  creature.x = originalX;
  creature.y = originalY;
  
  return isEngaged;
}

/**
 * Execute movement for a creature
 */
export function executeMovement(
  creature: Creature,
  newX: number,
  newY: number,
  allCreatures: Creature[],
  stepCost: number,
  mapData: { tiles: string[][] },
  mapDefinition?: any
): MovementResult {
  // Validate movement using extracted validation logic
  const validation = validateMovement(creature, newX, newY, allCreatures, mapData, stepCost, mapDefinition);
  
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.reason || `${creature.name} cannot move there.`,
      cost: 0
    };
  }
  
  // Try to move with zone of control checks
  const moveResult = creature.moveTo(newX, newY, allCreatures);
  
  if (!moveResult.success) {
    return {
      success: false,
      message: moveResult.message || `${creature.name} cannot move there.`,
      cost: 0
    };
  }
  
  // Apply movement cost
  applyMovementCost(creature, stepCost);
  
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
 * Check if a creature has moved from their starting position
 */
export function hasMovedFromStart(creature: Creature): boolean {
  return creature.hasMoved();
}

/**
 * Reset a creature's movement for a new turn
 */
export function resetMovement(creature: Creature): void {
  creature.remainingMovement = creature.movement;
  creature.remainingActions = creature.actions;
  creature.hasMovedWhileEngaged = false;
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
    const creature = c.clone();
    resetMovement(creature);
    return creature;
  }));
  
  setMessages(prev => ['New turn begins!', ...prev].slice(0, 50));
  
  // Reset last movement tracking
  lastMovement.current = null;
}
