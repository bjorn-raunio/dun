import { generateItemId } from '../utils/idGeneration';
import { Attributes } from '../statusEffects/types';
import { addGameMessage } from '../utils/messageSystem';
import { ICreature } from '../creatures';
import { createStatusEffect, standardAttributeModifiers } from '../statusEffects';
import { rollD6 } from '../utils/dice';
import { CombatTrigger } from '../skills/types';

// --- Base Item Classes ---
export class Item {
  id: string;
  name: string;
  weight?: number;
  value?: number;

  constructor(params: { id?: string; name: string; weight?: number; value?: number }) {
    this.id = params.id ?? generateItemId();
    this.name = params.name;
    this.weight = params.weight;
    this.value = params.value;
  }

  /**
   * Check if this item is a weapon
   */
  isWeapon(): this is BaseWeapon {
    return false;
  }
}

export class EquippableItem extends Item {
  slot: string; // equipment slot this item occupies
  isEquipped: boolean = false;
  broken: boolean = false; // whether the weapon is broken
  breakRoll: number; // roll equal or lower on 1d6 to break
  rarity: number;
  magical: boolean;

  constructor(params: {
    id?: string;
    name: string;
    slot: string;
    weight?: number;
    value?: number;
    breakRoll?: number;
    rarity?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.slot = params.slot;
    this.breakRoll = params.breakRoll ?? 0;
    this.rarity = params.rarity ?? 0;
    this.magical = false;
  }

  /**
   * Break the item
   */
  break(creature: ICreature, autoBreak: boolean = false): boolean {
    if (this.broken || (!autoBreak && !this.checkForBreaking())) {
      return false;
    }
    if (this.name === 'Unarmed') {
      creature.addStatusEffect(createStatusEffect('stunned', 'stunned', null, {
        name: "Injured",
        attributeModifiers: {
          ...standardAttributeModifiers
        },
        priority: 1
      }));
      return false;
    }
    this.broken = true;
    addGameMessage(`${creature.name}s ${this.name.toLowerCase()} breaks!`);
    return true;
  }

  /**
   * Check if the item is broken
   */
  isBroken(): boolean {
    return this.broken;
  }

  /**
   * Check if the item should break on a 1d6 roll
   * @returns true if the item breaks
   */
  checkForBreaking(): boolean {
    if (this.broken || this.breakRoll <= 0) {
      return false;
    }

    const roll = rollD6();
    return roll <= this.breakRoll;
  }
}

export type WeaponAttackType = "melee" | "ranged" | "throwing";

export type WeaponAttack = {
  toHitModifier: number;
  armorModifier: number;
  damageModifier: number;
  range: number;
  minRange: number;
  addStrength: boolean;
  type: WeaponAttackType;
  shieldBreaking?: boolean;
  breaksShieldsOnCritical?: boolean;
  backStab?: boolean;
}

export class BaseWeapon extends EquippableItem {
  kind: "weapon" | "ranged_weapon";
  readonly attacks: WeaponAttack[];
  hands: 1 | 2;
  attributeModifiers?: Partial<Attributes>; // stat bonuses from equipment
  combatTriggers?: CombatTrigger[]; // combat triggers for weapon effects
  fumble: number;
  noPenaltyForDrawing?: boolean;

  constructor(params: {
    id?: string;
    name: string;
    kind: "weapon" | "ranged_weapon";
    attacks: WeaponAttack[];
    hands: 1 | 2;
    attributeModifiers?: Partial<Attributes>;
    combatTriggers?: CombatTrigger[];
    breakRoll?: number;
    fumble?: number;
    noPenaltyForDrawing?: boolean;
    weight?: number;
    value?: number;
    slot?: string;
  }) {
    super({
      id: params.id,
      name: params.name,
      slot: params.slot ?? "weapon",
      weight: params.weight,
      value: params.value,
      breakRoll: params.breakRoll
    });
    this.kind = params.kind;
    this.attacks = params.attacks;
    this.hands = params.hands;
    this.attributeModifiers = params.attributeModifiers;
    this.combatTriggers = params.combatTriggers;
    this.fumble = params.fumble ?? 1;
    this.noPenaltyForDrawing = params.noPenaltyForDrawing ?? false;
  }

  getValidRange(): { min: number, max: number } {
    let range = { min: Infinity, max: -Infinity };
    for (const attack of this.attacks) {
      if (attack.minRange < range.min) {
        range.min = attack.minRange;
      }
      if (attack.range > range.max) {
        range.max = attack.range;
      }
    }
    return range;
  }

  isValidRange(range: number): boolean {
    const validRange = this.getValidRange();
    return range >= validRange.min && range <= validRange.max;
  }

  /**
   * Check if this item is a weapon
   */
  isWeapon(): this is BaseWeapon {
    return true;
  }

  /**
   * Check if this is a melee weapon
   */
  isMeleeWeapon(): boolean {
    return this.kind === "weapon";
  }

  /**
   * Check if this is a ranged weapon
   */
  isRangedWeapon(): boolean {
    return this.kind === "ranged_weapon";
  }
}
