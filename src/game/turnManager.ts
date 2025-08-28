import { Creature } from '../creatures';
import { GameActions } from './types';
import { resetAllTurns as resetAllTurnsLogic } from '../gameLogic/movement';

// --- Turn Management ---

export function resetAllTurns(
  creatures: Creature[], 
  setCreatures: GameActions['setCreatures'],
  setMessages: GameActions['setMessages'],
  lastMovement: React.MutableRefObject<{creatureId: string; x: number; y: number} | null>
) {
  resetAllTurnsLogic(creatures, setCreatures, setMessages, lastMovement);
}
