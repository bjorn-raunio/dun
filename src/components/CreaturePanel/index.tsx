import React from 'react';
import { Creature } from '../../creatures/index';
import { CreatureHeader } from './CreatureHeader';
import { CreatureStats } from './CreatureStats';
import { EquipmentSection } from './EquipmentSection';
import { InventorySection } from './InventorySection';
import { HeroSelector } from './HeroSelector';

import { COMMON_STYLES } from '../styles';

interface CreaturePanelProps {
  selectedCreature: Creature | null;
  creatures: Creature[];
  onDeselect: () => void;
  onSelectCreature?: (creature: Creature) => void;
  onCreatureUpdate?: (creature: Creature) => void;
  onAttack?: (creature: Creature) => void;
  canAttack?: (creature: Creature) => boolean;
}

export function CreaturePanel({ 
  selectedCreature, 
  creatures, 
  onDeselect, 
  onSelectCreature, 
  onCreatureUpdate,
  onAttack,
  canAttack
}: CreaturePanelProps) {
  if (!selectedCreature) {
    return (
      <div style={PANEL_STYLES}>
        <HeroSelector 
          heroes={creatures.filter(c => c.isHeroGroup())} 
          onSelect={onSelectCreature} 
        />
      </div>
    );
  }

  return (
    <div style={PANEL_STYLES}>
      <CreatureHeader creature={selectedCreature} />
      <CreatureStats creature={selectedCreature} />
      <EquipmentSection 
        creature={selectedCreature} 
        onUpdate={onCreatureUpdate}
        onAttack={onAttack}
        canAttack={canAttack}
      />
      <InventorySection 
        creature={selectedCreature} 
        onUpdate={onCreatureUpdate} 
      />
    </div>
  );
}

const PANEL_STYLES = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  height: "calc(100vh - 162.5px)",
  bottom: 162.5,
  width: 280,
  ...COMMON_STYLES.panel,
  padding: 16,
  boxSizing: "border-box" as const,
  zIndex: 12,
  pointerEvents: "auto" as const,
  display: "flex",
  flexDirection: "column" as const,
  gap: 12,
};
