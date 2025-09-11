import React from 'react';
import { IRegion as RegionType, RegionConnection } from '../../worldmap/types';
import { Region as RegionClass } from '../../worldmap/Region';

interface ConnectionOverlayProps {
  regions: RegionClass[];
  currentRegionId: string;
}

export function ConnectionOverlay({ regions, currentRegionId }: ConnectionOverlayProps) {
  const currentRegion = regions.find(r => r.id === currentRegionId);
  
  if (!currentRegion) return null;

  const connections = currentRegion.connections;
  
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {connections.map((connection, index) => {
        const targetRegion = regions.find(r => r.id === connection.targetRegionId);
        if (!targetRegion) return null;

        const start = currentRegion.getCenterPosition();
        const end = targetRegion.getCenterPosition();
        
        const style = { 
          stroke: '#7ED321', 
          strokeWidth: 3, 
          strokeDasharray: 'none',
          opacity: 0.8
        };
        
        return (
          <g key={`${currentRegion.id}-${targetRegion.id}-${index}`}>
            {/* Connection line */}
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              {...style}
              markerEnd="url(#arrowhead)"
            />
            
            {/* Distance label */}
            <text
              x={(start.x + end.x) / 2}
              y={(start.y + end.y) / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '10px',
                fill: '#fff',
                stroke: '#000',
                strokeWidth: 2,
                pointerEvents: 'none',
              }}
            >
            </text>
          </g>
        );
      })}
      
      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#7ED321"
          />
        </marker>
      </defs>
    </svg>
  );
}
