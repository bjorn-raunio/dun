import { Creature } from './base';
import { CREATURE_GROUPS } from './types';
import { CreatureConstructorParams } from './types';

// --- Mercenary Class ---
export class Mercenary extends Creature {
  // Mercenary-specific properties
  hireCost: number;

  get kind(): "mercenary" {
    return "mercenary";
  }

  constructor(params: CreatureConstructorParams & { hireCost?: number }) {
    // Ensure mercenary group is set (default to hero group for player control)
    super({
      ...params,
      group: params.group || CREATURE_GROUPS.PLAYER
    });

    // Initialize mercenary-specific properties
    this.hireCost = params.hireCost || 50;
  }

  // --- Abstract Method Implementation ---
  protected createInstance(params: CreatureConstructorParams & { hireCost?: number }): Creature {
    return new Mercenary(params);
  }

  // Clone mercenary with all properties
  clone(overrides?: Partial<Mercenary>): Mercenary {
    // Use parent class clone method for common properties
    const clonedCreature = super.clone(overrides) as Mercenary;
    
    // Ensure mercenary-specific properties are preserved
    clonedCreature.hireCost = overrides?.hireCost ?? this.hireCost;
    
    return clonedCreature;
  }
}
