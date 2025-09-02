import React from 'react';
import { ICreature } from '../../creatures/index';
import { findCreatureById } from '../../utils/pathfinding';
import { QuestMap } from '../../maps/types';

// --- Reachable Tiles Hook ---

export function useReachableTiles(
  creatures: ICreature[],
  selectedCreatureId: string | null,
  mapDefinition: QuestMap,
  reachableKey: number
) {
  // Calculate possible squares for selected creature
  const reachable = React.useMemo(() => {
    if (!selectedCreatureId) return { tiles: [] as Array<{x: number; y: number}>, costMap: new Map<string, number>(), pathMap: new Map<string, Array<{x: number; y: number}>>() };
    const selected = findCreatureById(creatures, selectedCreatureId);
    if (!selected || !selected.isPlayerControlled()) return { tiles: [] as Array<{x: number; y: number}>, costMap: new Map<string, number>(), pathMap: new Map<string, Array<{x: number; y: number}>>() };

    // Use the creature's built-in pathfinding method
    return selected.getReachableTiles(creatures, mapDefinition, mapDefinition.tiles[0].length, mapDefinition.tiles.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCreatureId, creatures, mapDefinition, reachableKey]);

  return reachable;
}
