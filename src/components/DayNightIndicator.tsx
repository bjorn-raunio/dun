import React from 'react';
import { COLORS, COMMON_STYLES } from './styles';

interface DayNightIndicatorProps {
  isNight: boolean;
}

export function DayNightIndicator({ isNight }: DayNightIndicatorProps) {
  return (
    <div
      style={{
        ...COMMON_STYLES.messageBox,
        height: "fit-content",
        maxHeight: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minWidth: 80,
        padding: "8px 12px",
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: isNight 
            ? "linear-gradient(45deg, #1a1a2e, #16213e)" 
            : "linear-gradient(45deg, #ffd700, #ffed4e)",
          border: `2px solid ${isNight ? COLORS.borderDark : '#ffa500'}`,
          boxShadow: isNight 
            ? "0 0 10px rgba(100, 149, 237, 0.5)" 
            : "0 0 10px rgba(255, 215, 0, 0.5)",
        }}
      />
      <span
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: COLORS.text,
        }}
      >
        {isNight ? "Night" : "Day"}
      </span>
    </div>
  );
}
