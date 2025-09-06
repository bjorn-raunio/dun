import React, { useState } from 'react';
import { ICreature } from '../../creatures/index';
import { CreatureHeader } from './CreatureHeader';
import { SimpleCreatureStats } from './SimpleCreatureStats';
import { EquipmentSection } from './EquipmentSection';
import { HeroSelector } from './HeroSelector';
import { ActionPanel } from './ActionPanel';
import { CharacterPopup } from './CharacterPopup';
import { TileContentsList } from './TileContentsList';
import { useActions } from '../../game/hooks/useActions';
import { useGameContext } from '../../game/GameContext';

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
  
  // Get mapDefinition from game context
  const { state } = useGameContext();
  const { mapDefinition } = state;
  
  // State for character popup
  const [popupCreature, setPopupCreature] = useState<ICreature | null>(null);
  
  const handleExamine = (creature: ICreature) => {
    setPopupCreature(creature);
  };
  
  const handleClosePopup = () => {
    setPopupCreature(null);
  };

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
    <>
      <div style={PANEL_STYLES}>
        <CreatureHeader creature={selectedCreature} onExamine={handleExamine} />
        <EquipmentSection 
          creature={selectedCreature} 
          onUpdate={onCreatureUpdate}
          onAttack={onAttack}
          canAttack={canAttack}
        />
        <SimpleCreatureStats creature={selectedCreature} />
        <ActionPanel 
          creature={selectedCreature}
          allCreatures={creatures}
          onAction={handleAction}
        />
        <TileContentsList 
          creature={selectedCreature}
          mapDefinition={mapDefinition}
          onUpdate={onCreatureUpdate}
        />
      </div>
      
      {/* Character popup */}
      {popupCreature && (
        <CharacterPopup
          creature={popupCreature}
          onClose={handleClosePopup}
          onCreatureUpdate={onCreatureUpdate}
        />
      )}
    </>
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
