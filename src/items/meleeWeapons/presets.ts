import { Attributes } from '../../statusEffects/types';
import { WeaponAttack } from '../base';

export type WeaponPreset = {
  name: string;
  attack: Partial<WeaponAttack>;
  hands: 1 | 2;
  properties?: string[];
  attributeModifiers?: Partial<Attributes>;
  breakRoll?: number;
  weight?: number;
  value?: number
};

export const weaponPresets: Record<string, WeaponPreset> = {
  unarmed: { name: "Unarmed", attack: { toHitModifier: -1, armorModifier: 1 }, hands: 1, properties: ["light"], breakRoll: 3, weight: 0, value: 0 },
  dagger: { name: "Dagger", attack: { toHitModifier: -1 }, hands: 1, properties: ["finesse", "light", "thrown"], breakRoll: 1, weight: 1, value: 2 },
  broadsword: { name: "Broadsword", attack: { damageModifier: 1 }, hands: 1, properties: ["versatile"], breakRoll: 1, weight: 3, value: 15 },
  axe: { name: "Axe", attack: { toHitModifier: -1, damageModifier: 1, armorModifier: -1 }, hands: 1, properties: ["heavy", "two-handed"], breakRoll: 2, weight: 4, value: 30 },
  mace: { name: "Mace", attack: { toHitModifier: -1, armorModifier: -1 }, hands: 1, properties: ["heavy", "two-handed"], breakRoll: 3, weight: 4, value: 30 },
};
