import React from 'react';
import { TILE_SIZE, COLORS } from '../styles';
import { QuestMap } from '../../maps/types';
import { Section } from '../../maps/section';

interface MapRendererProps {
  mapDefinition: QuestMap;
}

export function MapRenderer({ mapDefinition }: MapRendererProps) {
  const rows = mapDefinition.tiles.length;
  const cols = mapDefinition.tiles[0].length;
  const gridItems: React.ReactNode[] = [];

  // Track which tiles are already rendered as part of a block
  const rendered: boolean[][] = Array.from(
    { length: mapDefinition.tiles.length }, 
    () => Array(mapDefinition.tiles[0].length).fill(false)
  );

  // Helper function to find if this is the top-left of a block and its size
  function getBlockAt(x: number, y: number): Section | null {
    for (const room of mapDefinition.rooms) {
      for (const section of room.sections) {
        if (section.x === x && section.y === y) return section;
      }
    }
    return null;
  }

  // Generate grid items for rooms/blocks
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (rendered[y][x]) continue;
      
      const section = getBlockAt(x, y);
      if (section) {
        // Use pre-calculated rotated dimensions
        const sectionWidth = section.rotatedWidth;
        const sectionHeight = section.rotatedHeight;
        
        // Mark all tiles in the section as rendered
        for (let dy = 0; dy < sectionHeight; dy++) {
          for (let dx = 0; dx < sectionWidth; dx++) {
            if (
              y + dy < rows &&
              x + dx < cols &&
              mapDefinition.tiles[y + dy][x + dx].image === section.image
            ) {
              rendered[y + dy][x + dx] = true;
            }
          }
        }
        
        const wrapperWidth = TILE_SIZE * sectionWidth;
        const wrapperHeight = TILE_SIZE * sectionHeight;
        // Inner wrapper size before rotation
        const innerWidth = (section.rotation === 90 || section.rotation === 270) ? wrapperHeight : wrapperWidth;
        const innerHeight = (section.rotation === 90 || section.rotation === 270) ? wrapperWidth : wrapperHeight;
        
        gridItems.push(
          <div
            key={`${section.image}-${x}-${y}`}
            style={{
              gridColumn: `${x + 1} / span ${sectionWidth}`,
              gridRow: `${y + 1} / span ${sectionHeight}`,
              width: wrapperWidth,
              height: wrapperHeight,
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
                  section.rotation === 90
                    ? `rotate(90deg)`
                    : section.rotation === 180
                    ? `rotate(180deg)`
                    : section.rotation === 270
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
                src={process.env.PUBLIC_URL + "/rooms/" + section.image}
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
