import { useEffect } from 'react';
import { Creature } from '../../creatures/index';
import { TurnState, GameActions } from '../types';
import { advanceToNextCreature, shouldEndTurn } from '../turnManagement';
import { findCreatureById } from '../../utils/pathfinding';

// --- Turn Advancement Hook ---

export function useTurnAdvancement(
  turnState: TurnState,
  creatures: Creature[],
  setTurnState: GameActions['setTurnState']
) {
  useEffect(() => {
    // Only check for turn advancement if there's an active creature
    if (!turnState.activeCreatureId) {
      return;
    }

    const activeCreature = findCreatureById(creatures, turnState.activeCreatureId);
    if (!activeCreature) {
      return;
    }

    // Check if the active creature has finished their turn
    const hasFinishedTurn = activeCreature.remainingActions === 0 && activeCreature.remainingMovement === 0;
    
    if (hasFinishedTurn) {
      // Check if we should end the turn (no creatures can take actions)
      if (shouldEndTurn(turnState, creatures)) {
        // End turn - set active creature to null
        setTurnState(prev => ({
          ...prev,
          activeCreatureId: null
        }));
      } else {
        // Advance to next creature
        const newTurnState = advanceToNextCreature(turnState, creatures);
        setTurnState(() => newTurnState);
      }
    }
  }, [turnState.activeCreatureId, creatures, turnState, setTurnState]);
}
