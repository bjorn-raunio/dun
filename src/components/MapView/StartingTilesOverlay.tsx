import React from 'react';
import { TILE_SIZE } from '../styles';
import { MapDefinition } from '../../maps/types';

interface StartingTilesOverlayProps {
  mapDefinition: MapDefinition;
}

export function StartingTilesOverlay({ mapDefinition }: StartingTilesOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2, // Above terrain but below creatures
      }}
    >
      {mapDefinition.startingTiles.map((tile, index) => {
        return (
          <div
            key={`starting-tile-${index}`}
            style={{
              position: "absolute",
              left: tile.x * TILE_SIZE,
              top: tile.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              pointerEvents: "none",
            }}
          >
            {/* Render starting tile as JPEG image - same style as terrain */}
            <img
              src={process.env.PUBLIC_URL + "/" + (tile.image || "entrance.jpg")}
              alt="Starting position"
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "fill",
                display: "block",
                pointerEvents: "none",
                opacity: 0.9,
                borderRadius: "4px",
              }}
              onError={(e) => {
                // Hide image if it fails to load
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
