import React from 'react';
import { TILE_SIZE, COLORS } from '../styles';
import { MapViewProps } from './types';
import { MapRenderer } from './MapRenderer';
import { TerrainOverlay } from './TerrainOverlay';
import { ReachableOverlay } from './ReachableOverlay';
import { PathOverlay } from './PathOverlay';
import { CreatureOverlay } from './CreatureOverlay';

export function MapView({
  mapData,
  mapDefinition,
  creatures,
  selectedCreatureId,
  reachable,
  highlightedPath,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel,
  onCreatureClick,
  onTileClick,
  viewportRef,
  panRef,
  targetingMode,
}: MapViewProps) {
  const rows = mapData.tiles.length;
  const cols = mapData.tiles[0].length;

  // Determine cursor style based on targeting mode
  const cursorStyle = targetingMode?.isActive ? 'crosshair' : 'grab';

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
      onWheel={onWheel}
    >
      <div
        ref={panRef}
        className="map-pan-container"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${rows}, ${TILE_SIZE}px)`,
          gap: 0,
          cursor: cursorStyle,
          transformOrigin: "0 0",
        }}
      >
        {/* Base map rendering */}
        <MapRenderer mapData={mapData} mapDefinition={mapDefinition} />
        
        {/* Terrain overlay */}
        <TerrainOverlay mapDefinition={mapDefinition} />
        
        {/* Reachable tiles overlay */}
        <ReachableOverlay 
          reachable={reachable} 
          selectedCreatureId={selectedCreatureId}
          cols={cols}
          rows={rows}
          targetingMode={targetingMode}
        />
        
        {/* Path highlight overlay */}
        <PathOverlay 
          highlightedPath={highlightedPath}
          cols={cols}
          rows={rows}
          targetingMode={targetingMode}
        />
        
        {/* Creatures overlay */}
        <CreatureOverlay 
          creatures={creatures}
          selectedCreatureId={selectedCreatureId}
          onCreatureClick={onCreatureClick}
          targetingMode={targetingMode}
          mapDefinition={mapDefinition}
          mapData={mapData}
        />
      </div>
    </div>
  );
}
