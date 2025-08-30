import { Creature } from '../../creatures/index';
import { isPositionInCreatureBounds } from '../dimensions';
import { LineOfSightOptions } from './types';
import { getTerrainHeightAt } from './helpers';
import { DEFAULT_BLOCKING_TERRAIN } from './constants';

/**
 * Line of Sight system for checking visibility between positions
 */
export class LineOfSightSystem {
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
   * Check if there's a clear line of sight between two positions
   */
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
    const fromElevation = fromCreature ? getTerrainHeightAt(fromX, fromY, mapData, mapDefinition) : undefined;
    const toElevation = toCreature ? getTerrainHeightAt(toX, toY, mapData, mapDefinition) : undefined;
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
      if (DEFAULT_BLOCKING_TERRAIN.includes(tileType)) {
        return true;
      }

      // If we have elevation information, check if terrain is tall enough to block
      if (fromElevation !== undefined && toElevation !== undefined &&
        fromSize !== undefined && toSize !== undefined &&
        fromX !== undefined && fromY !== undefined &&
        toX !== undefined && toY !== undefined) {

        // Get terrain height at this position
        const terrainHeight = getTerrainHeightAt(x, y, mapData, mapDefinition);

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
          const creatureElevation = getTerrainHeightAt(creature.x, creature.y, mapData, mapDefinition);
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
}
