import React from 'react';
import { CreatureAction, ICreature } from '../../../creatures/index';
import { LAYOUT_PATTERNS, createConditionalButtonStyle } from '../../styles';
import { validateAction } from '../../../validation';

interface ActionPanelProps {
  creature: ICreature;
  allCreatures: ICreature[];
  onAction: (creature: ICreature, action: CreatureAction) => void;
}

export function ActionPanel({ creature, allCreatures, onAction }: ActionPanelProps) {
  // Only show for player controlled characters
  if (!creature.isPlayerControlled()) {
    return null;
  }

  return (
    <div style={LAYOUT_PATTERNS.grid3Col}>
      <button 
        style={createConditionalButtonStyle('action', validateAction(creature, 'run', allCreatures))}
        onClick={() => onAction(creature, 'run')}
        disabled={!validateAction(creature, 'run', allCreatures)}
      >
        Run
      </button>
      <button 
        style={createConditionalButtonStyle('action', validateAction(creature, 'search', []))}
        onClick={() => onAction(creature, 'search')}
        disabled={!validateAction(creature, 'search', [])}
      >
        Search
      </button>
      <button 
        style={createConditionalButtonStyle('action', validateAction(creature, 'disengage', allCreatures))}
        onClick={() => onAction(creature, 'disengage')}
        disabled={!validateAction(creature, 'disengage', allCreatures)}
      >
        Disengage
      </button>
    </div>
  );
}
