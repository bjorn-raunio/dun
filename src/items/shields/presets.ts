import { Attributes } from '../../statusEffects/types';

export type ShieldPreset = {
  name: string;
  block: number;
  special?: string[];
  attributeModifiers?: Partial<Attributes>;
  breakRoll?: number;
  weight?: number;
  value?: number
};

export const shieldPresets: Record<string, ShieldPreset> = {
  buckler: { name: "Buckler", block: 6, breakRoll: 1, weight: 2, value: 5 },
  shield: { name: "Shield", block: 5, breakRoll: 2, weight: 6, value: 10 },
};
