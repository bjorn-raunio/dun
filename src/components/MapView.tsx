import React from 'react';
import { TILE_SIZE, COLORS } from './styles';
import { typeToImage, resolveTerrain } from '../maps';
import { Creature } from '../creatures';

// --- Map View Component ---

interface MapViewProps {
  mapData: {
    name: string;
    description: string;
    tiles: string[][];
  };
  mapDefinition: any;
  creatures: Creature[];
  selectedCreatureId: string | null;
  reachable: {
    tiles: Array<{ x: number; y: number }>;
    costMap: Map<string, number>;
  };
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCreatureClick: (creature: Creature, e: React.MouseEvent) => void;
  onTileClick: (pos: { tileX: number; tileY: number }) => void;
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
  panRef: React.MutableRefObject<HTMLDivElement | null>;
}

export function MapView({
  mapData,
  mapDefinition,
  creatures,
  selectedCreatureId,
  reachable,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onCreatureClick,
  onTileClick,
  viewportRef,
  panRef,
}: MapViewProps) {
  const rows = mapData.tiles.length;
  const cols = mapData.tiles[0].length;
  const gridItems: React.ReactNode[] = [];

  // Track which tiles are already rendered as part of a block
  const rendered: boolean[][] = Array.from({ length: mapData.tiles.length }, () => Array(mapData.tiles[0].length).fill(false));

  // Helper function to find if this is the top-left of a block and its size
  function getBlockAt(x: number, y: number): any {
    for (const room of mapDefinition.rooms) {
      if (room.x === x && room.y === y) return room;
    }
    return null;
  }

  // Generate grid items for rooms/blocks
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (rendered[y][x]) continue;
      const block = getBlockAt(x, y);
      if (block) {
        // Adjust width/height for rotation
        const isRotated = block.rotation === 90 || block.rotation === 270;
        const blockWidth = isRotated ? block.mapHeight : block.mapWidth;
        const blockHeight = isRotated ? block.mapWidth : block.mapHeight;
        
        // Mark all tiles in the block as rendered
        for (let dy = 0; dy < blockHeight; dy++) {
          for (let dx = 0; dx < blockWidth; dx++) {
            if (
              y + dy < rows &&
              x + dx < cols &&
              mapData.tiles[y + dy][x + dx] === typeToImage[block.type]
            ) {
              rendered[y + dy][x + dx] = true;
            }
          }
        }
        
        const wrapperWidth = TILE_SIZE * blockWidth;
        const wrapperHeight = TILE_SIZE * blockHeight;
        // Inner wrapper size before rotation
        const innerWidth = (block.rotation === 90 || block.rotation === 270) ? wrapperHeight : wrapperWidth;
        const innerHeight = (block.rotation === 90 || block.rotation === 270) ? wrapperWidth : wrapperHeight;
        
        gridItems.push(
          <div
            key={`${block.type}-${x}-${y}`}
            style={{
              gridColumn: `${x + 1} / span ${blockWidth}`,
              gridRow: `${y + 1} / span ${blockHeight}`,
              width: wrapperWidth,
              height: wrapperHeight,
              border: "1px solid #444",
              boxSizing: "border-box",
              background: COLORS.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: innerWidth,
                height: innerHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform:
                  block.rotation === 90
                    ? `rotate(90deg)`
                    : block.rotation === 180
                    ? `rotate(180deg)`
                    : block.rotation === 270
                    ? `rotate(270deg)`
                    : undefined,
                transformOrigin: "center",
                position: "absolute",
                top: "50%",
                left: "50%",
                translate: "-50% -50%",
                transition: "transform 0.2s",
              }}
            >
              <img
                src={process.env.PUBLIC_URL + "/" + typeToImage[block.type]}
                alt={block.type}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  display: "block",
                  pointerEvents: "none",
                }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          </div>
        );
      }
    }
  }

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
        {gridItems}
        
        {/* Terrain overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: TILE_SIZE * cols,
            height: TILE_SIZE * rows,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {mapDefinition.terrain.map((t: any, index: number) => {
            const rt = resolveTerrain(t);
            const isRot = rt.rotation === 90 || rt.rotation === 270;
            const blockWidth = isRot ? rt.mapHeight : rt.mapWidth;
            const blockHeight = isRot ? rt.mapWidth : rt.mapHeight;
            const wrapperWidth = TILE_SIZE * blockWidth;
            const wrapperHeight = TILE_SIZE * blockHeight;
            // Inner wrapper size before rotation
            const innerWidth = (rt.rotation === 90 || rt.rotation === 270) ? wrapperHeight : wrapperWidth;
            const innerHeight = (rt.rotation === 90 || rt.rotation === 270) ? wrapperWidth : wrapperHeight;
            
            return (
              <div
                key={`terrain-${index}`}
                style={{
                  position: "absolute",
                  left: rt.x * TILE_SIZE,
                  top: rt.y * TILE_SIZE,
                  width: wrapperWidth,
                  height: wrapperHeight,
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: innerWidth,
                    height: innerHeight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform:
                      rt.rotation === 90
                        ? `rotate(90deg)`
                        : rt.rotation === 180
                        ? `rotate(180deg)`
                        : rt.rotation === 270
                        ? `rotate(270deg)`
                        : undefined,
                    transformOrigin: "center",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    translate: "-50% -50%",
                  }}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/" + (rt.image || "terrain_unknown.png")}
                    alt={rt.key}
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "fill",
                      display: "block",
                      pointerEvents: "none",
                      opacity: 0.9,
                    }}
                    onError={(e) => ((e.currentTarget.style.display = "none"))}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Reachable tiles overlay */}
        {selectedCreatureId ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: TILE_SIZE * cols,
              height: TILE_SIZE * rows,
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            {reachable.tiles.map((t: any) => (
              <div
                key={`reach-${t.x}-${t.y}`}
                style={{
                  position: "absolute",
                  left: t.x * TILE_SIZE,
                  top: t.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  background: COLORS.reachable,
                  boxShadow: `inset 0 0 0 2px ${COLORS.reachableBorder}`,
                  borderRadius: 6,
                  pointerEvents: "none",
                }}
              />
            ))}
          </div>
        ) : null}
        
        {/* Creatures overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: TILE_SIZE * cols,
            height: TILE_SIZE * rows,
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          {creatures.filter(cr => cr.vitality > 0).map((cr) => (
            <div
              key={cr.id}
              title={cr.name}
              onClick={(e) => onCreatureClick(cr, e)}
              style={{
                position: "absolute",
                left: cr.x * TILE_SIZE + (TILE_SIZE * 0.1),
                top: cr.y * TILE_SIZE + (TILE_SIZE * 0.1),
                width: Math.floor(TILE_SIZE * 0.8 * ((cr.size >= 3) ? 2 : 1)),
                height: Math.floor(TILE_SIZE * 0.8 * ((cr.size >= 3) ? 2 : 1)),
                cursor: "pointer",
                pointerEvents: "auto",
                zIndex: 4,
              }}
            >
              {cr.image ? (
                <img
                  src={process.env.PUBLIC_URL + "/" + cr.image}
                  alt={cr.name}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: selectedCreatureId === cr.id ? "2px solid #00e5ff" : "2px solid #fff",
                    boxSizing: "border-box",
                    pointerEvents: "none",
                    opacity: cr.vitality <= 0 ? 0.3 : 1,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: Math.floor(TILE_SIZE * 0.8 * ((cr.size >= 3) ? 2 : 1)),
                    height: Math.floor(TILE_SIZE * 0.8 * ((cr.size >= 3) ? 2 : 1)),
                    borderRadius: "50%",
                    background: cr.vitality <= 0 ? "#666" : (cr.kind === "hero" ? COLORS.hero : COLORS.monster),
                    border: selectedCreatureId === cr.id ? "2px solid #00e5ff" : "2px solid #fff",
                    boxSizing: "border-box",
                    pointerEvents: "none",
                    opacity: cr.vitality <= 0 ? 0.3 : 1,
                  }}
                />
              )}
              {/* Facing direction arrow */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) rotate(${cr.facing * 45}deg) translateY(-${Math.floor(TILE_SIZE * 0.4 * ((cr.size >= 3) ? 2 : 1))}px)`,
                  fontSize: "12px",
                  color: cr.kind === "hero" ? COLORS.hero : COLORS.monster,
                  fontWeight: "bold",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                ▲
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Map info overlay */}
      <div style={{ position: "absolute", top: 0, left: 0, color: COLORS.text, background: "rgba(0,0,0,0.5)", padding: 8, zIndex: 10 }}>
        <h2 style={{ margin: 0 }}>{mapData.name}</h2>
        <p style={{ margin: 0 }}>{mapData.description}</p>
      </div>
    </div>
  );
}
