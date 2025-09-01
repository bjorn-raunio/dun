import React from 'react';
import { TILE_SIZE, COLORS } from '../styles';
import { typeToImage } from '../../maps';
import { MapBlock } from './types';
import { MapDefinition } from '../../maps/types';

interface MapRendererProps {
  mapData: {
    tiles: string[][];
  };
  mapDefinition: MapDefinition;
}

export function MapRenderer({ mapData, mapDefinition }: MapRendererProps) {
  const rows = mapData.tiles.length;
  const cols = mapData.tiles[0].length;
  const gridItems: React.ReactNode[] = [];

  // Track which tiles are already rendered as part of a block
  const rendered: boolean[][] = Array.from(
    { length: mapData.tiles.length }, 
    () => Array(mapData.tiles[0].length).fill(false)
  );

  // Helper function to find if this is the top-left of a block and its size
  function getBlockAt(x: number, y: number): MapBlock | null {
    for (const room of mapDefinition.rooms) {
      if (room.x === x && room.y === y) return room;
    }
    return null;
  }

  // Generate grid items for rooms/blocks
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (rendered[y][x]) continue;
      
      const block = getBlockAt(x, y);
      if (block) {
        // Use pre-calculated rotated dimensions
        const blockWidth = block.rotatedWidth;
        const blockHeight = block.rotatedHeight;
        
        // Mark all tiles in the block as rendered
        for (let dy = 0; dy < blockHeight; dy++) {
          for (let dx = 0; dx < blockWidth; dx++) {
            if (
              y + dy < rows &&
              x + dx < cols &&
              mapData.tiles[y + dy][x + dx] === typeToImage[block.type]
            ) {
              rendered[y + dy][x + dx] = true;
            }
          }
        }
        
        const wrapperWidth = TILE_SIZE * blockWidth;
        const wrapperHeight = TILE_SIZE * blockHeight;
        // Inner wrapper size before rotation
        const innerWidth = (block.rotation === 90 || block.rotation === 270) ? wrapperHeight : wrapperWidth;
        const innerHeight = (block.rotation === 90 || block.rotation === 270) ? wrapperWidth : wrapperHeight;
        
        gridItems.push(
          <div
            key={`${block.type}-${x}-${y}`}
            style={{
              gridColumn: `${x + 1} / span ${blockWidth}`,
              gridRow: `${y + 1} / span ${blockHeight}`,
              width: wrapperWidth,
              height: wrapperHeight,
              border: "1px solid #444",
              boxSizing: "border-box",
              background: COLORS.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: innerWidth,
                height: innerHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform:
                  block.rotation === 90
                    ? `rotate(90deg)`
                    : block.rotation === 180
                    ? `rotate(180deg)`
                    : block.rotation === 270
                    ? `rotate(270deg)`
                    : undefined,
                transformOrigin: "center",
                position: "absolute",
                top: "50%",
                left: "50%",
                translate: "-50% -50%",
                transition: "transform 0.2s",
              }}
            >
              <img
                src={process.env.PUBLIC_URL + "/" + typeToImage[block.type]}
                alt={block.type}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  display: "block",
                  pointerEvents: "none",
                }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          </div>
        );
      }
    }
  }

  return <>{gridItems}</>;
}
