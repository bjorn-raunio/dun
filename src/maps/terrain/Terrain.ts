import { MapObject } from '../MapObject';

export class Terrain extends MapObject {
  height: number;
  movementCost: number; // Movement cost multiplier for this terrain type

  constructor(
    x: number,
    y: number,
    mapWidth: number,
    mapHeight: number,
    image: string,
    height: number = 0,
    rotation: 0 | 90 | 180 | 270 = 0,
    movementCost: number = 1, // Default movement cost multiplier
  ) {
    super(x, y, mapWidth, mapHeight, image, rotation);
    this.height = height;
    this.movementCost = movementCost;
  }

  /**
   * Check if a tile is within this terrain
   */
  isTileWithinTerrain(x: number, y: number): boolean {
    return this.isTileWithinBounds(x, y);
  }

  /**
   * Get the terrain height at a specific position
   */
  getHeightAt(x: number, y: number): number {
    if (this.isTileWithinTerrain(x, y)) {
      return this.height;
    }
    return 0;
  }

  /**
   * Get the terrain movement cost at a specific position
   */
  getMovementCostAt(x: number, y: number): number {
    if (this.isTileWithinTerrain(x, y)) {
      return this.movementCost;
    }
    return 1; // Default cost for non-terrain tiles
  }

  /**
   * Check if this terrain blocks line of sight at a specific position
   */
  blocksLineOfSightAt(x: number, y: number): boolean {
    if (this.isTileWithinTerrain(x, y)) {
      return true;
    }
    return false;
  }
}
