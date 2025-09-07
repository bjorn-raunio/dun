import React from 'react';
import { COLORS, COMMON_STYLES } from './styles';

interface WorldMapBottomBarProps {
  messages: string[];
}

export function WorldMapBottomBar({ messages }: WorldMapBottomBarProps) {
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
    </div>
  );
}
