import React from 'react';
import { Region as RegionType, RegionConnection } from '../../worldmap/types';
import { Region as RegionClass } from '../../worldmap/Region';

interface ConnectionOverlayProps {
  regions: RegionClass[];
  currentRegionId: string;
}

export function ConnectionOverlay({ regions, currentRegionId }: ConnectionOverlayProps) {
  const currentRegion = regions.find(r => r.id === currentRegionId);
  
  if (!currentRegion) return null;

  const connections = currentRegion.connections.filter(conn => !conn.isBlocked);
  
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
        
        // Calculate connection line properties based on type
        const getConnectionStyle = (connType: RegionConnection['connectionType']) => {
          switch (connType) {
            case 'road':
              return { stroke: '#8B4513', strokeWidth: 4, strokeDasharray: 'none' };
            case 'path':
              return { stroke: '#654321', strokeWidth: 2, strokeDasharray: 'none' };
            case 'river':
              return { stroke: '#4169E1', strokeWidth: 3, strokeDasharray: 'none' };
            case 'mountain_pass':
              return { stroke: '#696969', strokeWidth: 2, strokeDasharray: '5,5' };
            case 'sea':
              return { stroke: '#1E90FF', strokeWidth: 3, strokeDasharray: '10,5' };
            default:
              return { stroke: '#666', strokeWidth: 2, strokeDasharray: 'none' };
          }
        };

        const style = getConnectionStyle(connection.connectionType);
        
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
              {connection.distance}
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
            fill="#666"
          />
        </marker>
      </defs>
    </svg>
  );
}
