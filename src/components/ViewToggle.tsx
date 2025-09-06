import React from 'react';
import { COLORS, COMMON_STYLES } from './styles';

interface ViewToggleProps {
  currentView: 'quest' | 'world';
  onViewChange: (view: 'quest' | 'world') => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 20,
        display: "flex",
        gap: 8,
      }}
    >
              <button
          onClick={() => onViewChange('quest')}
          style={{
            ...COMMON_STYLES.button,
            background: currentView === 'quest' ? COLORS.primary : COLORS.backgroundLight,
            color: currentView === 'quest' ? COLORS.text : COLORS.textMuted,
            border: `2px solid ${currentView === 'quest' ? COLORS.primary : COLORS.border}`,
            fontWeight: currentView === 'quest' ? 700 : 500,
          }}
        >
          Quest Map
        </button>
        <button
          onClick={() => onViewChange('world')}
          style={{
            ...COMMON_STYLES.button,
            background: currentView === 'world' ? COLORS.primary : COLORS.backgroundLight,
            color: currentView === 'world' ? COLORS.text : COLORS.textMuted,
            border: `2px solid ${currentView === 'world' ? COLORS.primary : COLORS.border}`,
            fontWeight: currentView === 'world' ? 700 : 500,
          }}
        >
          World Map
        </button>
    </div>
  );
}
