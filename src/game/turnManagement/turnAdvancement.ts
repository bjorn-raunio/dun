import { Creature } from '../../creatures/index';
import { TurnState } from './types';
import { resetAllTurns } from '../movement';
import { getLivingCreatures } from '../../validation/creature';
import { findCreatureById } from '../../utils/pathfinding';
import { getTurnOrderIds } from './turnOrder';

/**
 * Initialize turn state for a new game
 */
export function initializeTurnState(creatures: Creature[]): TurnState {
  const turnOrder = getTurnOrderIds(getLivingCreatures(creatures));
  
  return {
    currentTurn: 1,
    activeCreatureId: turnOrder.length > 0 ? turnOrder[0] : null,
    turnOrder,
    turnIndex: 0
  };
}

/**
 * Get the next creature in turn order
 */
export function getNextCreature(
  turnState: TurnState,
  creatures: Creature[]
): Creature | null {
  const livingCreatures = getLivingCreatures(creatures);
  
  if (livingCreatures.length === 0) {
    return null; // No living creatures
  }
  
  // Find next creature in turn order
  let nextIndex = turnState.turnIndex + 1;
  if (nextIndex >= turnState.turnOrder.length) {
    nextIndex = 0; // Wrap around to first creature
  }
  
  const nextCreatureId = turnState.turnOrder[nextIndex];
  return findCreatureById(creatures, nextCreatureId);
}

/**
 * Advance to the next turn
 */
export function advanceTurn(
  turnState: TurnState,
  creatures: Creature[],
  dispatch: React.Dispatch<any>,
  lastMovement: React.MutableRefObject<{ creatureId: string; x: number; y: number } | null>
): TurnState {
  // Reset all creatures for new turn
  resetAllTurns(creatures, dispatch, lastMovement);
  
  // Recalculate turn order (in case creatures died)
  const newTurnOrder = getTurnOrderIds(getLivingCreatures(creatures));
  
  return {
    currentTurn: turnState.currentTurn + 1,
    activeCreatureId: newTurnOrder.length > 0 ? newTurnOrder[0] : null,
    turnOrder: newTurnOrder,
    turnIndex: 0
  };
}

/**
 * Check if a creature can take actions
 */
export function canTakeActions(creature: Creature): boolean {
  return creature.isAlive() && 
         (creature.remainingMovement > 0 || creature.remainingActions > 0);
}

/**
 * Check if all creatures have finished their turns
 */
export function allCreaturesFinished(creatures: Creature[]): boolean {
  return getLivingCreatures(creatures)
    .every(c => !canTakeActions(c));
}

/**
 * Get the current active creature
 */
export function getActiveCreature(
  turnState: TurnState,
  creatures: Creature[]
): Creature | null {
  if (!turnState.activeCreatureId) return null;
  return findCreatureById(creatures, turnState.activeCreatureId);
}

/**
 * Set the active creature
 */
export function setActiveCreature(
  turnState: TurnState,
  creatureId: string | null
): TurnState {
  return {
    ...turnState,
    activeCreatureId: creatureId
  };
}

/**
 * Advance to the next creature in turn order
 */
export function advanceToNextCreature(
  turnState: TurnState,
  creatures: Creature[]
): TurnState {
  const livingCreatures = getLivingCreatures(creatures);
  
  if (livingCreatures.length === 0) {
    return {
      ...turnState,
      activeCreatureId: null
    };
  }
  
  // Find current creature index
  const currentIndex = turnState.turnOrder.findIndex(id => id === turnState.activeCreatureId);
  
  // Record the turn-end position of the current creature before advancing
  if (turnState.activeCreatureId && currentIndex >= 0) {
    const currentCreature = findCreatureById(creatures, turnState.activeCreatureId);
    if (currentCreature) {
      currentCreature.recordTurnEndPosition();
    }
  }
  
  // Find next creature that can take actions
  let nextIndex = currentIndex + 1;
  if (nextIndex >= turnState.turnOrder.length) {
    nextIndex = 0; // Wrap around to first creature
  }
  
  // Look for the next creature that can take actions
  let checkedCount = 0;
  while (checkedCount < turnState.turnOrder.length) {
    const nextCreatureId = turnState.turnOrder[nextIndex];
    const nextCreature = findCreatureById(creatures, nextCreatureId);
    
    if (nextCreature && canTakeActions(nextCreature)) {
      return {
        ...turnState,
        activeCreatureId: nextCreatureId,
        turnIndex: nextIndex
      };
    }
    
    nextIndex = (nextIndex + 1) % turnState.turnOrder.length;
    checkedCount++;
  }
  
  // If no creature can take actions, end the turn
  return {
    ...turnState,
    activeCreatureId: null
  };
}

/**
 * Check if the current turn should end (no creatures can take actions)
 */
export function shouldEndTurn(
  turnState: TurnState,
  creatures: Creature[]
): boolean {
  const livingCreatures = getLivingCreatures(creatures);
  return livingCreatures.every(c => !canTakeActions(c));
}

/**
 * Record turn-end positions for all creatures when the turn ends
 */
export function recordTurnEndPositions(
  turnState: TurnState,
  creatures: Creature[]
): void {
  // Record the position of the currently active creature if there is one
  if (turnState.activeCreatureId) {
    const currentCreature = findCreatureById(creatures, turnState.activeCreatureId);
    if (currentCreature) {
      currentCreature.recordTurnEndPosition();
    }
  }
}
