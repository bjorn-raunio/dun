import { Creature } from './base';
import { CREATURE_GROUPS } from './types';

// --- Hero Class ---
export class Hero extends Creature {
  get kind(): "hero" {
    return "hero";
  }

  constructor(params: any) {
    // Ensure hero group is set
    super({
      ...params,
      group: params.group || CREATURE_GROUPS.HERO
    });
  }

  // --- Abstract Method Implementation ---
  protected createInstance(params: any): Creature {
    return new Hero(params);
  }

  // Hero-specific methods can be added here
  // For example: special abilities, experience, leveling, etc.
}
