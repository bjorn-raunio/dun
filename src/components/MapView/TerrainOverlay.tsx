import React from 'react';
import { TILE_SIZE } from '../styles';
import { getRotatedDimensions } from '../../utils/dimensions';
import { TerrainItem } from './types';
import { QuestMap } from '../../maps/types';
import { Terrain } from '../../maps/terrain';

interface TerrainOverlayProps {
  mapDefinition: QuestMap;
}

export function TerrainOverlay({ mapDefinition }: TerrainOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {mapDefinition.getTerrain().map((t: Terrain, index: number) => {
        const { width: blockWidth, height: blockHeight } = getRotatedDimensions(
          t.mapWidth, 
          t.mapHeight, 
          t.rotation
        );
        const wrapperWidth = TILE_SIZE * blockWidth;
        const wrapperHeight = TILE_SIZE * blockHeight;
        // Inner wrapper size before rotation
        const innerWidth = (t.rotation === 90 || t.rotation === 270) ? wrapperHeight : wrapperWidth;
        const innerHeight = (t.rotation === 90 || t.rotation === 270) ? wrapperWidth : wrapperHeight;
        
        return (
          <div
            key={`terrain-${index}`}
            style={{
              position: "absolute",
              left: t.x * TILE_SIZE,
              top: t.y * TILE_SIZE,
              width: wrapperWidth,
              height: wrapperHeight,
              overflow: "hidden",
              pointerEvents: "none",
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
                  t.rotation === 90
                    ? `rotate(90deg)`
                    : t.rotation === 180
                    ? `rotate(180deg)`
                    : t.rotation === 270
                    ? `rotate(270deg)`
                    : undefined,
                transformOrigin: "center",
                position: "absolute",
                top: "50%",
                left: "50%",
                translate: "-50% -50%",
              }}
            >
              <img
                src={process.env.PUBLIC_URL + "/" + (t.image || "terrain_unknown.png")}
                alt={t.type}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  display: "block",
                  pointerEvents: "none",
                  opacity: 0.9,
                }}
                onError={(e) => ((e.currentTarget.style.display = "none"))}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
