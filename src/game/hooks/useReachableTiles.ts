import React from 'react';
import { ICreature } from '../../creatures/index';
import { findCreatureById } from '../../utils/pathfinding';
import { MapDefinition } from '../../maps/types';

// --- Reachable Tiles Hook ---

export function useReachableTiles(
  creatures: ICreature[],
  selectedCreatureId: string | null,
  mapData: { tiles: string[][] },
  reachableKey: number,
  mapDefinition?: MapDefinition
) {
  // Calculate possible squares for selected creature
  const reachable = React.useMemo(() => {
    if (!selectedCreatureId) return { tiles: [] as Array<{x: number; y: number}>, costMap: new Map<string, number>(), pathMap: new Map<string, Array<{x: number; y: number}>>() };
    const selected = findCreatureById(creatures, selectedCreatureId);
    if (!selected || !selected.isPlayerControlled()) return { tiles: [] as Array<{x: number; y: number}>, costMap: new Map<string, number>(), pathMap: new Map<string, Array<{x: number; y: number}>>() };

    // Use the creature's built-in pathfinding method
    return selected.getReachableTiles(creatures, mapData, mapData.tiles[0].length, mapData.tiles.length, mapDefinition);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCreatureId, creatures, mapData, mapDefinition, reachableKey]);

  return reachable;
}
