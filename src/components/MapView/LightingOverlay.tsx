import React from 'react';
import { TILE_SIZE } from '../styles';
import { QuestMap, Light } from '../../maps/types';

interface LightingOverlayProps {
  mapDefinition: QuestMap;
}

export function LightingOverlay({ mapDefinition }: LightingOverlayProps) {
  const rows = mapDefinition.tiles.length;
  const cols = mapDefinition.tiles[0].length;
  const gridItems: React.ReactNode[] = [];

  // Generate lighting overlay for each tile
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tile = mapDefinition.tiles[y][x];
      const lightLevel = tile.light;

      // Skip if tile is fully lit
      if (lightLevel === Light.lit) continue;

      // Calculate darkness opacity based on light level
      let opacity = 0;
      if (lightLevel === Light.darkness) {
        opacity = 0.5; // Medium darkness
      } else if (lightLevel === Light.totalDarkness) {
        opacity = 0.8; // Heavy darkness
      }

      gridItems.push(
        <div
          key={`lighting-${x}-${y}`}
          style={{
            gridColumn: `${x + 1} / span 1`,
            gridRow: `${y + 1} / span 1`,
            width: TILE_SIZE,
            height: TILE_SIZE,
            backgroundColor: `rgba(0, 0, 0, ${opacity})`,
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 1, // Above terrain, below other overlays
          }}
        />
      );
    }
  }

  return <>{gridItems}</>;
}
