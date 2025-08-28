import React from 'react';
import { Creature } from '../creatures';

// --- Selected Creature Hook ---

export function useSelectedCreature(
  creatures: Creature[],
  selectedCreatureId: string | null
) {
  const selectedCreature = React.useMemo(() => {
    return creatures.find(c => c.id === selectedCreatureId) || null;
  }, [creatures, selectedCreatureId]);

  return selectedCreature;
}
