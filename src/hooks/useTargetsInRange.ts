import React from 'react';
import { Creature } from '../creatures';
import { getTargetsInRangeForHero } from '../utils';

// --- Targets in Range Hook ---

export function useTargetsInRange(
  creatures: Creature[],
  selectedCreatureId: string | null,
  targetsInRangeKey: number
) {
  const [targetsInRangeIds, setTargetsInRangeIds] = React.useState<Set<string>>(new Set());

  // Calculate targets in range when a hero is selected or the list changes
  React.useEffect(() => {
    const sel = creatures.find(c => c.id === selectedCreatureId);
    if (!sel || sel.kind !== "hero") {
      setTargetsInRangeIds(new Set());
      return;
    }
    
    console.log(`Calculating targets in range for ${sel.name} at (${sel.x}, ${sel.y})`);
    
    const inRange = getTargetsInRangeForHero(sel, creatures);
    console.log(`  Targets in range: ${Array.from(inRange).join(', ')}`);
    setTargetsInRangeIds(inRange);
  }, [selectedCreatureId, creatures, targetsInRangeKey]);

  return {
    targetsInRangeIds,
    setTargetsInRangeIds,
  };
}
