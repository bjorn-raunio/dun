import React from 'react';
import { TILE_SIZE } from '../styles';
import { QuestMap } from '../../maps/types';
import { useGameState } from '../../game/GameContext';

interface ItemOverlayProps {
  mapDefinition: QuestMap;
}

export function ItemOverlay({ mapDefinition }: ItemOverlayProps) {
  // Use the game state mapDefinition instead of the prop to get real-time updates
  const { mapDefinition: gameMapDefinition } = useGameState();
  
  // Use the game state map if available, otherwise fall back to the prop
  const activeMapDefinition = gameMapDefinition || mapDefinition;
  
  const rows = activeMapDefinition?.tiles.length ?? 0;
  const cols = activeMapDefinition?.tiles[0]?.length ?? 0;

  if (!activeMapDefinition || rows === 0 || cols === 0) {
    return null;
  }

  const itemTiles: Array<{ x: number; y: number }> = [];

  // Find all tiles that contain items
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (activeMapDefinition.isWithinBounds(x, y)) {
        const tile = activeMapDefinition.tiles[y][x];
        if (tile && tile.items && tile.items.length > 0) {
          itemTiles.push({ x, y });
        }
      }
    }
  }

  return (
    <>
      {itemTiles.map(({ x, y }) => {
        const tile = activeMapDefinition.tiles[y][x];
        const itemCount = tile.items.length;
        
        return (
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
            {/* Show item icon */}
            <img
              src="/icons/item.png"
              alt="Item"
              style={{
                width: TILE_SIZE * 0.6,
                height: TILE_SIZE * 0.6,
                objectFit: 'contain',
              }}
            />
            
            {/* Show item count if more than 1 */}
            {/*itemCount > 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 4px',
                  borderRadius: '8px',
                  minWidth: '16px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                {itemCount}
              </div>
            )*/}
          </div>
        );
      })}
    </>
  );
}
