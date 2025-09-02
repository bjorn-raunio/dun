// --- Map and Terrain Type Definitions ---
import { Creature } from '../creatures/index';
import { Room } from './room';
import { Terrain } from './terrain';

export class QuestMap {
  public name: string;
  public width: number;
  public height: number;
  public rooms: Room[];
  public creatures: Creature[];
  public startingTiles: Array<{ x: number; y: number; image?: string; }>;

  constructor(
    name: string,
    width: number,
    height: number,
    rooms: Room[] = [],
    creatures: Creature[] = [],
    startingTiles: Array<{ x: number; y: number; image?: string; }> = [],
  ) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.rooms = rooms;
    this.creatures = creatures;
    this.startingTiles = startingTiles;
  }

  /**
   * Get the total area of the map
   */
  getArea(): number {
    return this.width * this.height;
  }

  /**
   * Check if coordinates are within map bounds
   */
  isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Get all creatures at a specific position
   */
  getCreaturesAt(x: number, y: number): Creature[] {
    return this.creatures.filter(creature => {
      const position = creature['positionManager']?.getPosition();
      return position && position.x === x && position.y === y;
    });
  }

  /**
   * Get terrain at a specific position
   */
  getTerrainAt(x: number, y: number): Terrain[] {
    return this.rooms.flatMap(room => room.terrain).filter(t => 
      t.isTileWithinTerrain(x, y)
    );
  }

  /**
   * Get rooms at a specific position
   */
  getRoomsAt(x: number, y: number): Room[] {
    return this.rooms.filter(room => 
      x >= room.x && x < room.x + room.rotatedWidth &&
      y >= room.y && y < room.y + room.rotatedHeight
    );
  }

  /**
   * Check if a position is a starting tile
   */
  isStartingTile(x: number, y: number): boolean {
    return this.startingTiles.some(tile => tile.x === x && tile.y === y);
  }

  /**
   * Add a creature to the map
   */
  addCreature(creature: Creature): void {
    this.creatures.push(creature);
  }

  /**
   * Remove a creature from the map
   */
  removeCreature(creatureId: string): void {
    this.creatures = this.creatures.filter(c => c.id !== creatureId);
  }

  /**
   * Add terrain to the map
   */
  addTerrain(terrain: Terrain): void {
    this.rooms.flatMap(room => room.terrain).push(terrain);
  }

  /**
   * Add a room to the map
   */
  addRoom(room: Room): void {
    this.rooms.push(room);
  }

  /**
   * Create a copy of the map definition
   */
  clone(): QuestMap {
    return new QuestMap(
      this.name,
      this.width,
      this.height,
      [...this.rooms],
      [...this.creatures],
      [...this.startingTiles]
    );
  }
  
  getTerrain(): Terrain[] {
    return this.rooms.flatMap(room => room.terrain);
  }

  /**
   * Get terrain height at a specific tile position
   */
  terrainHeightAt(tx: number, ty: number): number {
    let h = 0;
    for (const t of this.rooms.flatMap(room => room.terrain)) {
      h = Math.max(h, t.getHeightAt(tx, ty));
    }
    return h;
  }

  /**
   * Get terrain movement cost at a specific tile position
   */
  terrainMovementCostAt(tx: number, ty: number): number {
    let cost = 1; // Default movement cost
    for (const t of this.rooms.flatMap(room => room.terrain)) {
      if (t.isTileWithinTerrain(tx, ty)) {
        cost = Math.max(cost, t.getMovementCostAt(tx, ty));
      }
    }
    return cost;
  }

  /**
   * Validate the map definition
   */
  validate(): boolean {
    return (
      this.name.length > 0 &&
      this.width > 0 &&
      this.height > 0 &&
      this.rooms.every(room => 
        room.x >= 0 && room.y >= 0 && 
        room.x + room.mapWidth <= this.width && 
        room.y + room.mapHeight <= this.height
      ) &&
      this.creatures.every(creature => {
        const position = creature['positionManager']?.getPosition();
        return position && this.isWithinBounds(position.x, position.y);
      }) &&
      this.startingTiles.every(tile => 
        this.isWithinBounds(tile.x, tile.y)
      )
    );
  }
}

export type ResolvedTerrain = {
  key: string;
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
  rotation: 0 | 90 | 180 | 270;
  image: string;
  height: number;
};
