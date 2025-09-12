import React from 'react';
import { TILE_SIZE, COLORS } from '../styles';
import { TargetingMode } from '../../game/types';

interface ReachableOverlayProps {
  reachable: {
    tiles: Array<{ x: number; y: number }>;
    costMap: Map<string, number>;
    pathMap: Map<string, Array<{ x: number; y: number }>>;
  };
  selectedCreatureId: string | null;
  cols: number;
  rows: number;
  targetingMode?: TargetingMode;
}

export function ReachableOverlay({ 
  reachable, 
  selectedCreatureId, 
  cols, 
  rows, 
  targetingMode 
}: ReachableOverlayProps) {
  // Don't show reachable tiles if no creature is selected or if in targeting mode
  if (!selectedCreatureId || targetingMode?.isActive) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: TILE_SIZE * cols,
        height: TILE_SIZE * rows,
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      {reachable.tiles.map((t: { x: number; y: number }) => (
        <div
          key={`reach-${t.x}-${t.y}`}
          style={{
            position: "absolute",
            left: t.x * TILE_SIZE,
            top: t.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            background: COLORS.reachable,
            boxShadow: `inset 0 0 0 4px ${COLORS.reachableBorder}`,
            borderRadius: 12,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}
