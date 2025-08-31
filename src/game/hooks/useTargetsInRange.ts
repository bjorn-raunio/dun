import React from 'react';
import { Creature } from '../../creatures/index';
import { calculateTargetsInRange } from '../../utils/combat';
import { findCreatureById, isCreatureVisible } from '../../utils/pathfinding';
import { logGame } from '../../utils/logging';
import { MapDefinition } from '../../maps/types';

// --- Targets in Range Hook ---

export function useTargetsInRange(
  creatures: Creature[],
  selectedCreatureId: string | null,
  targetsInRangeKey: number,
  mapData?: { tiles: string[][] },
  mapDefinition?: MapDefinition
) {
  const [targetsInRangeIds, setTargetsInRangeIds] = React.useState<Set<string>>(new Set());

  // Calculate targets in range when a player-controlled creature is selected or the list changes
  React.useEffect(() => {
    const sel = selectedCreatureId ? findCreatureById(creatures, selectedCreatureId) : null;
    if (!sel) {
      setTargetsInRangeIds(new Set());
      return;
    }

    logGame(`Calculating targets in range for ${sel.name} at (${sel.x}, ${sel.y})`);
    
    // Get basic targets in range
    const basicTargetsInRange = calculateTargetsInRange(sel, creatures);
    
    // Filter by line of sight if map data is available
    let finalTargetsInRange = basicTargetsInRange;
    
    if (mapData && mapData.tiles && mapData.tiles.length > 0) {
      const cols = mapData.tiles[0].length;
      const rows = mapData.tiles.length;
      
      const visibleTargets = new Set<string>();
      
      for (const targetId of Array.from(basicTargetsInRange)) {
        const target = findCreatureById(creatures, targetId);
        if (target && isCreatureVisible(
          sel.x, 
          sel.y, 
          target, 
          mapData, 
          cols, 
          rows, 
          mapDefinition,
          {},
          sel,
          creatures
        )) {
          visibleTargets.add(targetId);
        }
      }
      
      finalTargetsInRange = visibleTargets;
      logGame(`Line of sight filtering: ${basicTargetsInRange.size} -> ${visibleTargets.size} visible targets`);
    }
    
    logGame(`Final targets in range: ${Array.from(finalTargetsInRange).join(', ')}`);
    setTargetsInRangeIds(finalTargetsInRange);
  }, [selectedCreatureId, creatures, targetsInRangeKey, mapData, mapDefinition]);

  return {
    targetsInRangeIds,
    setTargetsInRangeIds
  };
}
