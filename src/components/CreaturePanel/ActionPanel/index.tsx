import React from 'react';
import { Creature } from '../../../creatures/index';
import { COMMON_STYLES } from '../../styles';

interface ActionPanelProps {
  creature: Creature;
  onRun?: () => void;
  onSearch?: () => void;
}

export function ActionPanel({ creature, onRun, onSearch }: ActionPanelProps) {
  // Only show for player controlled characters
  if (!creature.isPlayerControlled()) {
    return null;
  }

  return (
    <div style={ACTION_PANEL_STYLES}>
      <h3 style={SECTION_HEADER_STYLES}>Actions</h3>
      <div style={BUTTON_CONTAINER_STYLES}>
        <button 
          style={creature.remainingActions <= 0 ? ACTION_BUTTON_DISABLED_STYLES : ACTION_BUTTON_STYLES}
          onClick={onRun}
          disabled={creature.remainingActions <= 0}
        >
          Run
        </button>
        <button 
          style={creature.remainingActions <= 0 ? ACTION_BUTTON_DISABLED_STYLES : ACTION_BUTTON_STYLES}
          onClick={onSearch}
          disabled={creature.remainingActions <= 0}
        >
          Search
        </button>
      </div>
    </div>
  );
}

const ACTION_PANEL_STYLES = {
  ...COMMON_STYLES.section,
  marginBottom: 12,
};

const SECTION_HEADER_STYLES = {
  ...COMMON_STYLES.sectionHeader,
  marginBottom: 8,
};

const BUTTON_CONTAINER_STYLES = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
};

const ACTION_BUTTON_STYLES = {
  ...COMMON_STYLES.button,
  padding: '8px 12px',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#4a5568',
  color: 'white',
  transition: 'all 0.2s ease',
};

const ACTION_BUTTON_DISABLED_STYLES = {
  ...ACTION_BUTTON_STYLES,
  backgroundColor: '#718096',
  cursor: 'not-allowed',
  opacity: 0.6,
};
