import React from 'react';
import { Creature } from '../creatures/index';

// --- Reachable Tiles Hook ---

export function useReachableTiles(
  creatures: Creature[],
  selectedCreatureId: string | null,
  mapData: { tiles: string[][] },
  reachableKey: number,
  mapDefinition?: any
) {
  // Calculate possible squares for selected creature
  const reachable = React.useMemo(() => {
    if (!selectedCreatureId) return { tiles: [] as Array<{x: number; y: number}>, costMap: new Map<string, number>() };
    const selected = creatures.find(c => c.id === selectedCreatureId);
    if (!selected || !selected.isPlayerControlled()) return { tiles: [] as Array<{x: number; y: number}>, costMap: new Map<string, number>() };

    // Use the creature's built-in pathfinding method
    return selected.getReachableTiles(creatures, mapData, mapData.tiles[0].length, mapData.tiles.length, mapDefinition);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCreatureId, creatures, mapData, mapDefinition, reachableKey]);

  return reachable;
}
