export class Terrain {
  type: string; // e.g. "tree", "wagon", "horse"
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
  rotation: 0 | 90 | 180 | 270; // Rotation property
  rotatedWidth: number; // Width after rotation is applied
  rotatedHeight: number; // Height after rotation is applied
  image: string;
  height: number;

  constructor(
    type: string,
    x: number,
    y: number,
    mapWidth: number,
    mapHeight: number,
    image: string,
    height: number = 0,
    rotation: 0 | 90 | 180 | 270 = 0,
  ) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.image = image;
    this.height = height;
    this.rotation = rotation;
    // Automatically apply rotation to width and height
    const isRotated = rotation === 90 || rotation === 270;
    this.rotatedWidth = isRotated ? mapHeight : mapWidth;
    this.rotatedHeight = isRotated ? mapWidth : mapHeight;
  }

  /**
   * Check if a tile is within this terrain
   */
  isTileWithinTerrain(x: number, y: number): boolean {
    return x >= this.x && x < this.x + this.rotatedWidth && 
           y >= this.y && y < this.y + this.rotatedHeight;
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
   * Check if this terrain blocks line of sight at a specific position
   */
  blocksLineOfSightAt(x: number, y: number): boolean {
    if (this.isTileWithinTerrain(x, y)) {
      return true;
    }
    return false;
  }
}
