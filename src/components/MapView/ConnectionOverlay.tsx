import React from 'react';
import { TILE_SIZE } from '../styles';
import { getRotatedDimensions } from '../../utils/dimensions';
import { QuestMap } from '../../maps/types';
import { Connection } from '../../maps/connection/connection';

interface ConnectionOverlayProps {
  mapDefinition: QuestMap;
}

export function ConnectionOverlay({ mapDefinition }: ConnectionOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 3, // Higher than terrain but lower than creatures
      }}
    >
      {mapDefinition.getConnections().map((connection: Connection, index: number) => {
        const { width: blockWidth, height: blockHeight } = getRotatedDimensions(
          connection.mapWidth, 
          connection.mapHeight, 
          connection.rotation
        );
        const wrapperWidth = TILE_SIZE * blockWidth;
        const wrapperHeight = TILE_SIZE * blockHeight;
        // Inner wrapper size before rotation
        const innerWidth = (connection.rotation === 90 || connection.rotation === 270) ? wrapperHeight : wrapperWidth;
        const innerHeight = (connection.rotation === 90 || connection.rotation === 270) ? wrapperWidth : wrapperHeight;
        
        return (
          <div
            key={`connection-${index}`}
            style={{
              position: "absolute",
              left: connection.x * TILE_SIZE,
              top: connection.y * TILE_SIZE,
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
                  connection.rotation === 90
                    ? `rotate(90deg)`
                    : connection.rotation === 180
                    ? `rotate(180deg)`
                    : connection.rotation === 270
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
                src={process.env.PUBLIC_URL + "/doors/" + (connection.image || "connections/unknown.png")}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  display: "block",
                  pointerEvents: "none",
                  opacity: 1.0,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
