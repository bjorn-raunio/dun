import React from 'react';
import { Region as RegionClass } from '../../worldmap/Region';

interface PartyIconOverlayProps {
  regions: RegionClass[];
  currentRegionId: string;
}

export function PartyIconOverlay({ 
  regions, 
  currentRegionId 
}: PartyIconOverlayProps) {
  const currentRegion = regions.find(region => region.id === currentRegionId);
  
  if (!currentRegion) {
    return null;
  }

  const centerPosition = currentRegion.getCenterPosition();
  const iconSize = 32; // Size of the party icon

  return (
    <div
      style={{
        position: 'absolute',
        left: centerPosition.x - (iconSize / 2),
        top: centerPosition.y - (iconSize / 2),
        width: iconSize,
        height: iconSize,
        zIndex: 20, // Higher than regions to ensure it's visible
        pointerEvents: 'none', // Don't interfere with region clicks
      }}
    >
      <img
        src="/icons/party.png"
        alt="Party Location"
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
        }}
      />
    </div>
  );
}
