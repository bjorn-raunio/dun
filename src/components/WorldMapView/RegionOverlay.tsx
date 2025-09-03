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
    <>
      {regions.map(region => {
        const isCurrentRegion = region.id === currentRegionId;
        const isExplored = region.isExplored;
        
        return (
          <div
            key={region.id}
            style={{
              position: 'absolute',
              left: region.position.x,
              top: region.position.y,
              width: region.size.width,
              height: region.size.height,
              border: isCurrentRegion 
                ? '3px solid #00e5ff' 
                : isExplored 
                  ? '2px solid #4caf50' 
                  : '2px solid #666',
              borderRadius: 8,
              backgroundColor: isCurrentRegion 
                ? 'rgba(0, 229, 255, 0.2)' 
                : isExplored 
                  ? 'rgba(76, 175, 80, 0.1)' 
                  : 'rgba(102, 102, 102, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: isCurrentRegion ? '#00e5ff' : isExplored ? '#4caf50' : '#999',
              textAlign: 'center',
              padding: '4px',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
              zIndex: 10,
            }}
            onClick={() => onRegionClick?.(region)}
            onMouseEnter={() => onRegionHover?.(region)}
            onMouseLeave={() => onRegionHover?.(null)}
            title={`${region.name} (${region.type}) - Difficulty: ${region.difficulty}/10`}
          >
            <div>
              <div style={{ fontSize: '10px', marginBottom: '2px' }}>
                {region.type.toUpperCase()}
              </div>
              <div style={{ fontSize: '11px' }}>
                {region.name}
              </div>
              {isCurrentRegion && (
                <div style={{ 
                  fontSize: '9px', 
                  color: '#00e5ff',
                  marginTop: '2px'
                }}>
                  CURRENT
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
