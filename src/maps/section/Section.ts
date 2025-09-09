import { Terrain } from "../terrain";
import { MapObject } from "../MapObject";

export class Section extends MapObject {
  outdoors: boolean;
  terrain: Terrain[];

  constructor(
    x: number,
    y: number,
    mapWidth: number,
    mapHeight: number,
    image: string,
    rotation: 0 | 90 | 180 | 270 = 0,
    outdoors: boolean = false,
    terrain: Terrain[] = []
  ) {
    super(x, y, mapWidth, mapHeight, image, rotation);
    this.outdoors = outdoors;
    this.terrain = terrain;
  }

  /**
   * Check if a tile is within this section
   */
  isTileWithinSection(x: number, y: number): boolean {
    return this.isTileWithinBounds(x, y);
  }
}
