import React from 'react';
import { Creature, ICreature } from '../../../creatures/index';
import { COMMON_STYLES } from '../../styles';

interface ActionPanelProps {
  creature: ICreature;
  onRun?: () => void;
  onSearch?: () => void;
  onDisengage?: () => void;
}

export function ActionPanel({ creature, onRun, onSearch, onDisengage }: ActionPanelProps) {
  // Only show for player controlled characters
  if (!creature.isPlayerControlled()) {
    return null;
  }

  return (
    <div style={BUTTON_CONTAINER_STYLES}>
      <button 
        style={!creature.canRun() ? ACTION_BUTTON_DISABLED_STYLES : ACTION_BUTTON_STYLES}
        onClick={onRun}
        disabled={!creature.canRun()}
      >
        Run
      </button>
      <button 
        style={!creature.canSearch() ? ACTION_BUTTON_DISABLED_STYLES : ACTION_BUTTON_STYLES}
        onClick={onSearch}
        disabled={!creature.canSearch()}
      >
        Search
      </button>
      <button 
        style={!creature.canDisengage() ? ACTION_BUTTON_DISABLED_STYLES : ACTION_BUTTON_STYLES}
        onClick={onDisengage}
        disabled={!creature.canDisengage()}
      >
        Disengage
      </button>
    </div>
  );
}



const BUTTON_CONTAINER_STYLES = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
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
