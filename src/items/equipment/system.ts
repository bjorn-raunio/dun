import { Item } from '../base';
import { Weapon } from '../meleeWeapons';
import { RangedWeapon } from '../rangedWeapons';
import { Armor } from '../armor';
import { Shield } from '../shields';
import { BaseWeapon } from '../base';
import { createWeapon } from '../meleeWeapons';
import { NaturalWeapon } from '../naturalWeapons';
import { EquipmentSlot, EquipmentSlots, EquipmentValidation, EquipmentValidator } from './validation';
import { CombatCalculator } from './combat';
import { ICreature } from '../../creatures/index';

// --- Equipment System ---

export class EquipmentSystem {
  private slots: EquipmentSlots = { mainHand: undefined, offHand: undefined, armor: undefined };
  private static sharedUnarmedWeapon: Weapon | null = null;
  private naturalWeapons: NaturalWeapon[] = [];

  constructor(initialEquipment?: Partial<EquipmentSlots>, naturalWeapons?: NaturalWeapon[]) {
    if (initialEquipment) {
      this.slots = { ...initialEquipment, mainHand: initialEquipment.mainHand ?? undefined, offHand: initialEquipment.offHand ?? undefined, armor: initialEquipment.armor ?? undefined };
    }
    if (naturalWeapons) {
      this.naturalWeapons = [...naturalWeapons];
    }
    // Use shared unarmed weapon to prevent creating new instances
    if (!EquipmentSystem.sharedUnarmedWeapon) {
      EquipmentSystem.sharedUnarmedWeapon = createWeapon('unarmed');
    }
  }

  private get unarmedWeapon(): Weapon {
    return EquipmentSystem.sharedUnarmedWeapon!;
  }

  // --- Equipment Management ---

  /**
   * Equip an item to a specific slot
   */
  equip(item: Item, slot: EquipmentSlot, creature?: ICreature): EquipmentValidation {
    const validation = EquipmentValidator.validateEquip(item, slot, creature);
    if (!validation.isValid) {
      return validation;
    }

    // Type assertion to ensure the item is compatible with the slot
    if (slot === 'mainHand' && item.isWeapon()) {
      this.slots[slot] = item;
    } else if (slot === 'offHand' && (item.isWeapon() || item instanceof Shield)) {
      this.slots[slot] = item;
    } else if (slot === 'armor' && item instanceof Armor) {
      this.slots[slot] = item;
    }

    return { isValid: true };
  }

  /**
   * Unequip an item from a specific slot
   */
  unequip(slot: EquipmentSlot, creature?: ICreature): Item | undefined {
    const item = this.slots[slot];
    if (item) {
      this.slots[slot] = undefined;
      return item;
    }
    return undefined;
  }

  /**
   * Get an item from a specific slot
   */
  getItem(slot: EquipmentSlot): Item | undefined {
    return this.slots[slot];
  }

  /**
   * Get all equipped items
   */
  getAllItems(): EquipmentSlots {
    return { ...this.slots };
  }

  /**
   * Clear all equipment
   */
  clearAll(): void {
    this.slots = { mainHand: undefined, offHand: undefined, armor: undefined };
  }

  /**
   * Check if equipment is valid (no conflicts)
   */
  validateEquipment(): EquipmentValidation {
    return EquipmentValidator.validateEquipment(this.slots);
  }

  // --- Natural Weapon Management ---

  /**
   * Get all natural weapons
   */
  getNaturalWeapons(): NaturalWeapon[] {
    return [...this.naturalWeapons];
  }

  /**
   * Check if creature has functional natural weapons
   */
  hasNaturalWeapons(): boolean {
    return this.naturalWeapons.some(weapon => !weapon.isBroken());
  }

  /**
   * Check if creature can use natural weapons (has functional natural weapons and a free hand)
   */
  canUseNaturalWeapons(): boolean {
    return this.hasNaturalWeapons() && this.hasFreeHand();
  }

  /**
   * Check if creature has a free hand for natural weapons
   */
  hasFreeHand(): boolean {
    const mainHandWeapon = this.getWeaponFromSlot(this.slots.mainHand);
    const offHandWeapon = this.getWeaponFromSlot(this.slots.offHand);

    // Check if main hand is free (no weapon or broken weapon)
    const mainHandFree = !mainHandWeapon || mainHandWeapon.isBroken();

    // Check if off hand is free (no weapon or broken weapon)
    const offHandFree = !offHandWeapon || offHandWeapon.isBroken();

    // Creature has a free hand if either hand is free
    return mainHandFree || offHandFree;
  }

  /**
   * Get the best natural weapon (highest combat bonus) if creature has a free hand
   * Only returns functional natural weapons, broken ones are treated as unavailable
   */
  getBestNaturalWeapon(): NaturalWeapon | null {
    if (this.naturalWeapons.length === 0 || !this.hasFreeHand()) {
      return null;
    }

    // Only consider functional natural weapons (same as equipped weapons)
    const functionalNaturalWeapons = this.naturalWeapons.filter(weapon => !weapon.isBroken());

    if (functionalNaturalWeapons.length === 0) {
      return null;
    }

    return functionalNaturalWeapons.reduce((best, current) => {
      const bestBonus = best.attacks.find(attack => attack.type === "melee")?.toHitModifier ?? -Infinity;
      const currentBonus = current.attacks.find(attack => attack.type === "melee")?.toHitModifier ?? -Infinity;
      return currentBonus > bestBonus ? current : best;
    });
  }

  // --- Equipment Queries ---

  /**
   * Check if creature has a shield equipped
   */
  hasShield(isBackAttack: boolean = false): boolean {
    // Shields don't count during back attacks
    if (isBackAttack) {
      return false;
    }
    // Broken shields don't count
    if (this.slots.offHand instanceof Shield && this.slots.offHand.isBroken()) {
      return false;
    }
    return this.slots.offHand instanceof Shield;
  }

  /**
   * Check if creature has armor equipped
   */
  hasArmor(): boolean {
    return this.slots.armor instanceof Armor;
  }

  /**
   * Check if creature has a melee weapon equipped
   */
  hasMeleeWeapon(): boolean {
    return (this.slots.mainHand?.isWeapon() && this.slots.mainHand.isMeleeWeapon()) ||
      (this.slots.offHand?.isWeapon() && this.slots.offHand.isMeleeWeapon()) ||
      this.isUnarmed(); // Unarmed creatures count as having a melee weapon
  }

  /**
   * Check if creature is unarmed (no weapons equipped or all weapons are broken)
   * A creature is considered unarmed if they have no weapons or all weapons are broken, even if they have natural weapons or a shield
   */
  isUnarmed(): boolean {
    const mainHandWeapon = this.getWeaponFromSlot(this.slots.mainHand);
    const offHandWeapon = this.getWeaponFromSlot(this.slots.offHand);

    const hasMainHandWeapon = mainHandWeapon !== null;
    const hasOffHandWeapon = offHandWeapon !== null;

    // If no weapons at all, creature is unarmed (even if they have natural weapons)
    if (!hasMainHandWeapon && !hasOffHandWeapon) {
      return true;
    }

    // If main hand weapon is broken and no off hand weapon, creature is unarmed
    if (hasMainHandWeapon && mainHandWeapon.isBroken() && !hasOffHandWeapon) {
      return true;
    }

    // If both weapons are broken, creature is unarmed
    if (hasMainHandWeapon && hasOffHandWeapon && mainHandWeapon.isBroken() && offHandWeapon.isBroken()) {
      return true;
    }

    // Creature has at least one functional weapon
    return false;
  }

  /**
   * Helper method to safely extract weapon from slot
   */
  private getWeaponFromSlot(item: Item | undefined): BaseWeapon | null {
    if (item?.isWeapon()) {
      return item;
    }
    return null;
  }

  /**
   * Get the main weapon (prioritizes main hand, then off hand, then natural weapons)
   * Returns unarmed weapon only if no weapons are available
   */
  getMainWeapon(): BaseWeapon {
    const mainHandWeapon = this.getWeaponFromSlot(this.slots.mainHand);
    const offHandWeapon = this.getWeaponFromSlot(this.slots.offHand);

    // Try main hand first
    if (mainHandWeapon && !mainHandWeapon.isBroken()) {
      return mainHandWeapon;
    }

    // Try off hand if main hand is broken or empty
    if (offHandWeapon && !offHandWeapon.isBroken()) {
      return offHandWeapon;
    }

    // Try natural weapons if no equipped weapons
    const bestNaturalWeapon = this.getBestNaturalWeapon();
    if (bestNaturalWeapon) {
      return bestNaturalWeapon;
    }

    // Return unarmed weapon only if no natural weapons available
    return this.unarmedWeapon;
  }

  /**
   * Get the offhand weapon
   * Returns natural weapon or unarmed weapon if no offhand weapon is equipped or offhand weapon is broken
   */
  getOffHandWeapon(): BaseWeapon {
    const offHandWeapon = this.getWeaponFromSlot(this.slots.offHand);

    if (offHandWeapon && !offHandWeapon.isBroken()) {
      return offHandWeapon;
    }

    // Try natural weapons if no offhand weapon
    const bestNaturalWeapon = this.getBestNaturalWeapon();
    if (bestNaturalWeapon) {
      return bestNaturalWeapon;
    }

    // Return unarmed weapon only if no natural weapons available
    return this.unarmedWeapon;
  }

  getUnarmedWeapon(): BaseWeapon {
    // Return natural weapon if available, otherwise unarmed weapon
    const bestNaturalWeapon = this.getBestNaturalWeapon();
    return bestNaturalWeapon || this.unarmedWeapon;
  }

  /**
   * Get the weapon with the highest combat bonus
   * Compares main hand, offhand, natural weapons, and unarmed weapons
   * Broken weapons are treated as unarmed
   */
  getHighestCombatBonusWeapon(): BaseWeapon {
    const mainWeapon = this.getWeaponFromSlot(this.slots.mainHand);
    const offHandWeapon = this.getWeaponFromSlot(this.slots.offHand);
    const bestNaturalWeapon = this.getBestNaturalWeapon();

    // Calculate combat bonuses for each weapon (broken weapons use unarmed bonus)
    const mainBonus = mainWeapon && !mainWeapon.isBroken() ? mainWeapon.attacks.find(attack => attack.type === "melee")?.toHitModifier ?? -Infinity : -Infinity;
    const offHandBonus = offHandWeapon && !offHandWeapon.isBroken() ? offHandWeapon.attacks.find(attack => attack.type === "melee")?.toHitModifier ?? -Infinity : -Infinity;
    const naturalBonus = bestNaturalWeapon ? bestNaturalWeapon.attacks.find(attack => attack.type === "melee")?.toHitModifier ?? -Infinity : -Infinity;
    const unarmedBonus = this.unarmedWeapon.attacks.find(attack => attack.type === "melee")?.toHitModifier ?? -1;

    // Find the weapon with the highest bonus
    if (mainBonus >= offHandBonus && mainBonus >= naturalBonus && mainBonus >= unarmedBonus) {
      return mainWeapon!;
    } else if (offHandBonus >= naturalBonus && offHandBonus >= unarmedBonus) {
      return offHandWeapon!;
    } else if (naturalBonus >= unarmedBonus) {
      return bestNaturalWeapon!;
    } else {
      return this.unarmedWeapon;
    }
  }

  /**
   * Get the equipped armor
   */
  getArmor(): Armor | undefined {
    return this.slots.armor;
  }

  /**
   * Get the equipped shield
   */
  getShield(): Shield | undefined {
    if (this.slots.offHand instanceof Shield && !this.slots.offHand.isBroken()) {
      return this.slots.offHand;
    }
    return undefined;
  }

  // --- Combat Calculations (Delegated to CombatCalculator) ---

  /**
   * Get effective armor value (equipped armor or natural armor)
   */
  getEffectiveArmor(naturalArmor: number, ignoresArmor: boolean = false): number {
    return CombatCalculator.getEffectiveArmor(naturalArmor, this.slots.armor, ignoresArmor);
  }

  /**
   * Get shield block value
   */
  getShieldBlockValue(isBackAttack: boolean = false): number {
    return CombatCalculator.getShieldBlockValue(this.getShield(), isBackAttack);
  }

  // --- Utility Methods ---

  /**
   * Get equipment summary for debugging
   */
  getSummary(): string {
    const parts: string[] = [];

    if (this.slots.mainHand) {
      parts.push(`Main: ${this.slots.mainHand.name}`);
    }
    if (this.slots.offHand) {
      parts.push(`Off: ${this.slots.offHand.name}`);
    }
    if (this.slots.armor) {
      parts.push(`Armor: ${this.slots.armor.name}`);
    }

    return parts.length > 0 ? parts.join(', ') : 'No equipment';
  }
}
