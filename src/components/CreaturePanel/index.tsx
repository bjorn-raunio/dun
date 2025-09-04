import React from 'react';
import { ICreature } from '../../creatures/index';
import { CreatureHeader } from './CreatureHeader';
import { CreatureStats } from './CreatureStats';
import { EquipmentSection } from './EquipmentSection';
import { InventorySection } from './InventorySection';
import { SkillsSection } from './SkillsSection';
import { HeroSelector } from './HeroSelector';
import { ActionPanel } from './ActionPanel';
import { useActions } from '../../game/hooks/useActions';

import { COMMON_STYLES } from '../styles';

interface CreaturePanelProps {
  selectedCreature: ICreature | null;
  creatures: ICreature[];
  onDeselect: () => void;
  onSelectCreature?: (creature: ICreature) => void;
  onCreatureUpdate?: (creature: ICreature) => void;
  onAttack?: (creature: ICreature, offhand?: boolean) => void;
  canAttack?: (creature: ICreature) => boolean;
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
  // Use the useActions hook for run, search, and disengage actions
  const { handleAction } = useActions(creatures, onCreatureUpdate);

  if (!selectedCreature) {
    return (
      <div style={PANEL_STYLES}>
        <HeroSelector 
          heroes={creatures.filter(c => c.isPlayerControlled())} 
          onSelect={onSelectCreature} 
        />
      </div>
    );
  }

  return (
    <div style={PANEL_STYLES}>
      <CreatureHeader creature={selectedCreature} />
      <CreatureStats creature={selectedCreature} />
      <SkillsSection creature={selectedCreature} />
      <ActionPanel 
        creature={selectedCreature}
        allCreatures={creatures}
        onAction={handleAction}
      />
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
  height: "calc(100vh - 243.75px)",
  bottom: 243.75,
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
