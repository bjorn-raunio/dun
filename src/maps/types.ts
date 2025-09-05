// --- Map and Terrain Type Definitions ---
import { Creature, ICreature } from '../creatures/index';
import { createRangedWeapon, Item } from '../items';
import { rollD6 } from '../utils';
import { Section } from './section';
import { Terrain } from './terrain';

export enum Light {
  totalDarkness,
  darkness,
  lit
}

export class Tile {
  public image: string;
  private _light: Light;
  public items: Item[] = [];

  constructor(image: string = "empty.jpg") {
    this.image = image;
    this._light = Light.lit;
  }

  get light(): Light {
    return this._light;
  }

  /**
   * Set the image for this tile
   */
  setImage(image: string): void {
    this.image = image;
  }

  /**
   * Set the light level for this tile
   */
  setLight(light: Light): void {
    this._light = light;
  }

  /**
   * Check if this tile is empty
   */
  isEmpty(): boolean {
    return this.image === "empty.jpg";
  }

  /**
   * Clone this tile
   */
  clone(): Tile {
    const tile = new Tile(this.image);
    tile._light = this.light;
    return tile;
  }
}

export class Room {
  public sections: Section[];
  private _light: Light;

  constructor(
    sections: Section[] = []
  ) {
    this.sections = sections;
    this._light = Light.lit;
  }

  get light(): Light {
    return this._light;
  }

  setLight(light: Light, creatures: ICreature[], questMap?: QuestMap) {
    this._light = light;
    questMap?.updateLighting(creatures);
  }

  /**
   * Get all sections at a specific position within this room
   */
  getSectionsAt(x: number, y: number): Section[] {
    return this.sections.filter(section =>
      x >= section.x && x < section.x + section.rotatedWidth &&
      y >= section.y && y < section.y + section.rotatedHeight
    );
  }

  /**
   * Get all terrain within this room
   */
  getTerrain(): Terrain[] {
    return this.sections.flatMap(section => section.terrain);
  }
}

export class QuestMap {
  public name: string;
  public width: number;
  public height: number;
  public rooms: Room[];
  public startingTiles: Array<{ x: number; y: number; image?: string; }>;
  public tiles: Tile[][] = [];
  public initialCreatures: ICreature[] = [];
  public night: boolean;

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
    this.startingTiles = startingTiles;
    this.initialCreatures = creatures;
    this.generateMapTiles(creatures);   
    this.night = rollD6() === 1 || true; 
    if(this.night) {
      this.rooms.forEach(room => {
        if(room.sections.some(section => section.outdoors)) {
          room.setLight(Light.darkness, creatures);
        }
      });
    }
  }

  /**
   * Get the total area of the map
   */
  getArea(): number {
    return this.width * this.height;
  }

  isValidTile(x: number, y: number): boolean {
    return this.getSectionsAt(x, y).length > 0;
  }

  /**
   * Check if coordinates are within map bounds
   */
  isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Get terrain at a specific position
   */
  getTerrainAt(x: number, y: number): Terrain[] {
    return this.rooms.flatMap(room => room.getTerrain()).filter(t =>
      t.isTileWithinTerrain(x, y)
    );
  }

  /**
   * Get sections at a specific position
   */
  getSectionsAt(x: number, y: number): Section[] {
    return this.rooms.flatMap(room => room.getSectionsAt(x, y));
  }

  /**
   * Get rooms at a specific position
   */
  getRoomAt(x: number, y: number): Room[] {
    return this.rooms.filter(room => 
      room.sections.some(section =>
        x >= section.x && x < section.x + section.rotatedWidth &&
        y >= section.y && y < section.y + section.rotatedHeight
      )
    );
  }

  /**
   * Get all tiles that belong to a specific room
   */
  getTilesInRoom(room: Room): Array<{ x: number; y: number; tile: Tile }> {
    const tiles: Array<{ x: number; y: number; tile: Tile }> = [];
    
    for (const section of room.sections) {
      const w = section.rotatedWidth;
      const h = section.rotatedHeight;
      
      for (let y = section.y; y < section.y + h; y++) {
        for (let x = section.x; x < section.x + w; x++) {
          if (this.isWithinBounds(x, y) && this.tiles[y] && this.tiles[y][x]) {
            tiles.push({ x, y, tile: this.tiles[y][x] });
          }
        }
      }
    }
    
    return tiles;
  }

  /**
   * Check if a position is a starting tile
   */
  isStartingTile(x: number, y: number): boolean {
    return this.startingTiles.some(tile => tile.x === x && tile.y === y);
  }

  getTerrain(): Terrain[] {
    return this.rooms.flatMap(room => room.getTerrain());
  }

  /**
   * Get terrain height at a specific tile position
   */
  terrainHeightAt(tx: number, ty: number): number {
    let h = 0;
    for (const t of this.rooms.flatMap(room => room.getTerrain())) {
      h = Math.max(h, t.getHeightAt(tx, ty));
    }
    return h;
  }

  /**
   * Get terrain movement cost at a specific tile position
   */
  terrainMovementCostAt(tx: number, ty: number): number {
    let cost = 1; // Default movement cost
    for (const t of this.rooms.flatMap(room => room.getTerrain())) {
      if (t.isTileWithinTerrain(tx, ty)) {
        cost = Math.max(cost, t.getMovementCostAt(tx, ty));
      }
    }
    return cost;
  }

  /**
   * Get the image of a tile at a specific position
   */
  getTileImage(x: number, y: number): string {
    if (this.isWithinBounds(x, y) && this.tiles[y] && this.tiles[y][x]) {
      return this.tiles[y][x].image;
    }
    return "empty.jpg";
  }

  /**
   * Get the light level of a tile at a specific position
   */
  getTileLight(x: number, y: number): Light {
    if (this.isWithinBounds(x, y) && this.tiles[y] && this.tiles[y][x]) {
      return this.tiles[y][x].light;
    }
    return Light.lit;
  }

  /**
   * Set the light level of a tile at a specific position
   */
  setTileLight(x: number, y: number, light: Light): void {
    if (this.isWithinBounds(x, y) && this.tiles[y] && this.tiles[y][x]) {
      this.tiles[y][x].setLight(light);
    }
  }

  /**
   * Set light level for a rectangular area
   */
  setAreaLight(startX: number, startY: number, width: number, height: number, light: Light): void {
    for (let y = startY; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        this.setTileLight(x, y, light);
      }
    }
  }

  /**
   * Add an item to a specific tile
   */
  addItemToTile(x: number, y: number, item: Item): boolean {
    if (this.isWithinBounds(x, y) && this.tiles[y] && this.tiles[y][x]) {
      this.tiles[y][x].items.push(item);
      return true;
    }
    return false;
  }

  /**
   * Remove an item from a specific tile
   */
  removeItemFromTile(x: number, y: number, itemId: string): Item | null {
    if (this.isWithinBounds(x, y) && this.tiles[y] && this.tiles[y][x]) {
      const itemIndex = this.tiles[y][x].items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        return this.tiles[y][x].items.splice(itemIndex, 1)[0] || null;
      }
    }
    return null;
  }

  /**
   * Get all items on a specific tile
   */
  getItemsOnTile(x: number, y: number): Item[] {
    if (this.isWithinBounds(x, y) && this.tiles[y] && this.tiles[y][x]) {
      return [...this.tiles[y][x].items];
    }
    return [];
  }

  /**
   * Check if a tile has any items
   */
  hasItemsOnTile(x: number, y: number): boolean {
    if (this.isWithinBounds(x, y) && this.tiles[y] && this.tiles[y][x]) {
      return this.tiles[y][x].items.length > 0;
    }
    return false;
  }

  updateLighting(allCreatures: ICreature[]): void {
    for (let y = 0; y < this.rooms.length; y++) {
      const room = this.rooms[y];
      const tiles = this.getTilesInRoom(room);
      for (const tile of tiles) {
        tile.tile.setLight(room.light);
      }
    }
  }

  generateMapTiles(creatures: ICreature[]) {
    // Initialize empty tiles
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = new Tile();
      }
    }

    // Fill in section tiles from all rooms
    for (const room of this.rooms) {
      for (const section of room.sections) {
        // Use pre-calculated rotated dimensions
        const w = section.rotatedWidth;
        const h = section.rotatedHeight;

        for (let y = section.y; y < section.y + h; y++) {
          for (let x = section.x; x < section.x + w; x++) {
            if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
              this.tiles[y][x].setImage(section.image);
            }
          }
        }
      }
    }    
  }
}
