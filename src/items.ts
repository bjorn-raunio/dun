// --- Items class hierarchy ---
export class Item {
  id: string;
  name: string;
  weight?: number;
  value?: number;

  constructor(params: { id: string; name: string; weight?: number; value?: number }) {
    this.id = params.id;
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

  constructor(params: {
    id: string;
    name: string;
    damage: number;
    hands: 1 | 2;
    reach?: number;
    properties?: string[];
    combatModifier?: number;
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.damage = params.damage;
    this.hands = params.hands;
    this.reach = params.reach;
    this.properties = params.properties;
    this.combatModifier = params.combatModifier;
  }
}

export class RangedWeapon extends Item {
  kind: "ranged_weapon" = "ranged_weapon";
  damage: number;
  range: { normal: number; long: number }; // e.g., tiles or feet
  ammoType?: string;
  hands: 1 | 2;
  properties?: string[];

  constructor(params: {
    id: string;
    name: string;
    damage: number;
    range: { normal: number; long: number };
    hands: 1 | 2;
    ammoType?: string;
    properties?: string[];
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.damage = params.damage;
    this.range = params.range;
    this.hands = params.hands;
    this.ammoType = params.ammoType;
    this.properties = params.properties;
  }
}

export class Armor extends Item {
  kind: "armor" = "armor";
  armor: number; // base AC or bonus
  armorType: "light" | "medium" | "heavy";
  stealthDisadvantage?: boolean;
  strengthRequirement?: number;

  constructor(params: {
    id: string;
    name: string;
    armor: number;
    armorType: "light" | "medium" | "heavy";
    stealthDisadvantage?: boolean;
    strengthRequirement?: number;
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.armor = params.armor;
    this.armorType = params.armorType;
    this.stealthDisadvantage = params.stealthDisadvantage;
    this.strengthRequirement = params.strengthRequirement;
  }
}

export class Shield extends Item {
  kind: "shield" = "shield";
  block: number; // shield bonus to AC
  size: "small" | "medium" | "large"; // shield size affects coverage and weight
  special?: string[]; // special properties like "magical", "spiked", etc.

  constructor(params: {
    id: string;
    name: string;
    block: number;
    size: "small" | "medium" | "large";
    special?: string[];
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.block = params.block;
    this.size = params.size;
    this.special = params.special;
  }
}
// --- end Items class hierarchy ---

// --- Reusable item presets and factories ---
export type WeaponPreset = { name: string; damage: number; hands: 1 | 2; reach?: number; properties?: string[]; combatModifier?: number; weight?: number; value?: number };
export const weaponPresets: Record<string, WeaponPreset> = {
  dagger: { name: "Dagger", damage: 0, hands: 1, properties: ["finesse", "light", "thrown"], combatModifier: -1, weight: 1, value: 2 },
  scimitar: { name: "Scimitar", damage: 0, hands: 1, properties: ["finesse", "light"], weight: 3, value: 25 },
  broadsword: { name: "Broadsword", damage: 1, hands: 1, properties: ["versatile"], weight: 3, value: 15 },
};

export function createWeapon(presetId: string, overrides?: Partial<ConstructorParameters<typeof Weapon>[0]> & { id: string }): Weapon {
  const p = weaponPresets[presetId];
  const id = overrides?.id ?? `${presetId}-${Math.random().toString(36).slice(2, 8)}`;
  return new Weapon({
    id,
    name: overrides?.name ?? p.name,
    damage: overrides?.damage ?? p.damage,
    hands: overrides?.hands ?? p.hands,
    reach: overrides?.reach ?? p.reach,
    properties: overrides?.properties ?? p.properties,
    combatModifier: overrides?.combatModifier ?? p.combatModifier,
    weight: overrides?.weight ?? p.weight,
    value: overrides?.value ?? p.value,
  });
}

export type RangedWeaponPreset = { name: string; damage: number; range: { normal: number; long: number }; hands: 1 | 2; ammoType?: string; properties?: string[]; weight?: number; value?: number };
export const rangedPresets: Record<string, RangedWeaponPreset> = {
  shortbow: { name: "Shortbow", damage: 6, range: { normal: 16, long: 64 }, hands: 2, properties: ["ammunition", "two-handed"], weight: 2, value: 25 },
  longbow: { name: "Longbow", damage: 8, range: { normal: 20, long: 80 }, hands: 2, properties: ["ammunition", "heavy", "two-handed"], weight: 2, value: 50 },
};

export function createRangedWeapon(presetId: string, overrides?: Partial<ConstructorParameters<typeof RangedWeapon>[0]> & { id: string }): RangedWeapon {
  const p = rangedPresets[presetId];
  const id = overrides?.id ?? `${presetId}-${Math.random().toString(36).slice(2, 8)}`;
  return new RangedWeapon({
    id,
    name: overrides?.name ?? p.name,
    damage: overrides?.damage ?? p.damage,
    range: overrides?.range ?? p.range,
    hands: overrides?.hands ?? p.hands,
    ammoType: overrides?.ammoType ?? p.ammoType,
    properties: overrides?.properties ?? p.properties,
    weight: overrides?.weight ?? p.weight,
    value: overrides?.value ?? p.value,
  });
}

export type ArmorPreset = { name: string; armor: number; armorType: "light" | "medium" | "heavy"; stealthDisadvantage?: boolean; strengthRequirement?: number; weight?: number; value?: number };
export const armorPresets: Record<string, ArmorPreset> = {
  leather: { name: "Leather Armor", armor: 4, armorType: "light", weight: 10, value: 10 },
  chainMail: { name: "Chain Mail", armor: 5, armorType: "heavy", strengthRequirement: 13, stealthDisadvantage: true, weight: 55, value: 75 },
};

export type ShieldPreset = { name: string; block: number; size: "small" | "medium" | "large"; special?: string[]; weight?: number; value?: number };
export const shieldPresets: Record<string, ShieldPreset> = {
  buckler: { name: "Buckler", block: 6, size: "small", weight: 2, value: 5 },
  shield: { name: "Shield", block: 5, size: "medium", weight: 6, value: 10 },
};

export function createArmor(presetId: string, overrides?: Partial<ConstructorParameters<typeof Armor>[0]> & { id: string }): Armor {
  const p = armorPresets[presetId];
  const id = overrides?.id ?? `${presetId}-${Math.random().toString(36).slice(2, 8)}`;
  return new Armor({
    id,
    name: overrides?.name ?? p.name,
    armor: overrides?.armor ?? p.armor,
    armorType: overrides?.armorType ?? p.armorType,
    stealthDisadvantage: overrides?.stealthDisadvantage ?? p.stealthDisadvantage,
    strengthRequirement: overrides?.strengthRequirement ?? p.strengthRequirement,
    weight: overrides?.weight ?? p.weight,
    value: overrides?.value ?? p.value,
  });
}

export function createShield(presetId: string, overrides?: Partial<ConstructorParameters<typeof Shield>[0]> & { id: string }): Shield {
  const p = shieldPresets[presetId];
  const id = overrides?.id ?? `${presetId}-${Math.random().toString(36).slice(2, 8)}`;
  return new Shield({
    id,
    name: overrides?.name ?? p.name,
    block: overrides?.block ?? p.block,
    size: overrides?.size ?? p.size,
    special: overrides?.special ?? p.special,
    weight: overrides?.weight ?? p.weight,
    value: overrides?.value ?? p.value,
  });
}
// --- end reusable item presets ---
