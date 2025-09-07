import React from 'react';
import { ICreature } from '../../creatures/index';
import { calculateTargetsInRange } from '../../utils/combat';
import { findCreatureById, isCreatureVisible } from '../../utils/pathfinding';
import { logGame } from '../../utils/logging';
import { QuestMap } from '../../maps/types';

// --- Targets in Range Hook ---

export function useTargetsInRange(
  creatures: ICreature[],
  selectedCreatureId: string | null,
  targetsInRangeKey: number,
  mapDefinition: QuestMap | null,
  targetingMode?: { isActive: boolean; attackerId: string | null; message: string; offhand?: boolean }
) {
  const [targetsInRangeIds, setTargetsInRangeIds] = React.useState<Set<string>>(new Set());

  // Calculate targets in range when a player-controlled creature is selected or the list changes
  React.useEffect(() => {
    const sel = selectedCreatureId ? findCreatureById(creatures, selectedCreatureId) : null;
    if (!sel) {
      setTargetsInRangeIds(new Set());
      return;
    }

    // Skip if selected creature is not on the map (undefined position)
    if (sel.x === undefined || sel.y === undefined) {
      logGame(`Selected creature ${sel.name} is not on the map, skipping targets calculation`);
      setTargetsInRangeIds(new Set());
      return;
    }

    logGame(`Calculating targets in range for ${sel.name} at (${sel.x}, ${sel.y})`);
    
    // Determine which weapon to use for range calculation
    let offhand = false;
    if (targetingMode?.isActive && targetingMode.attackerId === sel.id) {
      offhand = targetingMode.offhand || false;
    }
    
    // Get basic targets in range
    const basicTargetsInRange = calculateTargetsInRange(sel, creatures, offhand);
    
    // Filter by line of sight if map data is available
    let finalTargetsInRange = basicTargetsInRange;
    
    if (mapDefinition && mapDefinition.tiles && mapDefinition.tiles.length > 0) {
      const cols = mapDefinition.tiles[0].length;
      const rows = mapDefinition.tiles.length;
      
      const visibleTargets = new Set<string>();
      
      for (const targetId of Array.from(basicTargetsInRange)) {
        const target = findCreatureById(creatures, targetId);
        // Skip targets that are not on the map (undefined position)
        if (target && target.x !== undefined && target.y !== undefined && sel.x !== undefined && sel.y !== undefined && isCreatureVisible(
          sel.x, 
          sel.y, 
          target, 
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
  }, [selectedCreatureId, creatures, targetsInRangeKey, mapDefinition, targetingMode]);

  return {
    targetsInRangeIds,
    setTargetsInRangeIds
  };
}
