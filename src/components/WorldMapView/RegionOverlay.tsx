import React from 'react';
import { Region as RegionType } from '../../worldmap/types';
import { Region as RegionClass } from '../../worldmap/Region';

interface RegionOverlayProps {
  regions: RegionClass[];
  currentRegionId: string;
  onRegionClick?: (region: RegionClass) => void;
  onRegionHover?: (region: RegionClass | null) => void;
}

export function RegionOverlay({ 
  regions, 
  currentRegionId, 
  onRegionClick, 
  onRegionHover 
}: RegionOverlayProps) {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {regions.map(region => {
        const isCurrentRegion = region.id === currentRegionId;
        const isExplored = region.isExplored;
        
        // Convert vertices to absolute world coordinates
        const points = region.vertices.map(vertex => 
          `${region.position.x + vertex.x},${region.position.y + vertex.y}`
        ).join(' ');
        
        // Determine colors based on region state
        const borderColor = isCurrentRegion 
          ? '#00e5ff' 
          : isExplored 
            ? '#4caf50' 
            : '#666';
        
        const fillColor = isCurrentRegion 
          ? 'rgba(0, 229, 255, 0.2)' 
          : isExplored 
            ? 'rgba(76, 175, 80, 0.1)' 
            : 'rgba(102, 102, 102, 0.1)';
        
        const strokeWidth = isCurrentRegion ? 3 : 2;
        
        return (
          <g key={region.id}>
            {/* Region polygon */}
            <polygon
              points={points}
              fill={fillColor}
              stroke={borderColor}
              strokeWidth={strokeWidth}
              style={{
                cursor: 'pointer',
                pointerEvents: 'all',
              }}
              onClick={() => onRegionClick?.(region)}
              onMouseEnter={() => onRegionHover?.(region)}
              onMouseLeave={() => onRegionHover?.(null)}
            />
            
            {/* Region label */}
            <text
              x={region.getCenterPosition().x}
              y={region.getCenterPosition().y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                fill: isCurrentRegion ? '#00e5ff' : isExplored ? '#4caf50' : '#999',
                pointerEvents: 'none',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              <tspan x={region.getCenterPosition().x} dy="-8">
                {region.type.toUpperCase()}
              </tspan>
              <tspan x={region.getCenterPosition().x} dy="12">
                {region.name}
              </tspan>
              {isCurrentRegion && (
                <tspan x={region.getCenterPosition().x} dy="12" fill="#00e5ff">
                  CURRENT
                </tspan>
              )}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
