import { Creature, ICreature } from '../creatures/index';
import { terrainHeightAt } from '../maps/mapRenderer';
import { validateEngagementMovement } from '../validation/movement';
import { validatePositionStandable } from '../validation/map';
import { getEngagingCreaturesAtPosition } from './zoneOfControl';
import { MapDefinition } from '../maps/types';

/**
 * Check if a tile is within any room in the map definition
 * (Local copy for use in getTerrainCost function)
 */
function isTileWithinAnyRoom(x: number, y: number, mapDefinition?: MapDefinition): boolean {
  if (!mapDefinition) {
    return false;
  }
  
  for (const room of mapDefinition.rooms) {
    if (room.isTileWithinRoom(x, y)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a tile is within any terrain in the map definition
 * (Local copy for use in getTerrainCost function)
 */
function isTileWithinAnyTerrain(x: number, y: number, mapDefinition?: MapDefinition): boolean {
  if (!mapDefinition) {
    return false;
  }
  
  for (const terrain of mapDefinition.terrain) {
    if (terrain.isTileWithinTerrain(x, y)) {
      return true;
    }
  }
  
  return false;
}



// --- Centralized Movement Cost Calculation Service ---
// 
// This service consolidates movement cost calculations for both single-tile and multi-tile creatures.
// The main function calculateMovementCost() handles both cases through the areaDimensions option.
// 
// Usage examples:
// - Single tile: calculateMovementCost(fromX, fromY, toX, toY, creatures, mapData, mapDef)
// - Multi-tile: calculateMovementCost(fromX, fromY, toX, toY, creatures, mapData, mapDef, {
//     areaDimensions: { w: 2, h: 2 },
//     mapDimensions: { cols: 20, rows: 15 }
//   })

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
  /** Area dimensions for multi-tile creatures (default: 1x1 for single tiles) */
  areaDimensions?: { w: number; h: number };
  /** Map dimensions for bounds checking (required when using area dimensions) */
  mapDimensions?: { cols: number; rows: number };
  /** Cost to reach the source position (used for engagement zone calculations) */
  sourcePositionCost?: number;
}

/**
 * Unified movement cost calculation function
 * Handles both single-tile and multi-tile movement costs with flexible options
 */
export function calculateMovementCost(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  allCreatures: ICreature[],
  mapData: { tiles: string[][] },
  mapDefinition?: MapDefinition,
  options: MovementCostOptions = {},
  movingCreature?: ICreature,
): number {
  const {
    checkDiagonalCornerRule = true,
    considerCreatures = true,
    baseCost = 1,
    maxElevationDifference = 1,
    climbingCostPenalty = 1,
    returnInfinityForBlocked = true,
    areaDimensions = { w: 1, h: 1 },
    sourcePositionCost = 0
  } = options;

  const isMultiTile = areaDimensions.w > 1 || areaDimensions.h > 1;

  // Use validatePositionStandable for basic position validation (bounds, creatures, terrain, rooms)
  // Note: We'll use a custom elevation check later since validatePositionStandable uses a fixed limit of 1
  const basicValidation = validatePositionStandable(
    toX, 
    toY, 
    areaDimensions, 
    allCreatures, 
    mapData, 
    mapDefinition, // Now pass mapDefinition since it handles room validation
    considerCreatures,
    movingCreature?.id
  );
  
  if (!basicValidation) {
    return returnInfinityForBlocked ? Infinity : 0;
  }

  // Custom elevation validation with configurable maxElevationDifference
  // (validatePositionStandable uses a fixed limit of 1, but we need configurable limits)
  if (mapDefinition && maxElevationDifference !== undefined) {
    for (let oy = 0; oy < areaDimensions.h; oy++) {
      for (let ox = 0; ox < areaDimensions.w; ox++) {
        const cx = toX + ox;
        const cy = toY + oy;
        const height = terrainHeightAt(cx, cy, mapDefinition);
        
        // Check if elevation exceeds the configurable limit
        if (height > maxElevationDifference) {
          return returnInfinityForBlocked ? Infinity : 0;
        }
      }
    }
  }

  // For single-tile movement, check diagonal corner rule if enabled
  if (!isMultiTile && checkDiagonalCornerRule) {
    const isDiagonal = (fromX !== toX) && (fromY !== toY);

    if (isDiagonal) {
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

      // Check if vertical adjacent tile is passable
      const verticalTerrainCost = getTerrainCost(verticalX, verticalY, mapData, mapDefinition, fromX, fromY, {
        maxElevationDifference,
        climbingCostPenalty,
        returnInfinityForBlocked
      });

      // If either adjacent tile is impassable, diagonal movement is blocked
      if (horizontalTerrainCost === Infinity ||
        verticalTerrainCost === Infinity) {
        return returnInfinityForBlocked ? Infinity : 0;
      }
    }
  }

  let totalCost = 0;
  let maxHeight = 0;

  // Check each tile in the area (1x1 for single tiles)
  for (let oy = 0; oy < areaDimensions.h; oy++) {
    for (let ox = 0; ox < areaDimensions.w; ox++) {
      const cx = toX + ox;
      const cy = toY + oy;

      // Check basic terrain cost (elevation validation already done above)
      const terrainCost = getTerrainCost(cx, cy, mapData, mapDefinition, fromX, fromY, {
        maxElevationDifference: Infinity, // Skip elevation check since we did it above
        climbingCostPenalty: 0, // Don't apply climbing cost here, handle it separately
        returnInfinityForBlocked
      });

      if (terrainCost === Infinity) {
        return returnInfinityForBlocked ? Infinity : 0;
      }

      totalCost += terrainCost;

      // Track elevation for multi-tile creatures (room validation now handled by validatePositionStandable)
      if (isMultiTile && mapDefinition) {
        const th = terrainHeightAt(cx, cy, mapDefinition!);
        if (th > maxHeight) maxHeight = th;
      }
    }
  }

  // Creature blocking and room validation are now handled by validatePositionStandable above

  // Handle elevation differences and climbing costs
  if (mapDefinition && (fromX !== undefined && fromY !== undefined)) {
    let elevationCost = 0;

    if (isMultiTile) {
      // For multi-tile creatures, use the maximum height in the area
      const fromHeight = terrainHeightAt(fromX, fromY, mapDefinition);

      if (maxHeight > fromHeight + maxElevationDifference) {
        return returnInfinityForBlocked ? Infinity : 0;
      }
      if (maxHeight > fromHeight) {
        elevationCost = climbingCostPenalty; // Apply climbing cost once for the entire area
      }
    } else {
      // For single tiles, check the destination tile height
      const toHeight = terrainHeightAt(toX, toY, mapDefinition);
      const fromHeight = terrainHeightAt(fromX, fromY, mapDefinition);

      if (toHeight > fromHeight + maxElevationDifference) {
        return returnInfinityForBlocked ? Infinity : 0;
      }
      if (toHeight > fromHeight) {
        elevationCost = climbingCostPenalty;
      }
    }

    totalCost += elevationCost;
  } else if (isMultiTile && mapDefinition) {
    // Fallback elevation check for multi-tile creatures without starting coordinates
    if (maxHeight > maxElevationDifference) {
      return returnInfinityForBlocked ? Infinity : 0;
    }
    if (maxHeight > 0) {
      totalCost += climbingCostPenalty;
    }
  }
  
  //Moving in enemy zone of control
  if (movingCreature && mapDefinition) {
    const engagingCreatures = getEngagingCreaturesAtPosition(movingCreature, allCreatures, fromX, fromY);
    if (engagingCreatures.length > 0) {
      if (movingCreature.x === fromX && movingCreature.y === fromY) {
        const engagementValidation = validateEngagementMovement(movingCreature, toX, toY, allCreatures);
        if (!engagementValidation.isValid) {
          return returnInfinityForBlocked ? Infinity : 0;
        } else {
          return movingCreature.remainingMovement > 0 ? movingCreature.remainingMovement : Infinity;
        }
      } else {
        return returnInfinityForBlocked ? Infinity : 0;
      }
    }
  }

  //Running in enemy zone of control
  if (movingCreature && mapDefinition && movingCreature.running) {
    const engagingCreatures = getEngagingCreaturesAtPosition(movingCreature, allCreatures, toX, toY);
    if (engagingCreatures.length > 0) {
      return returnInfinityForBlocked ? Infinity : 0;
    }
  }

  // Entering enemy engagement zone - cost is remaining movement at source position or infinite if 0
  if (movingCreature && mapDefinition) {
    const engagingCreaturesAtDestination = getEngagingCreaturesAtPosition(movingCreature, allCreatures, toX, toY);
    const engagingCreaturesAtSource = getEngagingCreaturesAtPosition(movingCreature, allCreatures, fromX, fromY);
    
    // If destination is in enemy engagement zone but source is not, this is entering engagement
    if (engagingCreaturesAtDestination.length > 0 && engagingCreaturesAtSource.length === 0) {
      // Calculate remaining movement at the source position
      const remainingMovementAtSource = movingCreature.remainingMovement - sourcePositionCost;
      return remainingMovementAtSource > 0 ? remainingMovementAtSource : Infinity;
    }
  }

  return baseCost + totalCost;
}

/**
 * Get terrain movement cost for a tile with flexible options
 */
export function getTerrainCost(
  x: number,
  y: number,
  mapData: { tiles: string[][] },
  mapDefinition?: MapDefinition,
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
    // Check if the tile is within a room or terrain - if not, it blocks movement
    if (!isTileWithinAnyRoom(x, y, mapDefinition) && !isTileWithinAnyTerrain(x, y, mapDefinition)) {
      return returnInfinityForBlocked ? Infinity : 0; // Tiles outside rooms and terrain block movement
    }
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
