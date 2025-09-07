import { Attributes } from '../../statusEffects/types';
import { WeaponAttack } from '../base';
import { CombatTrigger } from '../../skills/types';
import { STATUS_EFFECT_PRESETS } from '../../statusEffects';
import { isCriticalHit, isDoubles } from '../../utils/dice';
import { CombatEventData } from '../../utils/combat/execution';

export type WeaponPreset = {
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

export const weaponPresets: Record<string, WeaponPreset> = {
  unarmed: { name: "Unarmed", attack: { toHitModifier: -1, armorModifier: 1 }, hands: 1, properties: ["light"], breakRoll: 3, weight: 0, value: 0 },
  dagger: { 
    name: "Dagger", 
    attack: { toHitModifier: -1 }, 
    hands: 1, 
    properties: ["finesse"], 
    breakRoll: 1, 
    weight: 1, 
    value: 2
  },
  staff: { 
    name: "Staff", 
    attack: { armorModifier: 1 }, 
    hands: 1, 
    properties: [], 
    breakRoll: 2, 
    weight: 1, 
    value: 2 
  },
  scimitar: { 
    name: "Scimitar", 
    attack: { }, 
    hands: 1, 
    properties: [], 
    breakRoll: 1, 
    weight: 1, 
    value: 2 
  },
  broadsword: { 
    name: "Broadsword", 
    attack: { damageModifier: 1 }, 
    hands: 1, 
    properties: [], 
    breakRoll: 1, 
    weight: 3, 
    value: 15
  },
  axe: { 
    name: "Axe", 
    attack: { toHitModifier: -1, damageModifier: 1, armorModifier: -1 }, 
    hands: 1, 
    properties: [], 
    breakRoll: 2, 
    weight: 4, 
    value: 30
  },
  mace: { 
    name: "Mace", 
    attack: { toHitModifier: -1, armorModifier: -1 }, 
    hands: 1, 
    properties: [], 
    breakRoll: 3, 
    weight: 4, 
    value: 30,
    combatTriggers: [
      {
        events: ["onAttackHit"],
        type: "melee",
        effect: (data: CombatEventData) => {
          if (data.target.size <= data.attacker.size) {
            data.target.addStatusEffect(STATUS_EFFECT_PRESETS.stunned.createEffect());
          }
        },
        validator: (roll) => isCriticalHit(roll.dice)
      }
    ]
  },
};
