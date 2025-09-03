// --- Map and Terrain Type Definitions ---
import { Creature } from '../creatures/index';
import { Section } from './section';
import { Terrain } from './terrain';

export class QuestMap {
  public name: string;
  public width: number;
  public height: number;
  public sections: Section[];
  public creatures: Creature[];
  public startingTiles: Array<{ x: number; y: number; image?: string; }>;
  public tiles: string[][] = [];

  constructor(
    name: string,
    width: number,
    height: number,
    sections: Section[] = [],
    creatures: Creature[] = [],
    startingTiles: Array<{ x: number; y: number; image?: string; }> = [],
  ) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.sections = sections;
    this.creatures = creatures;
    this.startingTiles = startingTiles;
    this.generateMapTiles();
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
    return this.sections.flatMap(section => section.terrain).filter(t =>
      t.isTileWithinTerrain(x, y)
    );
  }

  /**
   * Get sections at a specific position
   */
  getSectionsAt(x: number, y: number): Section[] {
    return this.sections.filter(section =>
      x >= section.x && x < section.x + section.rotatedWidth &&
      y >= section.y && y < section.y + section.rotatedHeight
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
    this.sections.flatMap(section => section.terrain).push(terrain);
  }

  /**
   * Add a section to the map
   */
  addSection(section: Section): void {
    this.sections.push(section);
  }

  /**
   * Create a copy of the map definition
   */
  clone(): QuestMap {
    return new QuestMap(
      this.name,
      this.width,
      this.height,
      [...this.sections],
      [...this.creatures],
      [...this.startingTiles]
    );
  }

  getTerrain(): Terrain[] {
    return this.sections.flatMap(section => section.terrain);
  }

  /**
   * Get terrain height at a specific tile position
   */
  terrainHeightAt(tx: number, ty: number): number {
    let h = 0;
    for (const t of this.sections.flatMap(section => section.terrain)) {
      h = Math.max(h, t.getHeightAt(tx, ty));
    }
    return h;
  }

  /**
   * Get terrain movement cost at a specific tile position
   */
  terrainMovementCostAt(tx: number, ty: number): number {
    let cost = 1; // Default movement cost
    for (const t of this.sections.flatMap(section => section.terrain)) {
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
      this.sections.every(section =>
        section.x >= 0 && section.y >= 0 &&
        section.x + section.mapWidth <= this.width &&
        section.y + section.mapHeight <= this.height
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

  generateMapTiles() {
    // Initialize empty tiles
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = "empty.jpg";
      }
    }

    // Fill in section tiles
    for (const section of this.sections) {
      // Use pre-calculated rotated dimensions
      const w = section.rotatedWidth;
      const h = section.rotatedHeight;

      for (let y = section.y; y < section.y + h; y++) {
        for (let x = section.x; x < section.x + w; x++) {
          if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
            this.tiles[y][x] = section.image;
          }
        }
      }
    }
  }
}