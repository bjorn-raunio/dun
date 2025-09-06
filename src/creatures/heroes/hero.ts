import { Creature } from '../base';
import { CREATURE_GROUPS } from '../CreatureGroup';
import { CreatureConstructorParams } from '../types';

// --- Hero Class ---
export class Hero extends Creature {
  get kind(): "hero" {
    return "hero";
  }

  constructor(params: CreatureConstructorParams) {
    // Ensure hero group is set
    super({
      ...params,
      group: params.group || CREATURE_GROUPS.PLAYER
    });
  }

  // --- Abstract Method Implementation ---
  protected createInstance(params: CreatureConstructorParams): Creature {
    return new Hero(params);
  }

  // Hero-specific methods can be added here
  // For example: special abilities, experience, leveling, etc.
}
