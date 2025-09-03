import React from 'react';
import { TILE_SIZE } from '../styles';
import { QuestMap } from '../../maps/types';

interface ItemOverlayProps {
  mapDefinition: QuestMap;
}

export function ItemOverlay({ mapDefinition }: ItemOverlayProps) {
  const rows = mapDefinition?.tiles.length ?? 0;
  const cols = mapDefinition?.tiles[0]?.length ?? 0;

  if (!mapDefinition || rows === 0 || cols === 0) {
    return null;
  }

  const itemTiles: Array<{ x: number; y: number }> = [];

  // Find all tiles that contain items
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (mapDefinition.isWithinBounds(x, y)) {
        const tile = mapDefinition.tiles[y][x];
        if (tile && tile.items && tile.items.length > 0) {
          itemTiles.push({ x, y });
        }
      }
    }
  }

  return (
    <>
      {itemTiles.map(({ x, y }) => (
        <div
          key={`item-${x}-${y}`}
          style={{
            position: 'absolute',
            left: x * TILE_SIZE,
            top: y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <img
            src="/icons/item.png"
            alt="Item"
            style={{
              width: TILE_SIZE * 0.6, // Make icon slightly smaller than tile
              height: TILE_SIZE * 0.6,
              objectFit: 'contain',
            }}
          />
        </div>
      ))}
    </>
  );
}
