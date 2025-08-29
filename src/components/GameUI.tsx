import React from 'react';
import { COLORS, COMMON_STYLES } from './styles';

// --- Game UI Component ---

interface GameUIProps {
  messages: string[];
  onEndTurn: () => void;
  isAITurnActive?: boolean;
}

export function GameUI({ messages, onEndTurn, isAITurnActive = false }: GameUIProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 130,
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
        flex: 1, 
        overflow: "auto", 
        ...COMMON_STYLES.messageBox,
        maxHeight: "108px" 
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
