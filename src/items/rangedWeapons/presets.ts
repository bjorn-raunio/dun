import { Attributes } from '../../statusEffects/types';
import { WeaponAttack } from '../base';
import { CombatTrigger } from '../../skills/types';
import { STATUS_EFFECT_PRESETS } from '../../statusEffects';
import { isDoubles } from '../../utils/dice';
import { CombatEventData } from '../../utils/combat/execution';

export type RangedWeaponPreset = {
  name: string;
  attack: Partial<WeaponAttack>;
  hands: 1 | 2;
  properties?: string[];
  attributeModifiers?: Partial<Attributes>;
  combatTriggers?: CombatTrigger[];
  breakRoll?: number;
  weight?: number;
  value?: number
};

export const rangedPresets: Record<string, RangedWeaponPreset> = {
  sling: { 
    name: "Sling", 
    attack: { damageModifier: 3, toHitModifier: -1, range: 20 }, 
    hands: 1, 
    properties: [], 
    breakRoll: 1, 
    weight: 2, 
    value: 25
  },
  shortbow: { 
    name: "Shortbow", 
    attack: { damageModifier: 3, range: 18 }, 
    hands: 2, 
    properties: [], 
    breakRoll: 2, 
    weight: 2, 
    value: 25
  },
  longbow: { 
    name: "Longbow", 
    attack: { damageModifier: 4, range: 24 }, 
    hands: 2, 
    properties: [], 
    breakRoll: 2, 
    weight: 2, 
    value: 50
  },
};
