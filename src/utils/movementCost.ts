import { Creature } from '../creatures/index';
import { terrainHeightAt } from '../maps/mapRenderer';
import { isCreatureAtPosition } from './pathfinding';

// --- Centralized Movement Cost Calculation Service ---

/**
 * Movement cost calculation options
 */
export interface MovementCostOptions {
  /** Whether to check diagonal movement corner rule */
  checkDiagonalCornerRule?: boolean;
  /** Whether to consider creature blocking */
  considerCreatures?: boolean;
  /** Base movement cost (default: 1) */
  baseCost?: number;
  /** Maximum elevation difference allowed (default: 1) */
  maxElevationDifference?: number;
  /** Cost penalty for climbing (default: 1) */
  climbingCostPenalty?: number;
  /** Whether to return Infinity for blocked movement or throw error */
  returnInfinityForBlocked?: boolean;
}

/**
 * Consolidated movement cost calculation function
 * Handles both single-tile and multi-tile movement costs with flexible options
 */
export function calculateMovementCost(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  mapDefinition?: any,
  options: MovementCostOptions = {}
): number {
  const {
    checkDiagonalCornerRule = true,
    considerCreatures = true,
    baseCost = 1,
    maxElevationDifference = 1,
    climbingCostPenalty = 1,
    returnInfinityForBlocked = true
  } = options;

  // Check if this is a diagonal movement
  const isDiagonal = (fromX !== toX) && (fromY !== toY);
  
  // For diagonal movement, check corner rule if enabled
  if (isDiagonal && checkDiagonalCornerRule) {
    const horizontalX = toX;
    const horizontalY = fromY;
    const verticalX = fromX;
    const verticalY = toY;
    
    // Check if horizontal adjacent tile is passable
    const horizontalTerrainCost = getTerrainCost(horizontalX, horizontalY, mapData, mapDefinition, fromX, fromY, {
      maxElevationDifference,
      climbingCostPenalty,
      returnInfinityForBlocked
    });
    const isHorizontalBlocked = considerCreatures && isCreatureAtPosition(horizontalX, horizontalY, allCreatures);
    
    // Check if vertical adjacent tile is passable
    const verticalTerrainCost = getTerrainCost(verticalX, verticalY, mapData, mapDefinition, fromX, fromY, {
      maxElevationDifference,
      climbingCostPenalty,
      returnInfinityForBlocked
    });
    const isVerticalBlocked = considerCreatures && isCreatureAtPosition(verticalX, verticalY, allCreatures);
    
    // If either adjacent tile is impassable, diagonal movement is blocked
    if (horizontalTerrainCost === Infinity || isHorizontalBlocked || 
        verticalTerrainCost === Infinity || isVerticalBlocked) {
      return returnInfinityForBlocked ? Infinity : 0;
    }
  }
  
  // Check terrain cost at destination
  const terrainCost = getTerrainCost(toX, toY, mapData, mapDefinition, fromX, fromY, {
    maxElevationDifference,
    climbingCostPenalty,
    returnInfinityForBlocked
  });
  
  if (terrainCost === Infinity) {
    return returnInfinityForBlocked ? Infinity : 0;
  }
  
  // Check if movement is blocked by creatures
  if (considerCreatures) {
    const isBlocked = isCreatureAtPosition(toX, toY, allCreatures);
    if (isBlocked) {
      return returnInfinityForBlocked ? Infinity : 0;
    }
  }
  
  return baseCost + terrainCost;
}

/**
 * Get terrain movement cost for a tile with flexible options
 */
export function getTerrainCost(
  x: number, 
  y: number, 
  mapData: { tiles: string[][] }, 
  mapDefinition?: any, 
  fromX?: number, 
  fromY?: number,
  options: { maxElevationDifference?: number; climbingCostPenalty?: number; returnInfinityForBlocked?: boolean } = {}
): number {
  const {
    maxElevationDifference = 1,
    climbingCostPenalty = 1,
    returnInfinityForBlocked = true
  } = options;

  if (x < 0 || y < 0 || x >= mapData.tiles[0]?.length || y >= mapData.tiles.length) {
    return returnInfinityForBlocked ? Infinity : 0;
  }
  
  const tile = mapData.tiles[y]?.[x];
  if (!tile || tile === "empty.jpg") {
    return 0; // Empty space has no additional cost
  }
  
  // Check terrain height and other properties
  if (mapDefinition) {
    const height = terrainHeightAt(x, y, mapDefinition);
    
    if (fromX !== undefined && fromY !== undefined) {
      // We have starting coordinates, so we can calculate elevation differences
      const fromHeight = terrainHeightAt(fromX, fromY, mapDefinition);
      
      // Allow movement to terrain that is within max elevation difference, but with extra cost
      if (height > fromHeight + maxElevationDifference) {
        return returnInfinityForBlocked ? Infinity : 0;
      }
      if (height > fromHeight) {
        return climbingCostPenalty; // Climbing costs extra movement
      }
    } else {
      // No starting coordinates - this is a general accessibility check
      // Allow terrain up to max elevation difference to be accessible
      if (height > maxElevationDifference) {
        return returnInfinityForBlocked ? Infinity : 0;
      }
      if (height > 0) {
        return climbingCostPenalty; // Elevated terrain costs extra movement
      }
    }
  }
  
  // Default terrain cost
  return 0;
}

/**
 * Calculate movement cost for multi-tile areas (for creatures larger than 1x1)
 */
export function calculateAreaMovementCost(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  dimensions: { w: number; h: number },
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  cols: number,
  rows: number,
  mapDefinition?: any,
  options: MovementCostOptions = {}
): number {
  const {
    baseCost = 1,
    maxElevationDifference = 1,
    climbingCostPenalty = 1,
    returnInfinityForBlocked = true
  } = options;

  // Check bounds
  if (toX < 0 || toY < 0 || toX + dimensions.w > cols || toY + dimensions.h > rows) {
    return returnInfinityForBlocked ? Infinity : 0;
  }
  
  let hasStandTile = false;
  let maxHeight = 0;
  let totalCost = 0;

  // Check each tile in the area
  for (let oy = 0; oy < dimensions.h; oy++) {
    for (let ox = 0; ox < dimensions.w; ox++) {
      const cx = toX + ox;
      const cy = toY + oy;
      const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
      const th = terrainHeightAt(cx, cy, mapDefinition);

      if (nonEmpty) hasStandTile = true;
      if (th > maxHeight) maxHeight = th;
      
      // Add individual tile cost (without elevation penalties since we handle that separately)
      const tileCost = getTerrainCost(cx, cy, mapData, mapDefinition, undefined, undefined, {
        maxElevationDifference,
        climbingCostPenalty: 0, // Don't apply climbing cost here
        returnInfinityForBlocked
      });
      
      if (tileCost === Infinity) {
        return returnInfinityForBlocked ? Infinity : 0;
      }
      
      totalCost += tileCost;
    }
  }

  if (!hasStandTile) {
    return returnInfinityForBlocked ? Infinity : 0;
  }

  // Check elevation difference if we have starting coordinates
  if (fromX !== undefined && fromY !== undefined && mapDefinition) {
    const fromHeight = terrainHeightAt(fromX, fromY, mapDefinition);

    // Allow movement to terrain that is within max elevation difference, but with extra cost
    if (maxHeight > fromHeight + maxElevationDifference) {
      return returnInfinityForBlocked ? Infinity : 0;
    }
    if (maxHeight > fromHeight) {
      totalCost += climbingCostPenalty; // Apply climbing cost once for the entire area
    }
  } else {
    // Fallback to general accessibility check
    if (maxHeight > maxElevationDifference) {
      return returnInfinityForBlocked ? Infinity : 0;
    }
    if (maxHeight > 0) {
      totalCost += climbingCostPenalty; // Apply climbing cost once for the entire area
    }
  }
  return baseCost + totalCost;
}

/**
 * Calculate the cost difference between two positions (for step-by-step movement)
 */
export function calculateCostDifference(currentCost: number, destCost: number): number {
  return Math.max(0, destCost - currentCost);
}

/**
 * Check if a creature can afford the movement cost
 */
export function canAffordMovement(creature: Creature, cost: number): boolean {
  return creature.remainingMovement >= cost;
}
