import { generateItemId } from '../utils/idGeneration';
import { Attributes } from '../statusEffects/types';
import { addGameMessage } from '../utils/messageSystem';
import { ICreature } from '../creatures';
import { createStatusEffect, standardAttributeModifiers } from '../statusEffects';
import { rollD6 } from '../utils/dice';

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

  constructor(params: {
    id?: string;
    name: string;
    slot: string;
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.slot = params.slot;
  }
}

export type WeaponAttack = {
  toHitModifier: number;
  armorModifier: number;
  damageModifier: number;
  range: number;
  minRange: number;
  addStrength: boolean;
  isRanged: boolean;
}

export class BaseWeapon extends EquippableItem {
  kind: "weapon" | "ranged_weapon";
  readonly attacks: WeaponAttack[];
  hands: 1 | 2;
  properties?: string[];
  attributeModifiers?: Partial<Attributes>; // stat bonuses from equipment
  broken: boolean = false; // whether the weapon is broken
  breakRoll: number; // roll equal or lower on 1d6 to break

  constructor(params: {
    id?: string;
    name: string;
    kind: "weapon" | "ranged_weapon";
    attacks: WeaponAttack[];
    hands: 1 | 2;
    properties?: string[];
    attributeModifiers?: Partial<Attributes>;
    broken?: boolean;
    breakRoll?: number;
    weight?: number;
    value?: number;
    slot?: string;
  }) {
    super({
      id: params.id,
      name: params.name,
      slot: params.slot ?? "weapon",
      weight: params.weight,
      value: params.value
    });
    this.kind = params.kind;
    this.attacks = params.attacks;
    this.hands = params.hands;
    this.properties = params.properties;
    this.attributeModifiers = params.attributeModifiers;
    this.broken = params.broken ?? false;
    this.breakRoll = params.breakRoll ?? 1;
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
   * Break the weapon
   */
  break(creature: ICreature): void {
    if (this.name === 'Unarmed') {
      creature.addStatusEffect(createStatusEffect('stunned', 'stunned', null, {
        name: "Injured",
        attributeModifiers: {
          ...standardAttributeModifiers
        },
        priority: 1
      }));
      return;
    }
    this.broken = true;
    addGameMessage(`${creature.name}s ${this.name.toLowerCase()} breaks!`);
  }

  /**
   * Check if the weapon is broken
   */
  isBroken(): boolean {
    return this.broken;
  }

  /**
   * Check if the weapon should break on a 1d6 roll
   * @returns true if the weapon breaks
   */
  checkForBreaking(): boolean {
    if (this.broken || this.breakRoll <= 0) {
      return false;
    }

    const roll = rollD6();
    return roll <= this.breakRoll;
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
