import { BaseWeapon, WeaponAttack } from '../base';
import { Attributes } from '../../statusEffects/types';
import { CombatTrigger } from '../../skills/types';

export class Weapon extends BaseWeapon {

  constructor(params: {
    id?: string;
    name: string;
    attack: Partial<WeaponAttack>;
    hands: 1 | 2;
    properties?: string[];
    attributeModifiers?: Partial<Attributes>;
    combatTriggers?: CombatTrigger[];
    breakRoll?: number;
    weight?: number;
    value?: number;
    slot?: string;
  }) {
    super({
      ...params,
      kind: "weapon",
      attacks: [{
        toHitModifier: params.attack.toHitModifier ?? 0,
        armorModifier: params.attack.armorModifier ?? 0,
        damageModifier: params.attack.damageModifier ?? 0,
        range: params.attack.range ?? 1,
        minRange: 0,
        addStrength: true,
        type: "melee"
      }]
    });
  }

  /**
   * Check if this is a melee weapon (overrides base class method)
   */
  isMeleeWeapon(): this is Weapon {
    return true;
  }
}
