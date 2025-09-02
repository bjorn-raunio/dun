import { Terrain } from "../terrain";

export class Room {
  type: string; // e.g. "room1", "room2", "corridor"
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
  rotation: 0 | 90 | 180 | 270; // Rotation property
  rotatedWidth: number; // Width after rotation is applied
  rotatedHeight: number; // Height after rotation is applied
  outdoors: boolean;
  terrain: Terrain[];

  constructor(
    type: string,
    x: number,
    y: number,
    mapWidth: number,
    mapHeight: number,
    rotation: 0 | 90 | 180 | 270 = 0,
    outdoors: boolean = false,
    terrain: Terrain[] = []
  ) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.rotation = rotation;
    this.outdoors = outdoors;
    // Automatically apply rotation to width and height
    const isRotated = rotation === 90 || rotation === 270;
    this.rotatedWidth = isRotated ? mapHeight : mapWidth;
    this.rotatedHeight = isRotated ? mapWidth : mapHeight;
    this.terrain = terrain;
  }

  /**
   * Check if a tile is within this room
   */
  isTileWithinRoom(x: number, y: number): boolean {
    return x >= this.x && x < this.x + this.rotatedWidth && 
           y >= this.y && y < this.y + this.rotatedHeight;
  }
}
