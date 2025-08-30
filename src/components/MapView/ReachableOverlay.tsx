import React from 'react';
import { TILE_SIZE, COLORS } from '../styles';

interface ReachableOverlayProps {
  reachable: {
    tiles: Array<{ x: number; y: number }>;
    costMap: Map<string, number>;
    pathMap: Map<string, Array<{ x: number; y: number }>>;
  };
  selectedCreatureId: string | null;
  cols: number;
  rows: number;
}

export function ReachableOverlay({ reachable, selectedCreatureId, cols, rows }: ReachableOverlayProps) {
  if (!selectedCreatureId) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: TILE_SIZE * cols,
        height: TILE_SIZE * rows,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {reachable.tiles.map((t: any) => (
        <div
          key={`reach-${t.x}-${t.y}`}
          style={{
            position: "absolute",
            left: t.x * TILE_SIZE,
            top: t.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            background: COLORS.reachable,
            boxShadow: `inset 0 0 0 2px ${COLORS.reachableBorder}`,
            borderRadius: 6,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}
