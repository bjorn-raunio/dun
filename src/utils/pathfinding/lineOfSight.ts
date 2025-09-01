import { Creature, ICreature } from '../../creatures/index';
import { isPositionInCreatureBounds } from '../dimensions';
import { LineOfSightOptions } from './types';
import { terrainHeightAt } from '../../maps/mapRenderer';
import { MapDefinition } from '../../maps/types';
import { GAME_SETTINGS } from '../constants';

/**
 * Line of Sight system for checking visibility between positions
 * 
 * PIXEL-BASED CALCULATIONS:
 * 
 * This system now calculates line of sight based on pixel coordinates rather than
 * discrete tile coordinates. This provides much more accurate line-of-sight
 * calculations, especially for diagonal lines and when creatures are positioned
 * at sub-tile locations.
 * 
 * KEY FEATURES:
 * 
 * 1. **Pixel-Precise Ray Casting**: Uses pixel-level ray casting to determine
 *    exactly which terrain elements block line of sight.
 * 
 * 2. **Sub-Tile Accuracy**: Can handle creatures positioned at fractional tile
 *    coordinates and provides accurate blocking calculations.
 * 
 * 3. **Smooth Diagonal Lines**: Diagonal line-of-sight calculations are now
 *    smooth and accurate, not limited to discrete tile steps.
 * 
 * 4. **Source/Target Exclusion**: Source and target tiles never block line of sight,
 *    ensuring creatures can always see from their own position and to their target.
 * 
 * 5. **Backward Compatibility**: Still supports tile-based coordinates through
 *    automatic conversion.
 * 
 * BENEFITS:
 * - More accurate line-of-sight calculations
 * - Better handling of diagonal lines
 * - Sub-tile precision for creature positioning
 * - Smoother visual line-of-sight indicators
 * 
 * USAGE:
 * ```typescript
 * // Use pixel-based calculations (default)
 * const hasLOS = LineOfSightSystem.hasLineOfSight(fromX, fromY, toX, toY, mapData, cols, rows);
 * 
 * // Force tile-based calculations for backward compatibility
 * const hasLOS = LineOfSightSystem.hasLineOfSight(fromX, fromY, toX, toY, mapData, cols, rows, 
 *   mapDefinition, { usePixelCalculations: false });
 * ```
 */
export class LineOfSightSystem {
  /**
   * Convert tile coordinates to pixel coordinates
   */
  private static tileToPixel(tileX: number, tileY: number): { pixelX: number; pixelY: number } {
    return {
      pixelX: tileX * GAME_SETTINGS.TILE_SIZE + GAME_SETTINGS.TILE_SIZE / 2,
      pixelY: tileY * GAME_SETTINGS.TILE_SIZE + GAME_SETTINGS.TILE_SIZE / 2
    };
  }

  /**
   * Convert pixel coordinates to tile coordinates
   */
  private static pixelToTile(pixelX: number, pixelY: number): { tileX: number; tileY: number } {
    return {
      tileX: Math.floor(pixelX / GAME_SETTINGS.TILE_SIZE),
      tileY: Math.floor(pixelY / GAME_SETTINGS.TILE_SIZE)
    };
  }

  /**
   * Check if a specific creature is visible from a position
   */
  static isCreatureVisible(
    fromX: number,
    fromY: number,
    target: ICreature,
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: MapDefinition,
    options: LineOfSightOptions = {},
    fromCreature?: ICreature,
    allCreatures?: ICreature[]
  ): boolean {
    if (target.isDead()) {
      return false;
    }

    // Return false if target is not on the map (undefined position)
    if (target.x === undefined || target.y === undefined) {
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
    mapDefinition?: MapDefinition,
    options: LineOfSightOptions = {},
    fromCreature?: ICreature,
    toCreature?: ICreature,
    allCreatures?: ICreature[]
  ): boolean {
    const { maxRange, ignoreCreatures = false, includeCreatures = false, usePixelCalculations = true } = options;

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
    const fromElevation = fromCreature && mapDefinition ? terrainHeightAt(fromX, fromY, mapDefinition) : undefined;
    const toElevation = toCreature && mapDefinition ? terrainHeightAt(toX, toY, mapDefinition) : undefined;
    const fromSize = fromCreature?.size;
    const toSize = toCreature?.size;

    if (usePixelCalculations) {
      // Use pixel-based line of sight calculation
      return this.hasPixelLineOfSight(
        fromX, fromY, toX, toY,
        mapData, cols, rows, mapDefinition,
        fromElevation, toElevation, fromSize, toSize,
        allCreatures
      );
    } else {
      // Use legacy tile-based calculation
      const points = this.getLinePoints(fromX, fromY, toX, toY);

      for (const point of points) {
        // Skip both source and target tiles - they should not block line of sight
        if ((point.x === fromX && point.y === fromY) ||
          (point.x === toX && point.y === toY)) {
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
    mapDefinition?: MapDefinition
  ): { path: Array<{ x: number; y: number }>; isBlocked: boolean; blockingTile?: { x: number; y: number; tileType: string } } {
    const path = this.getLinePoints(fromX, fromY, toX, toY);

    for (const point of path) {
      // Skip both source and target tiles - they should not block line of sight
      if ((point.x === fromX && point.y === fromY) ||
        (point.x === toX && point.y === toY)) {
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
    allCreatures: ICreature[],
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: MapDefinition,
    options: LineOfSightOptions = {},
    fromCreature?: ICreature
  ): ICreature[] {
    const visibleCreatures: ICreature[] = [];

    for (const creature of allCreatures) {
      if (creature.isDead()) {
        continue;
      }

      // Skip creatures that are not on the map (undefined position)
      if (creature.x === undefined || creature.y === undefined) {
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
   * Pixel-based line of sight calculation using ray casting
   */
  private static hasPixelLineOfSight(
    fromX: number, fromY: number, toX: number, toY: number,
    mapData: { tiles: string[][] }, cols: number, rows: number,
    mapDefinition?: MapDefinition,
    fromElevation?: number, toElevation?: number, fromSize?: number, toSize?: number,
    allCreatures?: ICreature[]
  ): boolean {
    // Convert tile coordinates to pixel coordinates
    const fromPixel = this.tileToPixel(fromX, fromY);
    const toPixel = this.tileToPixel(toX, toY);

    // Calculate the distance and direction
    const dx = toPixel.pixelX - fromPixel.pixelX;
    const dy = toPixel.pixelY - fromPixel.pixelY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return true;

    // Normalize direction vector
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Step along the ray at pixel intervals
    const stepSize = GAME_SETTINGS.TILE_SIZE / 4; // Check every quarter tile
    const steps = Math.ceil(distance / stepSize);

    for (let i = 1; i < steps; i++) {
      const currentDistance = i * stepSize;
      const currentPixelX = fromPixel.pixelX + dirX * currentDistance;
      const currentPixelY = fromPixel.pixelY + dirY * currentDistance;

      // Convert current pixel position to tile coordinates
      const currentTile = this.pixelToTile(currentPixelX, currentPixelY);

      // Skip both source and target tiles - they should not block line of sight
      if ((currentTile.tileX === fromX && currentTile.tileY === fromY) ||
        (currentTile.tileX === toX && currentTile.tileY === toY)) {
        continue;
      }

      // Check if this position blocks line of sight
      if (this.isPixelPositionBlocking(
        currentPixelX, currentPixelY, currentTile.tileX, currentTile.tileY,
        mapData, cols, rows, mapDefinition,
        fromPixel.pixelX, fromPixel.pixelY, toPixel.pixelX, toPixel.pixelY,
        fromElevation, toElevation, fromSize, toSize,
        allCreatures
      )) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a pixel position blocks line of sight
   * Note: This function is called for intermediate positions only.
   * Source and target tiles are excluded from blocking checks by the calling functions.
   */
  private static isPixelPositionBlocking(
    pixelX: number, pixelY: number, tileX: number, tileY: number,
    mapData: { tiles: string[][] }, cols: number, rows: number,
    mapDefinition?: MapDefinition,
    fromPixelX?: number, fromPixelY?: number, toPixelX?: number, toPixelY?: number,
    fromElevation?: number, toElevation?: number, fromSize?: number, toSize?: number,
    allCreatures?: ICreature[]
  ): boolean {
    // Check if position is within map bounds
    if (tileX < 0 || tileY < 0 || tileX >= cols || tileY >= rows) {
      return true; // Out of bounds blocks line of sight
    }

    // Check terrain blocking at this tile
    if (mapData.tiles[tileY] && mapData.tiles[tileY][tileX]) {
      const tileType = mapData.tiles[tileY][tileX];

      // Check if map definition specifies this terrain blocks line of sight
      if (mapDefinition && mapDefinition.terrainTypes && mapDefinition.terrainTypes[tileType]) {
        const terrainInfo = mapDefinition.terrainTypes[tileType];
        if (terrainInfo.blocksLineOfSight) {
          return true;
        }
      }

      // Check elevation-based blocking if we have elevation information
      if (fromElevation !== undefined && toElevation !== undefined &&
        fromSize !== undefined && toSize !== undefined &&
        fromPixelX !== undefined && fromPixelY !== undefined &&
        toPixelX !== undefined && toPixelY !== undefined) {

        const terrainHeight = mapDefinition ? terrainHeightAt(tileX, tileY, mapDefinition) : 0;
        const fromEffectiveHeight = fromElevation + fromSize;
        const toEffectiveHeight = toElevation + toSize;

        // Terrain only blocks if it's taller than the line of sight
        if (terrainHeight >= fromEffectiveHeight && terrainHeight >= toEffectiveHeight) {
          return true;
        }
      }
    }

    // Check creature blocking at this position
    if (allCreatures && fromElevation !== undefined && toElevation !== undefined &&
      fromSize !== undefined && toSize !== undefined &&
      fromPixelX !== undefined && fromPixelY !== undefined &&
      toPixelX !== undefined && toPixelY !== undefined) {

      for (const creature of allCreatures) {
        if (creature.isDead()) continue;

        // Check if this creature is at the current tile position
        if (creature.x === tileX && creature.y === tileY && !creature.isDead()) {
          const creatureElevation = mapDefinition ? terrainHeightAt(creature.x, creature.y, mapDefinition) : 0;
          const creatureEffectiveHeight = creatureElevation + creature.size;

          const totalDistance = Math.sqrt((toPixelX - fromPixelX) ** 2 + (toPixelY - fromPixelY) ** 2);
          if (totalDistance > 0) {
            // Creature blocks line of sight if it's taller than the line of sight
            if (creatureEffectiveHeight >= (fromElevation + fromSize) && creatureEffectiveHeight >= (toElevation + toSize)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Get all points along a line using comprehensive tile intersection
   * This ensures every tile the line overlaps is considered, not just discrete points
   * 
   * Uses DDA (Digital Differential Analyzer) algorithm for maximum tile coverage
   */
  private static getLinePoints(fromX: number, fromY: number, toX: number, toY: number): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];

    // Handle special cases
    if (fromX === toX && fromY === toY) {
      points.push({ x: fromX, y: fromY });
      return points;
    }

    const dx = toX - fromX;
    const dy = toY - fromY;

    // Determine the number of steps needed
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    if (steps === 0) {
      points.push({ x: fromX, y: fromY });
      return points;
    }

    // Calculate step sizes
    const xIncrement = dx / steps;
    const yIncrement = dy / steps;

    // Start from the beginning
    let x = fromX;
    let y = fromY;

    // Add the starting point
    points.push({ x: Math.round(x), y: Math.round(y) });

    // Step through the line
    for (let i = 1; i <= steps; i++) {
      x += xIncrement;
      y += yIncrement;

      const tileX = Math.round(x);
      const tileY = Math.round(y);

      // Add the tile if it's different from the last one
      const lastPoint = points[points.length - 1];
      if (lastPoint.x !== tileX || lastPoint.y !== tileY) {
        points.push({ x: tileX, y: tileY });
      }
    }

    // Ensure we include the end point if it's not already there
    const endX = Math.round(toX);
    const endY = Math.round(toY);
    const lastPoint = points[points.length - 1];
    if (lastPoint.x !== endX || lastPoint.y !== endY) {
      points.push({ x: endX, y: endY });
    }

    return points;
  }

  /**
   * Check if terrain at a position blocks line of sight
   * Now considers elevation and creature sizes for realistic blocking
   * Note: This function is called for intermediate positions only.
   * Source and target tiles are excluded from blocking checks by the calling functions.
   */
  private static isTerrainBlocking(
    x: number,
    y: number,
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: MapDefinition,
    fromX?: number,
    fromY?: number,
    toX?: number,
    toY?: number,
    fromElevation?: number,
    toElevation?: number,
    fromSize?: number,
    toSize?: number,
    allCreatures?: ICreature[]
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

      // If we have elevation information, check if terrain is tall enough to block
      if (fromElevation !== undefined && toElevation !== undefined &&
        fromSize !== undefined && toSize !== undefined &&
        fromX !== undefined && fromY !== undefined &&
        toX !== undefined && toY !== undefined) {

        // Get terrain height at this position
        const terrainHeight = mapDefinition ? terrainHeightAt(x, y, mapDefinition) : 0;

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

        // Skip creatures that are not on the map (undefined position)
        if (creature.x === undefined || creature.y === undefined) continue;

        // Check if this creature is at the current position
        if (isPositionInCreatureBounds(x, y, creature.x, creature.y, creature.size)) {
          // Get the creature's elevation and calculate its effective height
          const creatureElevation = mapDefinition ? terrainHeightAt(creature.x, creature.y, mapDefinition) : 0;
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
