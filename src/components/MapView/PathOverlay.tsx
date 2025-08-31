import React from 'react';
import { TILE_SIZE, COLORS } from '../styles';

interface PathOverlayProps {
  highlightedPath: Array<{ x: number; y: number }>;
  cols: number;
  rows: number;
  targetingMode?: { isActive: boolean; attackerId: string | null; message: string };
}

export function PathOverlay({ 
  highlightedPath, 
  cols, 
  rows, 
  targetingMode 
}: PathOverlayProps) {
  // Don't show path highlights if no path or if in targeting mode
  if (highlightedPath.length === 0 || targetingMode?.isActive) return null;

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
      {highlightedPath.map((tile, index) => (
        <div
          key={`path-${tile.x}-${tile.y}-${index}`}
          style={{
            position: "absolute",
            left: tile.x * TILE_SIZE,
            top: tile.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            background: COLORS.pathHighlight,
            boxShadow: `inset 0 0 0 2px ${COLORS.pathHighlightBorder}`,
            borderRadius: 6,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}
