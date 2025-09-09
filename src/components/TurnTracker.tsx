import React from 'react';
import { TurnState } from '../game/turnManagement';
import { COLORS, COMMON_STYLES } from './styles';

// --- Turn Tracker Component ---

interface TurnTrackerProps {
  turnState: TurnState;
}

export function TurnTracker({ turnState }: TurnTrackerProps) {
  return (
    <div
      style={{
        ...COMMON_STYLES.messageBox,
        height: "fit-content",
        maxHeight: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        width: "100px",
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
