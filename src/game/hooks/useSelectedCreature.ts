import React from 'react';
import { ICreature } from '../../creatures/index';
import { findCreatureById } from '../../utils/pathfinding';

// --- Selected Creature Hook ---

export function useSelectedCreature(
  creatures: ICreature[],
  selectedCreatureId: string | null
) {
  const selectedCreature = React.useMemo(() => {
    return selectedCreatureId ? findCreatureById(creatures, selectedCreatureId) : null;
  }, [creatures, selectedCreatureId]);

  return selectedCreature;
}
