import { terrainHeightAt } from '../../maps/mapRenderer';
import { getCreatureDimensions, isPositionInCreatureBounds } from '../dimensions';
import { validatePositionStandable } from '../../validation/map';
import { calculateMovementCost, getTerrainCost } from '../movementCost';
import { AreaStats } from './types';

/**
 * Helper method to get area stats
 */
export function getAreaStats(
  tx: number, 
  ty: number, 
  dims: { w: number; h: number }, 
  mapData: { tiles: string[][] }, 
  cols: number, 
  rows: number, 
  mapDefinition?: any
): AreaStats {
  let maxH = 0;
  let hasEmpty = false;
  
  if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) {
    return { maxH: Infinity, hasEmpty: true };
  }
  
  for (let oy = 0; oy < dims.h; oy++) {
    for (let ox = 0; ox < dims.w; ox++) {
      const cx = tx + ox;
      const cy = ty + oy;
      const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
      if (!nonEmpty) hasEmpty = true;
      const th = getTerrainHeightAt(cx, cy, mapData, mapDefinition);
      if (th > maxH) maxH = th;
    }
  }
  
  return { maxH, hasEmpty };
}

/**
 * Helper method to check if area is standable
 */
export function isAreaStandable(
  tx: number, 
  ty: number, 
  dims: { w: number; h: number }, 
  considerCreatures: boolean, 
  allCreatures: any[], 
  cols: number, 
  rows: number, 
  mapData?: { tiles: string[][] }, 
  mapDefinition?: any
): boolean {
  if (!mapData) return false;
  return validatePositionStandable(tx, ty, dims, allCreatures, mapData, mapDefinition, considerCreatures);
}

/**
 * Helper method to calculate movement cost
 */
export function calculateMoveCostInto(
  tx: number, 
  ty: number, 
  dims: { w: number; h: number }, 
  mapData: { tiles: string[][] }, 
  cols: number, 
  rows: number, 
  mapDefinition?: any, 
  fromX?: number, 
  fromY?: number
): number {
  if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) return Infinity;
  
  let hasStandTile = false;
  let extra = 0;
  let maxHeight = 0;

  for (let oy = 0; oy < dims.h; oy++) {
    for (let ox = 0; ox < dims.w; ox++) {
      const cx = tx + ox;
      const cy = ty + oy;
      const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
      const th = getTerrainHeightAt(cx, cy, mapData, mapDefinition);

      if (nonEmpty) hasStandTile = true;
      if (th > maxHeight) maxHeight = th;
    }
  }

  if (!hasStandTile) return Infinity;

  // Check elevation difference if we have starting coordinates
  if (fromX !== undefined && fromY !== undefined && mapDefinition) {
    const fromHeight = terrainHeightAt(fromX, fromY, mapDefinition);

    // Allow movement to terrain that is 1 elevation higher than current, but with extra cost
    if (maxHeight > fromHeight + 1) {
      return Infinity; // Terrain is too high to climb
    }
    if (maxHeight === fromHeight + 1) {
      extra = 1; // Climbing up 1 elevation costs 1 extra movement
    }
  } else {
    // Fallback to old logic if no starting coordinates
    if (maxHeight > 1) return Infinity; // Terrain with height > 1 blocks movement
    if (maxHeight === 1) extra = 1; // If any tile is height 1, costs +1
  }
  
  return 1 + extra;
}

/**
 * Helper method to get terrain height
 */
export function getTerrainHeightAt(
  cx: number, 
  cy: number, 
  mapData: { tiles: string[][] }, 
  mapDefinition?: any
): number {
  if (mapDefinition) {
    return terrainHeightAt(cx, cy, mapDefinition);
  }

  if (cx < 0 || cy < 0 || cx >= mapData.tiles[0]?.length || cy >= mapData.tiles.length) return 0;
  const tile = mapData.tiles[cy]?.[cx];
  if (!tile || tile === "empty.jpg") return 0;

  return 0;
}

/**
 * Heuristic function for A* (Manhattan distance)
 */
export function calculateHeuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

/**
 * Reconstruct path from A* search
 */
export function reconstructPath(cameFrom: Map<string, string>, currentKey: string): Array<{ x: number; y: number }> {
  const path: Array<{ x: number; y: number }> = [];
  let current = currentKey;

  while (current) {
    const [x, y] = current.split(',').map(Number);
    path.unshift({ x, y });
    current = cameFrom.get(current) || '';
  }

  return path;
}
