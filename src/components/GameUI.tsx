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
  targetingMode?: { isActive: boolean; attackerId: string | null; message: string };
}

export function GameUI({ 
  messages, 
  onEndTurn, 
  isAITurnActive = false, 
  turnState, 
  creatures, 
  onCreatureClick,
  targetingMode 
}: GameUIProps) {
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
        {targetingMode?.isActive && (
          <div style={{
            marginTop: 8,
            padding: 8,
            background: COLORS.primary,
            color: 'white',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center'
          }}>
            🎯 {targetingMode.message}
            <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
              Press ESC to cancel
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onEndTurn}
        disabled={isAITurnActive || targetingMode?.isActive}
        style={{
          minWidth: 140,
          height: "100%",
          ...COMMON_STYLES.button,
          fontWeight: 800,
          opacity: (isAITurnActive || targetingMode?.isActive) ? 0.5 : 1,
          cursor: (isAITurnActive || targetingMode?.isActive) ? 'not-allowed' : 'pointer',
        }}
      >
        {isAITurnActive ? 'AI Turn...' : 'End Turn'}
      </button>
    </div>
  );
}
