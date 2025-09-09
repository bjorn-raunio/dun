import React from 'react';
import { COLORS, COMMON_STYLES } from './styles';
import { TurnTracker } from './TurnTracker';
import { DayNightIndicator } from './DayNightIndicator';
import { WeatherIndicator } from './WeatherIndicator';
import { TurnState } from '../game/turnManagement';
import { ICreature } from '../creatures/index';
import { QuestMap } from '../maps/types';

// --- Game UI Component ---

interface GameUIProps {
  messages: string[];
  onEndTurn: () => void;
  onLeaveMap: () => void;
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
  onLeaveMap,
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
          <div></div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      <div style={{
        flex: "0 0 100px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "stretch"
      }}>
        <TurnTracker
          turnState={turnState}
        />

        <DayNightIndicator isNight={mapDefinition.night} />

        <WeatherIndicator />
      </div>

      <button
        onClick={onLeaveMap}
        style={{
          minWidth: 120,
          height: "fit-content",
          maxHeight: "60px",
          ...COMMON_STYLES.button,
          fontWeight: 800,
          background: COLORS.backgroundLight,
          color: COLORS.text,
          border: `2px solid ${COLORS.border}`,
        }}
      >
        Leave Map
      </button>

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
