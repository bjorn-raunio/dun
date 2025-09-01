import { ResolvedTerrain, MapDefinition } from './types';
import { Terrain } from './terrain';
import { getRotatedDimensions } from '../utils/dimensions';

// Resolve terrain definition to concrete values
export function resolveTerrain(t: Terrain): ResolvedTerrain {
  return {
    key: t.type,
    x: t.x,
    y: t.y,
    mapWidth: t.mapWidth,
    mapHeight: t.mapHeight,
    rotation: t.rotation,
    image: t.image,
    height: t.height,
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
    // Use pre-calculated rotated dimensions
    const w = room.rotatedWidth;
    const h = room.rotatedHeight;
    
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
    h = Math.max(h, t.getHeightAt(tx, ty));
  }
  return h;
}
