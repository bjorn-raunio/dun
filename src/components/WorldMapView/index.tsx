import React from 'react';
import { COLORS } from '../styles';
import { RegionOverlay } from './RegionOverlay';
import { ConnectionOverlay } from './ConnectionOverlay';
import { PartyIconOverlay } from './PartyIconOverlay';
import { WorldMapCharacterBar } from './WorldMapCharacterBar';
import { RegionClass, WorldLocation } from '../../worldmap';
import { ICreature } from '../../creatures/index';

interface WorldMapViewProps {
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
  panRef: React.MutableRefObject<HTMLDivElement | null>;
  regions?: any[];
  currentRegionId?: string;
  onRegionClick?: (region: RegionClass) => void;
  onRegionHover?: (region: RegionClass | null) => void;
  onCenterOnParty?: () => void;
  heroes?: ICreature[];
  onHeroSelect?: (hero: ICreature) => void;
  onQuestMapSelect?: (location: WorldLocation) => void;
}

export function WorldMapView({
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel,
  viewportRef,
  panRef,
  regions = [],
  currentRegionId = '',
  onRegionClick,
  onRegionHover,
  onCenterOnParty,
  heroes = [],
  onHeroSelect,
  onQuestMapSelect,
}: WorldMapViewProps) {
  // Center the worldmap on the party when the component mounts or when the current region changes
  React.useEffect(() => {
    if (onCenterOnParty) {
      onCenterOnParty();
    }
  }, [onCenterOnParty]);

  // Manually add wheel event listener to avoid passive listener issues
  React.useEffect(() => {
    const viewportElement = viewportRef.current;
    if (!viewportElement) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Create a minimal React-like event object with just the properties we need
      const reactEvent = {
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
        deltaY: e.deltaY,
        clientX: e.clientX,
        clientY: e.clientY,
        currentTarget: viewportElement,
        target: e.target,
      } as any;

      onWheel(reactEvent);
    };

    viewportElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      viewportElement.removeEventListener('wheel', handleWheel);
    };
  }, [onWheel, viewportRef]);

  return (
    <div
      ref={viewportRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: COLORS.background,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={panRef}
        className="worldmap-pan-container"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          cursor: "grab",
          transformOrigin: "0 0",
        }}
      >
        <img
          src="/worldmap.jpg"
          alt="World Map"
          style={{
            display: "block",
            maxWidth: "none",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
        
        {/* Region and Connection Overlays */}
        {regions && regions.length > 0 && currentRegionId && (
          <>
            <RegionOverlay
              regions={regions}
              currentRegionId={currentRegionId}
              onRegionClick={onRegionClick}
              onRegionHover={onRegionHover}
            />
            {/*<ConnectionOverlay
              regions={regions}
              currentRegionId={currentRegionId}
            />*/}
            <PartyIconOverlay
              regions={regions}
              currentRegionId={currentRegionId}
            />
          </>
        )}
      </div>
      
      {/* Character Bar */}
      <WorldMapCharacterBar 
        heroes={heroes} 
        onSelect={onHeroSelect}
        currentRegion={regions.find(r => r.id === currentRegionId)}
        onQuestMapSelect={onQuestMapSelect}
      />
    </div>
  );
}
