import React from 'react';
import { COLORS } from '../styles';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? COLORS.backgroundLight : 'transparent',
        border: 'none',
        borderBottom: active ? `2px solid ${COLORS.primary}` : '2px solid transparent',
        color: active ? COLORS.text : COLORS.textMuted,
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
        transition: 'all 0.2s ease',
        flex: 1,
        textAlign: 'center' as const,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
}
