import React from 'react';
import { TurnState } from '../game/types';
import { COLORS } from './styles';

// --- Turn Tracker Component ---

interface TurnTrackerProps {
  turnState: TurnState;
}

export function TurnTracker({ turnState }: TurnTrackerProps) {
  return (
    <div
      style={{
        background: COLORS.backgroundLight,
        border: `2px solid ${COLORS.borderDark}`,
        borderRadius: 8,
        padding: 8,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
      }}>
        Turn {turnState.currentTurn}
      </div>
    </div>
  );
}
