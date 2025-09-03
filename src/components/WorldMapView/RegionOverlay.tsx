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
        
        // Vertices are now absolute world coordinates
        const points = region.vertices.map(vertex => 
          `${vertex.x},${vertex.y}`
        ).join(' ');
        
        // Determine colors based on region state
        const borderColor = 'transparent'; // No border for all regions
        
        const fillColor = 'transparent'; // Transparent by default
        
        const strokeWidth = 0; // No border width
        
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
              onMouseEnter={(e) => {
                e.currentTarget.style.fill = 'rgba(0, 229, 255, 0.5)';
                onRegionHover?.(region);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.fill = 'transparent';
                onRegionHover?.(null);
              }}
            />
            
          </g>
        );
      })}
    </svg>
  );
}
