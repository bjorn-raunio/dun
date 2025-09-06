import { Attributes } from '../../statusEffects/types';

export type ArmorPreset = {
  name: string;
  armor: number;
  armorType: "light" | "heavy";
  attributeModifiers?: Partial<Attributes>;
  weight?: number;
  value?: number
};

export const armorPresets: Record<string, ArmorPreset> = {
  leather: { name: "Leather Armor", armor: 1, armorType: "light", weight: 10, value: 10 },
  chainMail: { name: "Chain Mail", armor: 2, armorType: "heavy", weight: 55, value: 75, attributeModifiers: { movement: -1, agility: -1, ranged: -1, perception: -1, dexterity: -1 } },
};
