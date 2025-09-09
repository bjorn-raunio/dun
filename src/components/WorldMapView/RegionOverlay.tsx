import React from 'react';
import { IRegion as RegionType } from '../../worldmap/types';
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
      {/* SVG filter definitions */}
      <defs>
        <filter id="regionBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
        </filter>
      </defs>
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
              className="region-polygon"
              filter="url(#regionBlur)"
              style={{
                cursor: 'pointer',
                pointerEvents: 'all',
              }}
              onClick={() => onRegionClick?.(region)}
              onMouseEnter={() => onRegionHover?.(region)}
              onMouseLeave={() => onRegionHover?.(null)}
            />
            
          </g>
        );
      })}
    </svg>
  );
}
