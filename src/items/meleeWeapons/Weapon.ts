import { BaseWeapon, WeaponAttack } from '../base';
import { Attributes } from '../../statusEffects/types';
import { CombatTrigger } from '../../skills/types';

export class Weapon extends BaseWeapon {

  constructor(params: {
    id?: string;
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
    slot?: string;
    rarity?: number;
  }) {
    super({
      ...params,
      kind: "weapon",
      attacks: params.attacks.map(attack => {
        return {
          toHitModifier: attack.toHitModifier ?? 0,
          armorModifier: attack.armorModifier ?? 0,
          damageModifier: attack.damageModifier ?? 0,
          range: attack.range ?? 1,
          backStab: attack.backStab ?? false,
          shieldBreaking: attack.shieldBreaking ?? false,
          minRange: 0,
          addStrength: true,
          type: "melee"
        }
      })
    });
  }

  /**
   * Check if this is a melee weapon (overrides base class method)
   */
  isMeleeWeapon(): this is Weapon {
    return true;
  }
}
