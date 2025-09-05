import React from 'react';
import { ICreature } from '../../creatures/index';
import { CreatureHeader } from './CreatureHeader';
import { TabbedCharacterPanel } from './TabbedCharacterPanel';
import { COLORS, COMMON_STYLES } from '../styles';

interface CharacterPopupProps {
  creature: ICreature;
  onClose: () => void;
  onCreatureUpdate?: (creature: ICreature) => void;
}

export function CharacterPopup({ creature, onClose, onCreatureUpdate }: CharacterPopupProps) {
  return (
    <div style={OVERLAY_STYLES} onClick={onClose}>
      <div style={POPUP_STYLES} onClick={(e) => e.stopPropagation()}>
        {/* Header with close button */}
        <div style={HEADER_STYLES}>
          <h2 style={{ margin: 0, color: COLORS.text }}>Character Details</h2>
          <button
            onClick={onClose}
            style={CLOSE_BUTTON_STYLES}
            title="Close"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div style={CONTENT_STYLES}>
          <CreatureHeader creature={creature} />
          <TabbedCharacterPanel
            creature={creature}
            onUpdate={onCreatureUpdate}
          />
        </div>
      </div>
    </div>
  );
}

const OVERLAY_STYLES = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20,
  boxSizing: 'border-box' as const,
};

const POPUP_STYLES = {
  ...COMMON_STYLES.panel,
  width: '90%',
  maxWidth: 600,
  height: 600, // Fixed height instead of maxHeight percentage
  display: 'flex',
  flexDirection: 'column' as const,
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
};

const HEADER_STYLES = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: `1px solid ${COLORS.border}`,
  backgroundColor: COLORS.backgroundLight,
};

const CLOSE_BUTTON_STYLES = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: COLORS.text,
  padding: '4px 8px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s',
};

const CONTENT_STYLES = {
  padding: 20,
  overflowY: 'auto' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16,
  flex: 1,
};
