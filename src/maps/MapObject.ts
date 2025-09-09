/**
 * Base class for map objects that have position, dimensions, rotation, and image properties
 */
export abstract class MapObject {
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
  rotation: 0 | 90 | 180 | 270;
  rotatedWidth: number;
  rotatedHeight: number;
  protected _image: string;

  constructor(
    x: number,
    y: number,
    mapWidth: number,
    mapHeight: number,
    image: string,
    rotation: 0 | 90 | 180 | 270 = 0,
  ) {
    this.x = x;
    this.y = y;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this._image = image;
    this.rotation = rotation;
    // Automatically apply rotation to width and height
    const isRotated = rotation === 90 || rotation === 270;
    this.rotatedWidth = isRotated ? mapHeight : mapWidth;
    this.rotatedHeight = isRotated ? mapWidth : mapHeight;
  }

  get image(): string {
    return this._image;
  }

  /**
   * Check if a tile is within this map object's bounds
   */
  isTileWithinBounds(x: number, y: number): boolean {
    return x >= this.x && x < this.x + this.rotatedWidth && 
           y >= this.y && y < this.y + this.rotatedHeight;
  }

  /**
   * Get the bounds of this map object
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.rotatedWidth,
      height: this.rotatedHeight
    };
  }

  /**
   * Set the position of this map object
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * Set the rotation of this map object
   */
  setRotation(rotation: 0 | 90 | 180 | 270): void {
    this.rotation = rotation;
    const isRotated = rotation === 90 || rotation === 270;
    this.rotatedWidth = isRotated ? this.mapHeight : this.mapWidth;
    this.rotatedHeight = isRotated ? this.mapWidth : this.mapHeight;
  }
}
