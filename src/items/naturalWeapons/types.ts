import { CombatTrigger } from '../../skills';
import { Attributes } from '../../statusEffects';
import { BaseWeapon, WeaponAttack } from '../base';
import { generateItemId } from '../../utils/idGeneration';

// --- Natural Weapon Class ---

export class NaturalWeapon extends BaseWeapon {
  readonly isNaturalWeapon: true = true;

  constructor(params: {
    id?: string;
    name: string;
    attack: Partial<WeaponAttack>;
    hands: 1 | 2;
    attributeModifiers?: Partial<Attributes>;
    combatTriggers?: CombatTrigger[];
  }) {
    super({
      id: params.id ?? generateItemId(),
      name: params.name,
      kind: "weapon",
      attacks: [{
        toHitModifier: params.attack.toHitModifier ?? 0,
        armorModifier: params.attack.armorModifier ?? 0,
        damageModifier: params.attack.damageModifier ?? 0,
        range: params.attack.range ?? 1,
        minRange: 0,
        addStrength: true,
        type: "melee"
      }],
      hands: params.hands,
      attributeModifiers: params.attributeModifiers,
      combatTriggers: params.combatTriggers,
      slot: "natural",
      weight: 0, // Natural weapons have no weight
      value: 0, // Natural weapons have no monetary value
      breakRoll: 1
    });
  }
}

// --- Natural Weapon Preset Type ---

export interface NaturalWeaponPreset {
  name: string;
  attack: Partial<WeaponAttack>;
  hands: 1 | 2;
  attributeModifiers?: Partial<Attributes>;
  combatTriggers?: CombatTrigger[];
}
