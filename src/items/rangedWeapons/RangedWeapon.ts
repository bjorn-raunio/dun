import { BaseWeapon, WeaponAttack } from '../base';
import { Attributes } from '../../statusEffects/types';

export class RangedWeapon extends BaseWeapon {

  constructor(params: {
    id?: string;
    name: string;
    attack: Partial<WeaponAttack>;
    hands: 1 | 2;
    properties?: string[];
    attributeModifiers?: Partial<Attributes>;
    breakRoll?: number;
    weight?: number;
    value?: number;
    slot?: string;
  }) {
    super({
      ...params,
      kind: "ranged_weapon",
      attacks: [{
        toHitModifier: params.attack.toHitModifier ?? 0,
        armorModifier: params.attack.armorModifier ?? 0,
        damageModifier: params.attack.damageModifier ?? 0,
        range: params.attack.range ?? 0,
        minRange: 2,
        addStrength: params.attack.addStrength ?? false,
        isRanged: true
      }]
    });
  }

  /**
   * Check if this is a ranged weapon (overrides base class method)
   */
  isRangedWeapon(): this is RangedWeapon {
    return true;
  }
}
