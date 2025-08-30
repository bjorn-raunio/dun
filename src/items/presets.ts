// --- Reusable item presets and factories ---
export type WeaponPreset = {
  name: string;
  damage: number;
  hands: 1 | 2;
  reach?: number;
  properties?: string[];
  combatModifier?: number;
  armorModifier?: number;
  weight?: number;
  value?: number
};

export const weaponPresets: Record<string, WeaponPreset> = {
  unarmed: { name: "Unarmed", damage: 0, hands: 1, properties: ["light"], combatModifier: -1, armorModifier: 1, weight: 0, value: 0 },
  dagger: { name: "Dagger", damage: 0, hands: 1, properties: ["finesse", "light", "thrown"], combatModifier: -1, armorModifier: 0, weight: 1, value: 2 },
  scimitar: { name: "Scimitar", damage: 0, hands: 1, properties: ["finesse", "light"], armorModifier: 0, weight: 3, value: 25 },
  broadsword: { name: "Broadsword", damage: 1, hands: 1, properties: ["versatile"], armorModifier: 0, weight: 3, value: 15 },
  axe: { name: "Axe", damage: 1, hands: 1, properties: ["heavy", "two-handed"], combatModifier: -1, armorModifier: -1, weight: 4, value: 30 },
  mace: { name: "Mace", damage: 0, hands: 1, properties: ["heavy", "two-handed"], combatModifier: -1, armorModifier: -1, weight: 4, value: 30 },
};

export type RangedWeaponPreset = {
  name: string;
  damage: number;
  range: number;
  hands: 1 | 2;
  ammoType?: string;
  properties?: string[];
  armorModifier?: number;
  weight?: number;
  value?: number
};

export const rangedPresets: Record<string, RangedWeaponPreset> = {
  shortbow: { name: "Shortbow", damage: 3, range: 6, hands: 2, properties: ["ammunition", "two-handed"], armorModifier: 0, weight: 2, value: 25 },
  longbow: { name: "Longbow", damage: 4, range: 12, hands: 2, properties: ["ammunition", "heavy", "two-handed"], armorModifier: 0, weight: 2, value: 50 },
};

export type ArmorPreset = {
  name: string;
  armor: number;
  armorType: "light" | "medium" | "heavy";
  weight?: number;
  value?: number
};

export const armorPresets: Record<string, ArmorPreset> = {
  leather: { name: "Leather Armor", armor: 4, armorType: "light", weight: 10, value: 10 },
  chainMail: { name: "Chain Mail", armor: 5, armorType: "heavy", weight: 55, value: 75 },
};

export type ShieldPreset = {
  name: string;
  block: number;
  special?: string[];
  weight?: number;
  value?: number
};

export const shieldPresets: Record<string, ShieldPreset> = {
  buckler: { name: "Buckler", block: 6, weight: 2, value: 5 },
  shield: { name: "Shield", block: 5, weight: 6, value: 10 },
};
