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
  // Get the current region to determine which regions are adjacent
  const currentRegion = regions.find(r => r.id === currentRegionId);
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
        const isAdjacent = currentRegion ? currentRegion.isConnectedTo(region.id) : false;
        
        // Vertices are now absolute world coordinates
        const points = region.vertices.map(vertex => 
          `${vertex.x},${vertex.y}`
        ).join(' ');
        
        // Determine colors based on region state
        let borderColor = 'transparent';
        let fillColor = 'transparent';
        let strokeWidth = 0;
        let cursor = 'default';
        
        if (isCurrentRegion) {
          // Current region - highlight in blue
          borderColor = '#4A90E2';
          fillColor = 'rgba(74, 144, 226, 0.1)';
          strokeWidth = 2;
          cursor = 'default';
        } else if (isAdjacent && region.isAccessible) {
          // Adjacent accessible region - highlight in green
          borderColor = '#7ED321';
          fillColor = 'rgba(126, 211, 33, 0.1)';
          strokeWidth = 2;
          cursor = 'pointer';
        } else if (isAdjacent && !region.isAccessible) {
          // Adjacent but inaccessible region - highlight in red
          borderColor = '#D0021B';
          fillColor = 'rgba(208, 2, 27, 0.1)';
          strokeWidth = 2;
          cursor = 'not-allowed';
        }
        
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
                cursor: cursor,
                pointerEvents: 'all',
              }}
              onClick={() => {
                // Only allow clicking on adjacent regions
                if (isAdjacent && region.isAccessible) {
                  onRegionClick?.(region);
                }
              }}
              onMouseEnter={() => onRegionHover?.(region)}
              onMouseLeave={() => onRegionHover?.(null)}
            />
            
          </g>
        );
      })}
    </svg>
  );
}
