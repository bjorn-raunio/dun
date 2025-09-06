import { Item } from '../base';

export class Consumable extends Item {
  kind: "consumable" = "consumable";
  effect: string; // description of what the consumable does
  charges?: number; // number of uses remaining (for multi-use items)
  targetType?: "self" | "ally" | "enemy" | "area"; // who can be targeted
  range?: number; // range in tiles for targeting
  properties?: string[]; // special properties like "magical", "poisonous", etc.
  restoreVitality?: number; // amount of vitality to restore
  restoreMana?: number; // amount of mana to restore
  statusEffect?: {
    type: string;
    duration?: number;
    value?: number;
  };
  removeStatusEffect?: string | string[]; // StatusEffectType(s) to remove when consumed
  healStatusEffects?: boolean; // whether this consumable heals status effects

  constructor(params: {
    id?: string;
    name: string;
    effect: string;
    charges?: number;
    targetType?: "self" | "ally" | "enemy" | "area";
    range?: number;
    properties?: string[];
    restoreVitality?: number;
    restoreMana?: number;
    statusEffect?: {
      type: string;
      duration?: number;
      value?: number;
    };
    removeStatusEffect?: string | string[];
    healStatusEffects?: boolean;
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.effect = params.effect;
    this.charges = params.charges;
    this.targetType = params.targetType;
    this.range = params.range;
    this.properties = params.properties;
    this.restoreVitality = params.restoreVitality;
    this.restoreMana = params.restoreMana;
    this.statusEffect = params.statusEffect;
    this.removeStatusEffect = params.removeStatusEffect;
    this.healStatusEffects = params.healStatusEffects;
  }
}
