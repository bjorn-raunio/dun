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

export class Weapon extends Item {
  kind: "weapon" = "weapon";
  damage: number; // average or fixed damage value
  hands: 1 | 2;
  reach?: number; // in tiles or feet
  properties?: string[];
  combatModifier?: number; // bonus to combat rolls
  armorModifier?: number; // bonus/penalty to armor value

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
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.damage = params.damage;
    this.hands = params.hands;
    this.reach = params.reach;
    this.properties = params.properties;
    this.combatModifier = params.combatModifier;
    this.armorModifier = params.armorModifier;
  }
}

export class RangedWeapon extends Item {
  kind: "ranged_weapon" = "ranged_weapon";
  damage: number;
  range: { normal: number; long: number }; // e.g., tiles or feet
  ammoType?: string;
  hands: 1 | 2;
  properties?: string[];
  armorModifier?: number; // bonus/penalty to armor value

  constructor(params: {
    id?: string;
    name: string;
    damage: number;
    range: { normal: number; long: number };
    hands: 1 | 2;
    ammoType?: string;
    properties?: string[];
    armorModifier?: number;
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.damage = params.damage;
    this.range = params.range;
    this.hands = params.hands;
    this.ammoType = params.ammoType;
    this.properties = params.properties;
    this.armorModifier = params.armorModifier;
  }
}

export class Armor extends Item {
  kind: "armor" = "armor";
  armor: number; // base AC or bonus
  armorType: "light" | "medium" | "heavy";

  constructor(params: {
    id?: string;
    name: string;
    armor: number;
    armorType: "light" | "medium" | "heavy";
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.armor = params.armor;
    this.armorType = params.armorType;
  }
}

export class Shield extends Item {
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
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.block = params.block;
    this.special = params.special;
  }
}
