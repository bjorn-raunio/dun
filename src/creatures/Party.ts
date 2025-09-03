import { ICreature } from './index';

export class Party {
  private _currentRegionId: string;
  private _creatures: ICreature[];

  constructor(currentRegionId: string, creatures: ICreature[] = []) {
    this._currentRegionId = currentRegionId;
    this._creatures = creatures;
  }

  // Getters
  get currentRegionId(): string {
    return this._currentRegionId;
  }

  get creatures(): ICreature[] {
    return [...this._creatures]; // Return a copy to prevent external modification
  }

  get size(): number {
    return this._creatures.length;
  }

  // Setters
  set currentRegionId(regionId: string) {
    this._currentRegionId = regionId;
  }

  // Party management methods
  addCreature(creature: ICreature): void {
    if (!this._creatures.find(c => c.id === creature.id)) {
      this._creatures.push(creature);
    }
  }

  removeCreature(creatureId: string): boolean {
    const index = this._creatures.findIndex(c => c.id === creatureId);
    if (index !== -1) {
      this._creatures.splice(index, 1);
      return true;
    }
    return false;
  }

  hasCreature(creatureId: string): boolean {
    return this._creatures.some(c => c.id === creatureId);
  }

  getCreature(creatureId: string): ICreature | undefined {
    return this._creatures.find(c => c.id === creatureId);
  }

  // Travel method
  travelToRegion(regionId: string): void {
    this._currentRegionId = regionId;
  }

  // Clone method for creating copies
  clone(): Party {
    return new Party(this._currentRegionId, [...this._creatures]);
  }

  // Serialization for game state
  toJSON() {
    return {
      currentRegionId: this._currentRegionId,
      creatures: this._creatures.map(c => c.id)
    };
  }

  // Static factory method
  static fromJSON(data: { currentRegionId: string; creatures: string[] }, creatureMap: Map<string, ICreature>): Party {
    const creatures = data.creatures
      .map(id => creatureMap.get(id))
      .filter((c): c is ICreature => c !== undefined);
    
    return new Party(data.currentRegionId, creatures);
  }
}
