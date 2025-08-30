import { Creature } from '../creatures/index';
import { terrainHeightAt } from '../maps/mapRenderer';


import { validatePositionStandable } from '../validation/map';
import { calculateMovementCost, getTerrainCost } from './movementCost';
import {
  isInZoneOfControl,
  pathPassesThroughZoneOfControl,
  getEngagingCreatures,
  isAdjacentToCreature
} from './zoneOfControl';
import { getCreatureDimensions, isPositionInCreatureBounds } from './dimensions';

// Types for pathfinding
export interface PathfindingResult {
  tiles: Array<{ x: number; y: number }>;
  costMap: Map<string, number>;
  pathMap: Map<string, Array<{ x: number; y: number }>>;
}

export interface PathfindingOptions {
  maxBudget?: number;
  considerEngagement?: boolean;
  includeStartPosition?: boolean;
}

// Line of sight options
export interface LineOfSightOptions {
  maxRange?: number;
  ignoreCreatures?: boolean;
  includeCreatures?: boolean;
}

// Direction constants for movement (including diagonal with corner rule)
const DIRECTIONS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],  // Cardinal directions
  [1, 1], [1, -1], [-1, 1], [-1, -1], // Diagonal directions
];

/**
 * Unified pathfinding system that handles both reachable tiles calculation and A* pathfinding
 */
export class PathfindingSystem {
  /**
   * Calculate reachable tiles for a creature using A* pathfinding
   */
  static getReachableTiles(
    creature: Creature,
    allCreatures: Creature[],
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any,
    options: PathfindingOptions = {}
  ): PathfindingResult {
    const maxBudget = options.maxBudget ?? creature.remainingMovement ?? creature.movement;
    const dist = new Map<string, number>();
    const pathMap = new Map<string, Array<{ x: number; y: number }>>();
    const result: Array<{ x: number; y: number }> = [];
    const cmp = (a: { x: number; y: number; cost: number; path: Array<{ x: number; y: number }> }, b: { x: number; y: number; cost: number; path: Array<{ x: number; y: number }> }) => a.cost - b.cost;
    const pq: Array<{ x: number; y: number; cost: number; path: Array<{ x: number; y: number }> }> = [{
      x: creature.x,
      y: creature.y,
      cost: 0,
      path: [{ x: creature.x, y: creature.y }]
    }];
    dist.set(`${creature.x},${creature.y}`, 0);

    const selectedDims = getCreatureDimensions(creature.size);

    while (pq.length) {
      // Pop min-cost
      pq.sort(cmp);
      const current = pq.shift()!;
      if (current.cost > maxBudget) continue;

      // Don't add start position to result unless explicitly requested
      if (!(current.x === creature.x && current.y === creature.y) || options.includeStartPosition) {
        result.push({ x: current.x, y: current.y });
      }

      for (const [dx, dy] of DIRECTIONS) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        // Corner rule for diagonal movement
        if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
          const sideA = this.areaStats(current.x + dx, current.y, selectedDims, mapData, cols, rows, mapDefinition);
          const sideB = this.areaStats(current.x, current.y + dy, selectedDims, mapData, cols, rows, mapDefinition);
          const destStats = this.areaStats(nx, ny, selectedDims, mapData, cols, rows, mapDefinition);
          const currentStats = this.areaStats(current.x, current.y, selectedDims, mapData, cols, rows, mapDefinition);

          // Check if the sides block diagonal movement
          const sideABlocks = sideA.maxH >= 1;
          const sideBBlocks = sideB.maxH >= 1;

          // Allow diagonal movement if:
          // 1. Neither side blocks, OR
          // 2. Creature is standing on terrain equal to or higher than the blocking sides, OR  
          // 3. Creature is moving into terrain (climbing up)
          if ((sideABlocks || sideBBlocks) &&
            currentStats.maxH < Math.max(sideA.maxH, sideB.maxH) &&
            destStats.maxH <= currentStats.maxH) {
            continue; // Block diagonal movement
          }
        }

        // Cost and passability
        const stepCost = this.moveCostInto(nx, ny, selectedDims, mapData, cols, rows, mapDefinition, current.x, current.y);
        if (!isFinite(stepCost)) continue;
        if (!this.areaStandable(nx, ny, selectedDims, true, allCreatures, cols, rows, mapData, mapDefinition)) continue;

        // Create the new path for this tile
        const newPath = [...current.path, { x: nx, y: ny }];

        // Check engagement restrictions if enabled
        if (options.considerEngagement !== false) {
          const engagingCreatures = getEngagingCreatures(creature, allCreatures);
          const wouldBecomeEngaged = allCreatures.some(c =>
            c !== creature &&
            c.isAlive() &&
            creature.isHostileTo(c) &&
            isInZoneOfControl(nx, ny, c)
          );

          if (engagingCreatures.length > 0 || wouldBecomeEngaged) {
            if (engagingCreatures.length > 0) {
              const canMoveToWhenEngaged = engagingCreatures.every(engager =>
                isInZoneOfControl(nx, ny, engager)
              );
              if (!canMoveToWhenEngaged) continue;

              const isAdjacent = isAdjacentToCreature(nx, ny, { x: current.x, y: current.y } as Creature);
              if (!isAdjacent) continue;

              if (creature.hasMovedWhileEngaged) continue;

              if (current.cost > 0) continue;
            } else if (wouldBecomeEngaged) {
              const isAdjacent = isAdjacentToCreature(nx, ny, { x: current.x, y: current.y } as Creature);
              if (!isAdjacent) continue;
            }
          }

          // Check if the complete path to this tile passes through hostile zones of control
          let wouldBecomeEngagedDuringPath = false;
          for (let i = 1; i < newPath.length; i++) {
            const pathStep = newPath[i];
            const wouldBeEngagedAtStep = allCreatures.some(c =>
              c !== creature &&
              c.isAlive() &&
              creature.isHostileTo(c) &&
              isInZoneOfControl(pathStep.x, pathStep.y, c)
            );
            if (wouldBeEngagedAtStep) {
              wouldBecomeEngagedDuringPath = true;
              break;
            }
          }

          if (wouldBecomeEngagedDuringPath) {
            const pathBlockedByHostileZOC = allCreatures.some(c =>
              c !== creature &&
              c.isAlive() &&
              creature.isHostileTo(c) &&
              pathPassesThroughZoneOfControl(current.x, current.y, nx, ny, c)
            );

            if (pathBlockedByHostileZOC) {
              continue;
            }
          }
        }

        const newCost = current.cost + stepCost;
        if (newCost > maxBudget) continue;
        const key = `${nx},${ny}`;
        if (newCost < (dist.get(key) ?? Infinity)) {
          dist.set(key, newCost);
          pathMap.set(key, newPath);
          pq.push({ x: nx, y: ny, cost: newCost, path: newPath });
        }
      }
    }

    return { tiles: result, costMap: dist, pathMap };
  }

  /**
   * Find path to target using A* pathfinding
   */
  static findPathToTarget(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    allCreatures: Creature[],
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any,
    creature?: Creature
  ): Array<{ x: number; y: number }> | null {
    const openSet = new Set<string>();
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const startKey = `${startX},${startY}`;
    openSet.add(startKey);
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(startX, startY, targetX, targetY));

    let iterations = 0;
    const maxIterations = 1000;

    while (openSet.size > 0 && iterations < maxIterations) {
      iterations++;

      // Find the node with lowest fScore
      let currentKey = '';
      let lowestFScore = Infinity;
      for (const key of Array.from(openSet)) {
        const f = fScore.get(key) ?? Infinity;
        if (f < lowestFScore) {
          lowestFScore = f;
          currentKey = key;
        }
      }

      const [currentX, currentY] = currentKey.split(',').map(Number);

      // Check if we reached the target
      if (currentX === targetX && currentY === targetY) {
        return this.reconstructPath(cameFrom, currentKey);
      }

      openSet.delete(currentKey);
      closedSet.add(currentKey);

      for (const [dx, dy] of DIRECTIONS) {
        const neighborX = currentX + dx;
        const neighborY = currentY + dy;
        const neighborKey = `${neighborX},${neighborY}`;

        // Skip if already evaluated or out of bounds
        if (closedSet.has(neighborKey) ||
          neighborX < 0 || neighborY < 0 ||
          neighborX >= cols || neighborY >= rows) {
          continue;
        }

        // Calculate movement cost to this neighbor
        const stepCost = this.calculateStepCost(
          currentX, currentY, neighborX, neighborY,
          allCreatures, mapData, cols, rows, mapDefinition, creature
        );

        if (stepCost === Infinity) {
          continue; // Cannot move to this neighbor
        }

        const tentativeGScore = (gScore.get(currentKey) ?? Infinity) + stepCost;

        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        } else if (tentativeGScore >= (gScore.get(neighborKey) ?? Infinity)) {
          continue; // This path is not better
        }

        // This path is the best so far
        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + this.heuristic(neighborX, neighborY, targetX, targetY));
      }
    }

    // No path found
    return null;
  }

  /**
   * Calculate movement cost for a single step
   */
  static calculateStepCost(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    allCreatures: Creature[],
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any,
    creature?: Creature
  ): number {
    return calculateMovementCost(fromX, fromY, toX, toY, allCreatures, mapData, mapDefinition, creature);
  }

  /**
   * Get terrain movement cost for a tile
   */
  static getTerrainCost(x: number, y: number, mapData: { tiles: string[][] }, mapDefinition?: any, fromX?: number, fromY?: number): number {
    return getTerrainCost(x, y, mapData, mapDefinition, fromX, fromY);
  }

  /**
   * Heuristic function for A* (Manhattan distance)
   */
  static heuristic(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
  }

  /**
   * Reconstruct path from A* search
   */
  static reconstructPath(cameFrom: Map<string, string>, currentKey: string): Array<{ x: number; y: number }> {
    const path: Array<{ x: number; y: number }> = [];
    let current = currentKey;

    while (current) {
      const [x, y] = current.split(',').map(Number);
      path.unshift({ x, y });
      current = cameFrom.get(current) || '';
    }

    return path;
  }



  /**
   * Helper method to get area stats
   */
  private static areaStats(tx: number, ty: number, dims: { w: number; h: number }, mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: any) {
    let maxH = 0;
    let hasEmpty = false;
    if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) return { maxH: Infinity, hasEmpty: true };
    for (let oy = 0; oy < dims.h; oy++) {
      for (let ox = 0; ox < dims.w; ox++) {
        const cx = tx + ox;
        const cy = ty + oy;
        const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
        if (!nonEmpty) hasEmpty = true;
        const th = this.terrainHeightAt(cx, cy, mapData, mapDefinition);
        if (th > maxH) maxH = th;
      }
    }
    return { maxH, hasEmpty };
  }

  /**
   * Helper method to check if area is standable
   */
  private static areaStandable(tx: number, ty: number, dims: { w: number; h: number }, considerCreatures: boolean, allCreatures: Creature[], cols: number, rows: number, mapData?: { tiles: string[][] }, mapDefinition?: any): boolean {
    if (!mapData) return false;
    return validatePositionStandable(tx, ty, dims, allCreatures, mapData, mapDefinition, considerCreatures);
  }

  /**
   * Helper method to calculate movement cost
   */
  private static moveCostInto(tx: number, ty: number, dims: { w: number; h: number }, mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: any, fromX?: number, fromY?: number): number {
    if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) return Infinity;
    let hasStandTile = false;
    let extra = 0;
    let maxHeight = 0;

    for (let oy = 0; oy < dims.h; oy++) {
      for (let ox = 0; ox < dims.w; ox++) {
        const cx = tx + ox;
        const cy = ty + oy;
        const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
        const th = this.terrainHeightAt(cx, cy, mapData, mapDefinition);

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
  private static terrainHeightAt(cx: number, cy: number, mapData: { tiles: string[][] }, mapDefinition?: any): number {
    if (mapDefinition) {
      return terrainHeightAt(cx, cy, mapDefinition);
    }

    if (cx < 0 || cy < 0 || cx >= mapData.tiles[0]?.length || cy >= mapData.tiles.length) return 0;
    const tile = mapData.tiles[cy]?.[cx];
    if (!tile || tile === "empty.jpg") return 0;

    return 0;
  }

  /**
   * Check if a specific creature is visible from a position
   */
  static isCreatureVisible(
    fromX: number,
    fromY: number,
    target: Creature,
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any,
    options: LineOfSightOptions = {},
    fromCreature?: Creature,
    allCreatures?: Creature[]
  ): boolean {
    if (target.isDead()) {
      return false;
    }

    return this.hasLineOfSight(fromX, fromY, target.x, target.y, mapData, cols, rows, mapDefinition, options, fromCreature, target, allCreatures);
  }

  /**
   * Debug function to get the line of sight path between two positions
   * Returns the path and whether it's blocked
   */
  static debugLineOfSight(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any
  ): { path: Array<{ x: number; y: number }>; isBlocked: boolean; blockingTile?: { x: number; y: number; tileType: string } } {
    const path = this.getLinePoints(fromX, fromY, toX, toY);

    for (const point of path) {
      // Skip the starting point
      if (point.x === fromX && point.y === fromY) {
        continue;
      }

      // Check if terrain blocks line of sight
      if (this.isTerrainBlocking(point.x, point.y, mapData, cols, rows, mapDefinition)) {
        const tileType = mapData.tiles[point.y]?.[point.x] || 'unknown';
        return {
          path,
          isBlocked: true,
          blockingTile: { x: point.x, y: point.y, tileType }
        };
      }
    }

    return { path, isBlocked: false };
  }

  static hasLineOfSight(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any,
    options: LineOfSightOptions = {},
    fromCreature?: Creature,
    toCreature?: Creature,
    allCreatures?: Creature[]
  ): boolean {
    const { maxRange, ignoreCreatures = false, includeCreatures = false } = options;
    
    // Check if positions are within map bounds
    if (fromX < 0 || fromY < 0 || fromX >= cols || fromY >= rows ||
        toX < 0 || toY < 0 || toX >= cols || toY >= rows) {
      return false;
    }
    
    // Check if within max range
    if (maxRange !== undefined) {
      const distance = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
      if (distance > maxRange) {
        return false;
      }
    }
    
    // Get elevation and size information if creatures are provided
    const fromElevation = fromCreature ? this.terrainHeightAt(fromX, fromY, mapData, mapDefinition) : undefined;
    const toElevation = toCreature ? this.terrainHeightAt(toX, toY, mapData, mapDefinition) : undefined;
    const fromSize = fromCreature?.size;
    const toSize = toCreature?.size;
    
    // Use Bresenham's line algorithm to check each tile along the path
    const points = this.getLinePoints(fromX, fromY, toX, toY);
    
    for (const point of points) {
      // Skip the starting point
      if (point.x === fromX && point.y === fromY) {
        continue;
      }
      
      // Check if terrain blocks line of sight, considering elevations and sizes
      if (this.isTerrainBlocking(
        point.x, 
        point.y, 
        mapData, 
        cols, 
        rows, 
        mapDefinition,
        fromX,
        fromY,
        toX,
        toY,
        fromElevation,
        toElevation,
        fromSize,
        toSize,
        allCreatures
      )) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get all points along a line using Bresenham's algorithm
   */
  private static getLinePoints(fromX: number, fromY: number, toX: number, toY: number): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    let x = fromX;
    let y = fromY;
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    const sx = fromX < toX ? 1 : -1;
    const sy = fromY < toY ? 1 : -1;
    let err = dx - dy;

    while (true) {
      points.push({ x, y });

      if (x === toX && y === toY) {
        break;
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return points;
  }
  /**
 * Check if terrain at a position blocks line of sight
 * Now considers elevation and creature sizes for realistic blocking
 */
  private static isTerrainBlocking(
    x: number,
    y: number,
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any,
    fromX?: number,
    fromY?: number,
    toX?: number,
    toY?: number,
    fromElevation?: number,
    toElevation?: number,
    fromSize?: number,
    toSize?: number,
    allCreatures?: Creature[]
  ): boolean {
    if (x < 0 || y < 0 || x >= cols || y >= rows) {
      return true; // Out of bounds blocks line of sight
    }

    // Check if tile exists and has blocking terrain
    if (mapData.tiles[y] && mapData.tiles[y][x]) {
      const tileType = mapData.tiles[y][x];

      // Check if map definition specifies this terrain blocks line of sight
      if (mapDefinition && mapDefinition.terrainTypes && mapDefinition.terrainTypes[tileType]) {
        const terrainInfo = mapDefinition.terrainTypes[tileType];
        if (terrainInfo.blocksLineOfSight) {
          return true;
        }
      }

      // Default blocking terrain types (can be overridden by map definition)
      const defaultBlockingTerrain = ['wall', 'mountain', 'forest', 'building'];
      if (defaultBlockingTerrain.includes(tileType)) {
        return true;
      }

      // If we have elevation information, check if terrain is tall enough to block
      if (fromElevation !== undefined && toElevation !== undefined &&
        fromSize !== undefined && toSize !== undefined &&
        fromX !== undefined && fromY !== undefined &&
        toX !== undefined && toY !== undefined) {

        // Get terrain height at this position
        const terrainHeight = this.terrainHeightAt(x, y, mapData, mapDefinition);

        // Calculate the effective heights of the creatures
        const fromEffectiveHeight = fromElevation + fromSize;
        const toEffectiveHeight = toElevation + toSize;

        // Calculate the line of sight height at this point
        // Use linear interpolation to find the height of the line at this position
        const totalDistance = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
        if (totalDistance > 0) {
          const distanceFromStart = Math.max(Math.abs(x - fromX), Math.abs(y - fromY));
          const ratio = distanceFromStart / totalDistance;

          // Interpolate the line of sight height
          const lineOfSightHeight = fromEffectiveHeight + (toEffectiveHeight - fromEffectiveHeight) * ratio;

          // Terrain only blocks if it's taller than the line of sight
          if (terrainHeight > lineOfSightHeight) {
            return true;
          }
        }
      }
    }
    
    // Check if any creatures at this position are blocking line of sight
    if (allCreatures && fromElevation !== undefined && toElevation !== undefined &&
        fromSize !== undefined && toSize !== undefined &&
        fromX !== undefined && fromY !== undefined &&
        toX !== undefined && toY !== undefined) {
      
      for (const creature of allCreatures) {
        if (creature.isDead()) continue; // Dead creatures don't block
        
        // Check if this creature is at the current position
        if (isPositionInCreatureBounds(x, y, creature.x, creature.y, creature.size)) {
          // Get the creature's elevation and calculate its effective height
          const creatureElevation = this.terrainHeightAt(creature.x, creature.y, mapData, mapDefinition);
          const creatureEffectiveHeight = creatureElevation + creature.size;
          
          // Calculate the line of sight height at this point
          const totalDistance = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
          if (totalDistance > 0) {
            const distanceFromStart = Math.max(Math.abs(x - fromX), Math.abs(y - fromY));
            const ratio = distanceFromStart / totalDistance;
            
            // Interpolate the line of sight height
            const lineOfSightHeight = (fromElevation + fromSize) + ((toElevation + toSize) - (fromElevation + fromSize)) * ratio;
            
            // Creature blocks line of sight if it's taller than the line of sight
            if (creatureEffectiveHeight > lineOfSightHeight) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Get all creatures visible from a given position
   */
  static getVisibleCreatures(
    fromX: number,
    fromY: number,
    allCreatures: Creature[],
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any,
    options: LineOfSightOptions = {},
    fromCreature?: Creature
  ): Creature[] {
    const visibleCreatures: Creature[] = [];

    for (const creature of allCreatures) {
      if (creature.isDead()) {
        continue;
      }

      // Check if creature is within line of sight
      if (this.hasLineOfSight(fromX, fromY, creature.x, creature.y, mapData, cols, rows, mapDefinition, options, fromCreature, creature, allCreatures)) {
        visibleCreatures.push(creature);
      }
    }

    return visibleCreatures;
  }

}

// --- Positioning and Distance Functions ---

/**
 * Distance calculation options
 */
export interface DistanceOptions {
  /** Use pathfinding for accurate distance calculation */
  usePathfinding?: boolean;
  /** Map data for pathfinding calculations */
  mapData?: { tiles: string[][] };
  /** Map dimensions for bounds checking */
  cols?: number;
  rows?: number;
  /** Map definition for terrain costs */
  mapDefinition?: any;
  /** All creatures for obstacle checking */
  allCreatures?: Creature[];
  /** Cost map for path-based distance calculation */
  costMap?: Map<string, number>;
  /** Distance metric to use for simple calculations */
  metric?: 'chebyshev' | 'manhattan' | 'euclidean';
}

/**
 * Find a creature by ID
 */
export function findCreatureById(creatures: Creature[], id: string): Creature | null {
  return creatures.find(creature => creature.id === id) || null;
}

/**
 * Check if a position is accessible (not occupied by creatures)
 */
export function isPositionAccessible(
  x: number,
  y: number,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  mapDefinition?: any
): boolean {
  // Check map bounds
  if (x < 0 || y < 0 || x >= mapData.tiles[0].length || y >= mapData.tiles.length) {
    return false;
  }

  // Check if any creature occupies this position
  for (const creature of allCreatures) {
    if (creature.isDead()) continue; // Dead creatures don't block

    if (isPositionInCreatureBounds(x, y, creature.x, creature.y, creature.size)) {
      return false;
    }
  }

  // Check terrain cost (if map definition provided)
  if (mapDefinition) {
    const terrainCost = getTerrainCost(x, y, mapData, mapDefinition);
    if (!isFinite(terrainCost)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a position is accessible with bounds checking
 */
export function isPositionAccessibleWithBounds(
  x: number,
  y: number,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  cols: number,
  rows: number,
  mapDefinition?: any
): boolean {
  // Check map bounds
  if (x < 0 || y < 0 || x >= cols || y >= rows) {
    return false;
  }

  // Check if any creature occupies this position
  for (const creature of allCreatures) {
    if (creature.isDead()) continue; // Dead creatures don't block

    if (isPositionInCreatureBounds(x, y, creature.x, creature.y, creature.size)) {
      return false;
    }
  }

  // Check terrain cost (if map definition provided)
  if (mapDefinition) {
    const terrainCost = getTerrainCost(x, y, mapData, mapDefinition);
    if (!isFinite(terrainCost)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a creature is at a specific position
 */
export function isCreatureAtPosition(
  x: number,
  y: number,
  allCreatures: Creature[]
): boolean {
  for (const creature of allCreatures) {
    if (creature.isDead()) continue; // Dead creatures don't block

    if (isPositionInCreatureBounds(x, y, creature.x, creature.y, creature.size)) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate distance between two positions with optional pathfinding support
 * This is the main distance calculation function - use this instead of individual functions
 */
export function calculateDistanceBetween(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  options: DistanceOptions = {}
): number {
  const { usePathfinding, mapData, cols, rows, mapDefinition, allCreatures, metric = 'chebyshev' } = options;

  // If positions are the same, distance is 0
  if (fromX === toX && fromY === toY) {
    return 0;
  }

  // Use pathfinding if requested and we have the necessary data
  if (usePathfinding && mapData && cols !== undefined && rows !== undefined && allCreatures) {
    return calculatePathDistance(fromX, fromY, toX, toY, allCreatures, mapData, cols, rows, mapDefinition);
  }

  // Fallback to simple distance calculation
  const dx = Math.abs(toX - fromX);
  const dy = Math.abs(toY - fromY);

  switch (metric) {
    case 'chebyshev':
      return Math.max(dx, dy);
    case 'manhattan':
      return dx + dy;
    case 'euclidean':
      return Math.sqrt(dx * dx + dy * dy);
    default:
      return Math.max(dx, dy);
  }
}

/**
 * Calculate distance from a position to a creature
 */
export function calculateDistanceToCreature(
  fromX: number,
  fromY: number,
  target: Creature,
  options: DistanceOptions = {}
): number {
  const { usePathfinding, mapData, cols, rows, mapDefinition, allCreatures, costMap, metric = 'chebyshev' } = options;

  // If we have map data and want pathfinding, use comprehensive pathfinding
  if (usePathfinding && mapData && cols !== undefined && rows !== undefined && allCreatures) {
    return calculatePathDistanceToTarget(fromX, fromY, target, allCreatures, mapData, cols, rows, mapDefinition);
  }

  // If we have a cost map, use cost-based distance
  if (costMap && allCreatures) {
    return calculateCostMapDistance(fromX, fromY, target, costMap, allCreatures, mapData, cols, rows, mapDefinition);
  }

  // Fallback to simple distance calculation
  return calculateDistanceBetween(fromX, fromY, target.x, target.y);
}

/**
 * Calculate path distance between two positions using pathfinding
 */
function calculatePathDistance(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  cols: number,
  rows: number,
  mapDefinition?: any
): number {
  const path = PathfindingSystem.findPathToTarget(fromX, fromY, toX, toY, allCreatures, mapData, cols, rows, mapDefinition);

  if (!path || path.length === 0) {
    return Infinity; // No path found
  }

  return path.length;
}

/**
 * Calculate path distance to a target creature
 */
function calculatePathDistanceToTarget(
  fromX: number,
  fromY: number,
  target: Creature,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  cols: number,
  rows: number,
  mapDefinition?: any
): number {
  // Find the closest accessible position to the target
  const closestPosition = findClosestAccessiblePositionToTarget(fromX, fromY, target, allCreatures, mapData, cols, rows, mapDefinition);

  if (!closestPosition) {
    return Infinity; // No accessible position found
  }

  return calculatePathDistance(fromX, fromY, closestPosition.x, closestPosition.y, allCreatures, mapData, cols, rows, mapDefinition);
}

/**
 * Calculate distance using a cost map
 */
function calculateCostMapDistance(
  fromX: number,
  fromY: number,
  target: Creature,
  costMap: Map<string, number>,
  allCreatures: Creature[],
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): number {
  const key = `${fromX},${fromY}`;
  const cost = costMap.get(key);

  if (cost === undefined) {
    return Infinity; // Position not reachable
  }

  return cost;
}

/**
 * Find the closest accessible position to a target creature
 */
function findClosestAccessiblePositionToTarget(
  fromX: number,
  fromY: number,
  target: Creature,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  cols: number,
  rows: number,
  mapDefinition?: any
): { x: number; y: number } | null {
  // Check positions around the target
  const positions = [];

  const targetDims = getCreatureDimensions(target.size);
  for (let dy = -1; dy <= targetDims.h; dy++) {
    for (let dx = -1; dx <= targetDims.w; dx++) {
      const x = target.x + dx;
      const y = target.y + dy;

      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        if (isPositionAccessibleWithBounds(x, y, allCreatures, mapData, cols, rows, mapDefinition)) {
          positions.push({ x, y });
        }
      }
    }
  }

  if (positions.length === 0) {
    return null;
  }

  // Find the closest position
  let closest = positions[0];
  let minDistance = calculateDistanceBetween(fromX, fromY, closest.x, closest.y);

  for (const pos of positions) {
    const distance = calculateDistanceBetween(fromX, fromY, pos.x, pos.y);
    if (distance < minDistance) {
      minDistance = distance;
      closest = pos;
    }
  }

  return closest;
}

/**
 * Check if a creature can reach and attack a target
 */
export function canReachAndAttack(
  attacker: Creature,
  target: Creature,
  allCreatures: Creature[],
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): boolean {
  // If we don't have map data, fall back to simple distance calculation
  if (!mapData || cols === undefined || rows === undefined) {
    const distance = calculateDistanceBetween(attacker.x, attacker.y, target.x, target.y);
    const attackRange = attacker.getAttackRange();
    return distance <= attackRange;
  }

  const distance = calculateDistanceToCreature(attacker.x, attacker.y, target, {
    usePathfinding: true,
    mapData,
    cols,
    rows,
    mapDefinition,
    allCreatures
  });

  // Check if target is within attack range
  const attackRange = attacker.getAttackRange();
  return distance <= attackRange;
}

/**
 * Check if a creature can attack immediately (target is adjacent)
 */
export function canAttackImmediately(
  attacker: Creature,
  target: Creature
): boolean {
  const distance = calculateDistanceBetween(attacker.x, attacker.y, target.x, target.y);
  const attackRange = attacker.getAttackRange();
  return distance <= attackRange;
}

/**
 * Calculate distance to an attackable position near a target
 */
export function calculateDistanceToAttackablePosition(
  fromX: number,
  fromY: number,
  target: Creature,
  creature: Creature,
  allCreatures: Creature[],
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): number {
  // If we don't have map data, fall back to simple distance calculation
  if (!mapData || cols === undefined || rows === undefined) {
    return calculateDistanceBetween(fromX, fromY, target.x, target.y);
  }

  const closestPosition = findClosestAccessiblePositionToTarget(fromX, fromY, target, allCreatures, mapData, cols, rows, mapDefinition);

  if (!closestPosition) {
    return Infinity;
  }

  return calculatePathDistance(fromX, fromY, closestPosition.x, closestPosition.y, allCreatures, mapData, cols, rows, mapDefinition);
}
