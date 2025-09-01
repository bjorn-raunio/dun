import { generateItemId } from '../utils/idGeneration';

// --- Items class hierarchy ---
export class Item {
  id: string;
  name: string;
  weight?: number;
  value?: number;

  constructor(params: { id?: string; name: string; weight?: number; value?: number }) {
    this.id = params.id ?? generateItemId();
    this.name = params.name;
    this.weight = params.weight;
    this.value = params.value;
  }
}

export class EquippableItem extends Item {
  slot: string; // equipment slot this item occupies
  isEquipped: boolean = false;

  constructor(params: {
    id?: string;
    name: string;
    slot: string;
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.slot = params.slot;
  }
}

export class BaseWeapon extends EquippableItem {
  kind: "weapon" | "ranged_weapon";
  damage: number; // average or fixed damage value
  hands: 1 | 2;
  properties?: string[];
  armorModifier?: number; // bonus/penalty to armor value

  constructor(params: {
    id?: string;
    name: string;
    kind: "weapon" | "ranged_weapon";
    damage: number;
    hands: 1 | 2;
    properties?: string[];
    armorModifier?: number;
    weight?: number;
    value?: number;
    slot?: string;
  }) {
    super({ 
      id: params.id, 
      name: params.name, 
      slot: params.slot ?? "weapon", 
      weight: params.weight, 
      value: params.value
    });
    this.kind = params.kind;
    this.damage = params.damage;
    this.hands = params.hands;
    this.properties = params.properties;
    this.armorModifier = params.armorModifier;
  }
}

export class Weapon extends BaseWeapon {
  reach?: number; // in tiles or feet
  combatModifier?: number; // bonus to combat rolls

  constructor(params: {
    id?: string;
    name: string;
    damage: number;
    hands: 1 | 2;
    reach?: number;
    properties?: string[];
    combatModifier?: number;
    armorModifier?: number;
    weight?: number;
    value?: number;
    slot?: string;
  }) {
    super({
      ...params,
      kind: "weapon"
    });
    this.reach = params.reach;
    this.combatModifier = params.combatModifier;
  }
}

export class RangedWeapon extends BaseWeapon {
  range: number; // in tiles
  ammoType?: string;

  constructor(params: {
    id?: string;
    name: string;
    damage: number;
    range: number;
    hands: 1 | 2;
    ammoType?: string;
    properties?: string[];
    armorModifier?: number;
    weight?: number;
    value?: number;
    slot?: string;
  }) {
    super({
      ...params,
      kind: "ranged_weapon"
    });
    this.range = params.range;
    this.ammoType = params.ammoType;
  }
}

export class Armor extends EquippableItem {
  kind: "armor" = "armor";
  armor: number; // base AC or bonus
  armorType: "light" | "heavy";

  constructor(params: {
    id?: string;
    name: string;
    armor: number;
    armorType: "light" | "heavy";
    weight?: number;
    value?: number;
    slot?: string;
  }) {
    super({ 
      id: params.id, 
      name: params.name, 
      slot: params.slot ?? "armor", 
      weight: params.weight, 
      value: params.value,
    });
    this.armor = params.armor;
    this.armorType = params.armorType;
  }
}

export class Shield extends EquippableItem {
  kind: "shield" = "shield";
  block: number; // shield bonus to AC
  special?: string[]; // special properties like "magical", "spiked", etc.

  constructor(params: {
    id?: string;
    name: string;
    block: number;
    special?: string[];
    weight?: number;
    value?: number;
    slot?: string;
  }) {
    super({ 
      id: params.id, 
      name: params.name, 
      slot: params.slot ?? "shield", 
      weight: params.weight, 
      value: params.value,
    });
    this.block = params.block;
    this.special = params.special;
  }
}

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
  }
}
