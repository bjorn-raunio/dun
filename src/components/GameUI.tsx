import React from 'react';
import { COLORS, COMMON_STYLES } from './styles';
import { TurnTracker } from './TurnTracker';
import { TurnState } from '../game/turnManagement';
import { Creature } from '../creatures/index';

// --- Game UI Component ---

interface GameUIProps {
  messages: string[];
  onEndTurn: () => void;
  isAITurnActive?: boolean;
  turnState: TurnState;
  creatures: Creature[];
  onCreatureClick?: (creature: Creature) => void;
}

export function GameUI({ messages, onEndTurn, isAITurnActive = false, turnState, creatures, onCreatureClick }: GameUIProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 162.5,
        background: COLORS.backgroundLight,
        color: COLORS.text,
        display: "flex",
        alignItems: "stretch",
        gap: 12,
        padding: 12,
        boxSizing: "border-box",
        zIndex: 12,
        borderTop: `2px solid ${COLORS.borderDark}`,
        pointerEvents: "auto",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      <div style={{ 
        flex: "0 0 50%", 
        overflow: "auto", 
        textAlign: "left",
        ...COMMON_STYLES.messageBox,
        maxHeight: "140px" 
      }}>
        {messages.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No messages</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        )}
      </div>
      
      <div style={{
        flex: "0 0 30%",
        ...COMMON_STYLES.messageBox,
        maxHeight: "140px",
        overflow: "auto"
      }}>
        <TurnTracker
          turnState={turnState}
        />
      </div>


      
      <button
        onClick={onEndTurn}
        disabled={isAITurnActive}
        style={{
          minWidth: 140,
          height: "100%",
          ...COMMON_STYLES.button,
          fontWeight: 800,
          opacity: isAITurnActive ? 0.5 : 1,
          cursor: isAITurnActive ? 'not-allowed' : 'pointer',
        }}
      >
        {isAITurnActive ? 'AI Turn...' : 'End Turn'}
      </button>
    </div>
  );
}
