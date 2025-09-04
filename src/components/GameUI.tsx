import React from 'react';
import { COLORS, COMMON_STYLES } from './styles';
import { TurnTracker } from './TurnTracker';
import { DayNightIndicator } from './DayNightIndicator';
import { TurnState } from '../game/turnManagement';
import { ICreature } from '../creatures/index';
import { QuestMap } from '../maps/types';

// --- Game UI Component ---

interface GameUIProps {
  messages: string[];
  onEndTurn: () => void;
  isAITurnActive?: boolean;
  turnState: TurnState;
  creatures: ICreature[];
  onCreatureClick?: (creature: ICreature) => void;
  targetingMode?: { isActive: boolean; attackerId: string | null; message: string };
  mapDefinition: QuestMap;
}

export function GameUI({
  messages,
  onEndTurn,
  isAITurnActive = false,
  turnState,
  creatures,
  onCreatureClick,
  targetingMode,
  mapDefinition
}: GameUIProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 243.75,
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
        height: "calc(100% - 24px)",
        maxHeight: "none"
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
        flex: "0 0 7.5%",
        ...COMMON_STYLES.messageBox,
        height: "fit-content",
        maxHeight: "120px",
        overflow: "auto"
      }}>
        <TurnTracker
          turnState={turnState}
        />
      </div>

      <DayNightIndicator isNight={mapDefinition.night} />

      <button
        onClick={onEndTurn}
        disabled={isAITurnActive || targetingMode?.isActive}
        style={{
          minWidth: 120,
          height: "fit-content",
          maxHeight: "60px",
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
