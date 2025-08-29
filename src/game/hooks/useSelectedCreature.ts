import React from 'react';
import { Creature } from '../../creatures/index';
import { findCreatureById } from '../../utils/pathfinding';

// --- Selected Creature Hook ---

export function useSelectedCreature(
  creatures: Creature[],
  selectedCreatureId: string | null
) {
  const selectedCreature = React.useMemo(() => {
    return selectedCreatureId ? findCreatureById(creatures, selectedCreatureId) : null;
  }, [creatures, selectedCreatureId]);

  return selectedCreature;
}
