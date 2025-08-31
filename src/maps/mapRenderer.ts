import { Terrain, ResolvedTerrain, MapDefinition } from './types';
import { terrainPresets } from './mapDefinitions';
import { getRotatedDimensions } from '../utils/dimensions';

// Resolve terrain definition to concrete values
export function resolveTerrain(t: Terrain): ResolvedTerrain {
  const preset = t.preset ? terrainPresets[t.preset] : null;
  const key = t.preset || t.type || "unknown";
  
  return {
    key,
    x: t.x ?? preset?.x ?? 0,
    y: t.y ?? preset?.y ?? 0,
    mapWidth: t.mapWidth ?? preset?.mapWidth ?? 1,
    mapHeight: t.mapHeight ?? preset?.mapHeight ?? 1,
    rotation: t.rotation ?? preset?.rotation ?? 0,
    image: t.image ?? preset?.image ?? "terrain_unknown.png",
    height: t.height ?? preset?.height ?? 0,
  };
}

// Generate map tiles from map definition
export function generateMapTiles(mapDefinition: MapDefinition) {
  const tiles: string[][] = [];
  
  // Initialize empty tiles
  for (let y = 0; y < mapDefinition.height; y++) {
    tiles[y] = [];
    for (let x = 0; x < mapDefinition.width; x++) {
      tiles[y][x] = "empty.jpg";
    }
  }
  
  // Fill in room tiles
  for (const room of mapDefinition.rooms) {
    const isRot = room.rotation === 90 || room.rotation === 270;
      const { width: w, height: h } = getRotatedDimensions(room.mapWidth, room.mapHeight, room.rotation);
    
    for (let y = room.y; y < room.y + h; y++) {
      for (let x = room.x; x < room.x + w; x++) {
        if (y >= 0 && y < mapDefinition.height && x >= 0 && x < mapDefinition.width) {
          tiles[y][x] = `${room.type}.jpg`;
        }
      }
    }
  }
  
  return { tiles };
}

// Helper: terrain height at tile
export function terrainHeightAt(tx: number, ty: number, mapDefinition: MapDefinition): number {
  let h = 0;
  for (const t of mapDefinition.terrain) {
    const rt = resolveTerrain(t);
    const { width: w, height: hgt } = getRotatedDimensions(rt.mapWidth, rt.mapHeight, rt.rotation);
    if (tx >= rt.x && tx < rt.x + w && ty >= rt.y && ty < rt.y + hgt) {
      h = Math.max(h, rt.height ?? 1);
    }
  }
  return h;
}
