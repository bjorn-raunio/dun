import { Creature } from '../../creatures/index';
import { terrainHeightAt } from '../../maps/mapRenderer';
import { validatePositionStandable } from '../../validation/map';
import { calculateMovementCost } from '../movementCost';
import { DEFAULT_MOVEMENT_OPTIONS } from './constants';
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
      const th = terrainHeightAt(cx, cy, mapDefinition);
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
 * Now uses the consolidated movement cost calculation system
 */
export function calculateMoveCostInto(
  tx: number, 
  ty: number, 
  dims: { w: number; h: number }, 
  mapData: { tiles: string[][] }, 
  cols: number, 
  rows: number, 
  allCreatures: Creature[],
  mapDefinition?: any, 
  fromX?: number, 
  fromY?: number,
  creature?: Creature
): number {
  // Use the consolidated movement cost calculation
  return calculateMovementCost(
    fromX || 0, 
    fromY || 0, 
    tx, 
    ty, 
    allCreatures,
    mapData, 
    mapDefinition,
    {
      ...DEFAULT_MOVEMENT_OPTIONS,
      considerCreatures: false, // Don't check creatures in this context
      areaDimensions: dims,
      mapDimensions: { cols, rows }
    },
    creature
  );
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
