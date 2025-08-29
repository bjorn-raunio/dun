import { Creature, CREATURE_GROUPS } from './base';

// --- Mercenary Class ---
export class Mercenary extends Creature {
  // Mercenary-specific properties
  hireCost: number;

  get kind(): "mercenary" {
    return "mercenary";
  }

  constructor(params: any) {
    // Ensure mercenary group is set (default to hero group for player control)
    super({
      ...params,
      group: params.group || CREATURE_GROUPS.HERO
    });

    // Initialize mercenary-specific properties
    this.hireCost = params.hireCost || 50;
  }

  // Clone mercenary with all properties
  clone(overrides?: Partial<Mercenary>): Mercenary {
    const params = {
      name: this.name,
      x: this.x,
      y: this.y,
      image: this.image,
      movement: this.movement,
      actions: this.actions,
      quickActions: this.quickActions,
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      size: this.size,
      facing: this.facing,
      inventory: [...this.inventory],
      equipment: { ...this.equipment },
      combat: this.combat,
      ranged: this.ranged,
      strength: this.strength,
      agility: this.agility,
      remainingVitality: this.remainingVitality,
      naturalArmor: this.naturalArmor,
      group: this.group,
      // Mercenary-specific properties
      hireCost: this.hireCost,
      ...overrides
    };

    return new Mercenary(params);
  }
}
