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
  onCreatureClick,
  onTileClick,
  viewportRef,
  panRef,
}: MapViewProps) {
  const rows = mapData.tiles.length;
  const cols = mapData.tiles[0].length;

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
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${rows}, ${TILE_SIZE}px)`,
          gap: 0,
          cursor: "grab",
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
        />
        
        {/* Path highlight overlay */}
        <PathOverlay 
          highlightedPath={highlightedPath}
          cols={cols}
          rows={rows}
        />
        
        {/* Creatures overlay */}
        <CreatureOverlay 
          creatures={creatures}
          selectedCreatureId={selectedCreatureId}
          onCreatureClick={onCreatureClick}
        />
      </div>
    </div>
  );
}
