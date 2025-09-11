import { Attributes } from '../../statusEffects/types';
import { WeaponAttack } from '../base';
import { CombatTrigger } from '../../skills/types';
import { STATUS_EFFECT_PRESETS } from '../../statusEffects';
import { CombatEventData } from '../../utils/combat/execution';
import { DiceRoll } from '../../utils';

export type WeaponPreset = {
  name: string;
  attacks: Partial<WeaponAttack>[];
  hands: 1 | 2;
  attributeModifiers?: Partial<Attributes>;
  combatTriggers?: CombatTrigger[];
  breakRoll?: number;
  fumble?: number;
  noPenaltyForDrawing?: boolean;
  weight?: number;
  value?: number;
};

const stunOnCritical: CombatTrigger = {
  events: ["onAttackHit"],
  type: "melee",
  effect: (data: CombatEventData) => {
    if (data.target.size <= data.attacker.size) {
      data.target.addStatusEffect(STATUS_EFFECT_PRESETS.stunned.createEffect());
    }
  },
  validator: (roll: DiceRoll) => roll.criticalHit
};

export const weaponPresets: Record<string, WeaponPreset> = {
  axe: {
    name: "Axe",
    attacks: [{ toHitModifier: -1, damageModifier: 1, armorModifier: -1 }],
    hands: 1,
    breakRoll: 2,
    weight: 2,
    value: 3
  },
  bastardsword: {
    name: "Bastard Sword",
    attacks: [{ damageModifier: 2 }, { toHitModifier: -1, damageModifier: 1, armorModifier: -1 }],
    hands: 2,
    breakRoll: 1,
    weight: 3,
    value: 7
  },
  battlestaff: {
    name: "Battle Staff",
    attacks: [{ }],
    hands: 2,
    breakRoll: 2,
    weight: 3,
    value: 2,
    combatTriggers: [stunOnCritical]
  },
  battleaxe: {
    name: "Battleaxe",
    attacks: [{ toHitModifier: -1, damageModifier: 2, armorModifier: -1, shieldBreaking: true }],
    hands: 2,
    breakRoll: 2,
    weight: 4,
    value: 5
  },
  broadsword: {
    name: "Broadsword",
    attacks: [{ damageModifier: 1 }],
    hands: 1,
    breakRoll: 1,
    weight: 2,
    value: 5
  },
  club: {
    name: "Club",
    attacks: [{ toHitModifier: -1 }],
    hands: 1,
    breakRoll: 5,
    weight: 2,
    value: 0
  },
  dagger: {
    name: "Dagger",
    attacks: [{ toHitModifier: -1, backStab: true }],
    hands: 1,
    breakRoll: 1,
    noPenaltyForDrawing: true,
    weight: 1,
    value: 1
  },
  doubleHeadedAxe: {
    name: "Double-Headed Axe",
    attacks: [{ toHitModifier: -1, damageModifier: 2, armorModifier: -1, shieldBreaking: true, breaksShieldsOnCritical: true }],
    hands: 2,
    breakRoll: 2,
    fumble: 2,
    weight: 4,
    value: 5
  },

  unarmed: {
    name: "Unarmed",
    attacks: [{ toHitModifier: -1, armorModifier: 1 }],
    hands: 1,
    breakRoll: 3,
    weight: 0,
    value: 0
  },
  staff: {
    name: "Staff",
    attacks: [{ armorModifier: 1 }],
    hands: 1,
    breakRoll: 2,
    weight: 1,
    value: 2
  },
  scimitar: {
    name: "Scimitar",
    attacks: [{}],
    hands: 1,
    breakRoll: 1,
    weight: 1,
    value: 2
  },
  shortsword: {
    name: "Shortsword",
    attacks: [{ armorModifier: -1 }],
    hands: 1,
    breakRoll: 1,
    weight: 3,
    value: 15
  },
  mace: {
    name: "Mace",
    attacks: [{ toHitModifier: -1, armorModifier: -1 }],
    hands: 1,
    breakRoll: 3,
    weight: 4,
    value: 30,
    combatTriggers: [stunOnCritical]
  },
};
