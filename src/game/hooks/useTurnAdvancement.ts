import { useEffect } from 'react';
import { Creature } from '../../creatures/index';
import { GameActions } from '../types';
import { TurnState, advanceToNextCreature, shouldEndTurn, recordTurnEndPositions } from '../turnManagement';
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
    // Movement alone should not end a turn - only when they have no actions and no quick actions
    const hasFinishedTurn = activeCreature.remainingActions === 0 && 
                           activeCreature.remainingQuickActions === 0;
    
    if (hasFinishedTurn) {
      // Check if we should end the turn (no creatures can take actions)
      if (shouldEndTurn(turnState, creatures)) {
        // Record turn-end positions before ending the turn
        recordTurnEndPositions(turnState, creatures);
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
