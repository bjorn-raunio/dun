import { Attributes } from '../../statusEffects/types';
import { WeaponAttack } from '../base';

export type RangedWeaponPreset = {
  name: string;
  attack: Partial<WeaponAttack>;
  hands: 1 | 2;
  properties?: string[];
  attributeModifiers?: Partial<Attributes>;
  breakRoll?: number;
  weight?: number;
  value?: number
};

export const rangedPresets: Record<string, RangedWeaponPreset> = {
  shortbow: { name: "Shortbow", attack: { damageModifier: 3, range: 6 }, hands: 2, properties: ["ammunition", "two-handed"], breakRoll: 2, weight: 2, value: 25 },
  longbow: { name: "Longbow", attack: { damageModifier: 4, range: 12 }, hands: 2, properties: ["ammunition", "heavy", "two-handed"], breakRoll: 2, weight: 2, value: 50 },
};
