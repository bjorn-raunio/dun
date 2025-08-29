import React from 'react';
import { Creature } from '../../creatures/index';
import { calculateTargetsInRange } from '../../utils/combatUtils';
import { findCreatureById } from '../../utils/pathfinding';

// --- Targets in Range Hook ---

export function useTargetsInRange(
  creatures: Creature[],
  selectedCreatureId: string | null,
  targetsInRangeKey: number
) {
  const [targetsInRangeIds, setTargetsInRangeIds] = React.useState<Set<string>>(new Set());

  // Calculate targets in range when a player-controlled creature is selected or the list changes
  React.useEffect(() => {
    const sel = selectedCreatureId ? findCreatureById(creatures, selectedCreatureId) : null;
    if (!sel || !sel.isPlayerControlled()) {
      setTargetsInRangeIds(new Set());
      return;
    }
    
    console.log(`Calculating targets in range for ${sel.name} at (${sel.x}, ${sel.y})`);
    
    const inRange = calculateTargetsInRange(sel, creatures);
    console.log(`  Targets in range: ${Array.from(inRange).join(', ')}`);
    setTargetsInRangeIds(inRange);
  }, [selectedCreatureId, creatures, targetsInRangeKey]);

  return {
    targetsInRangeIds,
    setTargetsInRangeIds,
  };
}
