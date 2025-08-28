import { Creature } from '../creatures';
import { resetAllTurns } from './movement';

// --- Turn Management Logic ---

export interface TurnState {
  currentTurn: number;
  activeCreatureId: string | null;
  turnOrder: string[];
  turnIndex: number;
}

/**
 * Initialize turn state for a new game
 */
export function initializeTurnState(creatures: Creature[]): TurnState {
  const turnOrder = creatures
    .filter(c => c.vitality > 0) // Only living creatures
    .sort((a, b) => b.agility - a.agility) // Sort by agility (highest first)
    .map(c => c.id);
  
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
  const livingCreatures = creatures.filter(c => c.vitality > 0);
  
  if (livingCreatures.length === 0) {
    return null; // No living creatures
  }
  
  // Find next creature in turn order
  let nextIndex = turnState.turnIndex + 1;
  if (nextIndex >= turnState.turnOrder.length) {
    nextIndex = 0; // Wrap around to first creature
  }
  
  const nextCreatureId = turnState.turnOrder[nextIndex];
  return creatures.find(c => c.id === nextCreatureId) || null;
}

/**
 * Advance to the next turn
 */
export function advanceTurn(
  turnState: TurnState,
  creatures: Creature[],
  setCreatures: (updater: (prev: Creature[]) => Creature[]) => void,
  setMessages: (updater: (prev: string[]) => string[]) => void,
  lastMovement: React.MutableRefObject<{ creatureId: string; x: number; y: number } | null>
): TurnState {
  // Reset all creatures for new turn
  resetAllTurns(creatures, setCreatures, setMessages, lastMovement);
  
  // Recalculate turn order (in case creatures died)
  const newTurnOrder = creatures
    .filter(c => c.vitality > 0)
    .sort((a, b) => b.agility - a.agility)
    .map(c => c.id);
  
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
  return creature.vitality > 0 && 
         (creature.remainingMovement > 0 || creature.remainingActions > 0);
}

/**
 * Check if all creatures have finished their turns
 */
export function allCreaturesFinished(creatures: Creature[]): boolean {
  return creatures
    .filter(c => c.vitality > 0)
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
  return creatures.find(c => c.id === turnState.activeCreatureId) || null;
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
