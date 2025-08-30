/**
 * Dimension utilities for creatures and map objects
 * This file consolidates all dimension-related logic to avoid duplication
 */

// --- Creature Size Constants ---

export const CREATURE_SIZES = {
  TINY: 1,      // 1x1 tile
  SMALL: 2,     // 1x1 tile  
  LARGE: 3,     // 2x2 tiles
  HUGE: 4,      // 2x2 tiles
} as const;

export type CreatureSize = typeof CREATURE_SIZES[keyof typeof CREATURE_SIZES];

// --- Dimension Calculation Functions ---

/**
 * Get creature dimensions based on size
 * @param size Creature size (1-4)
 * @returns Object with width and height in tiles
 */
export function getCreatureDimensions(size: number): { w: number; h: number } {
  return (size >= CREATURE_SIZES.LARGE) ? { w: 2, h: 2 } : { w: 1, h: 1 };
}

/**
 * Check if a creature is large (2x2) or bigger
 * @param size Creature size (1-4)
 * @returns true if creature is large or huge
 */
export function isLargeCreature(size: number): boolean {
  return size >= CREATURE_SIZES.LARGE;
}

/**
 * Get creature dimensions for UI rendering
 * @param size Creature size (1-4)
 * @param tileSize Base tile size in pixels
 * @param scaleFactor Scaling factor for UI (default: 0.8)
 * @returns Object with width and height in pixels
 */
export function getCreatureUIDimensions(size: number, tileSize: number, scaleFactor: number = 0.8): { width: number; height: number } {
  const dims = getCreatureDimensions(size);
  return {
    width: Math.floor(tileSize * scaleFactor * dims.w),
    height: Math.floor(tileSize * scaleFactor * dims.h)
  };
}

/**
 * Get creature offset for UI positioning
 * @param size Creature size (1-4)
 * @param tileSize Base tile size in pixels
 * @param scaleFactor Scaling factor for UI (default: 0.4)
 * @returns Offset value in pixels
 */
export function getCreatureUIOffset(size: number, tileSize: number, scaleFactor: number = 0.4): number {
  const dims = getCreatureDimensions(size);
  return Math.floor(tileSize * scaleFactor * dims.h);
}

// --- Map Object Dimensions ---

/**
 * Get rotated dimensions for map objects
 * @param width Original width
 * @param height Original height
 * @param rotation Rotation in degrees
 * @returns Object with rotated width and height
 */
export function getRotatedDimensions(width: number, height: number, rotation: number): { width: number; height: number } {
  const isRotated = rotation === 90 || rotation === 270;
  return {
    width: isRotated ? height : width,
    height: isRotated ? width : height
  };
}

// --- Position and Bounds Checking ---

/**
 * Check if a position is within creature bounds
 * @param x X coordinate to check
 * @param y Y coordinate to check
 * @param creatureX Creature's X position
 * @param creatureY Creature's Y position
 * @param creatureSize Creature's size
 * @returns true if position is within creature bounds
 */
export function isPositionInCreatureBounds(
  x: number, 
  y: number, 
  creatureX: number, 
  creatureY: number, 
  creatureSize: number
): boolean {
  const dims = getCreatureDimensions(creatureSize);
  return x >= creatureX && 
         x < creatureX + dims.w && 
         y >= creatureY && 
         y < creatureY + dims.h;
}

/**
 * Check if a creature is within map bounds
 * @param creatureX Creature's X position
 * @param creatureY Creature's Y position
 * @param creatureSize Creature's size
 * @param mapWidth Map width in tiles
 * @param mapHeight Map height in tiles
 * @returns true if creature is within map bounds
 */
export function isCreatureInMapBounds(
  creatureX: number,
  creatureY: number,
  creatureSize: number,
  mapWidth: number,
  mapHeight: number
): boolean {
  const dims = getCreatureDimensions(creatureSize);
  
  if (creatureX < 0 || creatureY < 0) return false;
  if (creatureX + dims.w > mapWidth) return false;
  if (creatureY + dims.h > mapHeight) return false;
  
  return true;
}

/**
 * Get creature area for collision detection
 * @param creatureX Creature's X position
 * @param creatureY Creature's Y position
 * @param creatureSize Creature's size
 * @returns Object with area bounds
 */
export function getCreatureArea(
  creatureX: number,
  creatureY: number,
  creatureSize: number
): { x: number; y: number; width: number; height: number } {
  const dims = getCreatureDimensions(creatureSize);
  return {
    x: creatureX,
    y: creatureY,
    width: dims.w,
    height: dims.h
  };
}

// --- Legacy Support ---

/**
 * @deprecated Use getCreatureDimensions instead
 * @param size Creature size
 * @returns Creature dimensions
 */
export function getCreatureDims(size: number): { w: number; h: number } {
  return getCreatureDimensions(size);
}
