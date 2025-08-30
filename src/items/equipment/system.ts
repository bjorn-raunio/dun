import { Weapon, RangedWeapon, Armor, Shield, Item } from '../types';
import { createWeapon } from '../factories';
import { EquipmentSlot, EquipmentSlots, EquipmentValidation } from './validation';
import { CombatCalculator } from './combat';

// --- Equipment System ---

export class EquipmentSystem {
  private slots: EquipmentSlots = {};
  private unarmedWeapon: Weapon;

  constructor(initialEquipment?: Partial<EquipmentSlots>) {
    if (initialEquipment) {
      this.slots = { ...initialEquipment };
    }
    // Every creature gets a default unarmed weapon
    this.unarmedWeapon = createWeapon('unarmed');
  }

  // --- Equipment Management ---

  /**
   * Equip an item to a specific slot
   */
  equip(item: Item, slot: EquipmentSlot, creature?: any): EquipmentValidation {
    // Import validation dynamically to avoid circular dependencies
    const { EquipmentValidator } = require('./validation');
    const validation = EquipmentValidator.validateEquip(item, slot, creature);
    if (!validation.isValid) {
      return validation;
    }

    this.slots[slot] = item as any;
    return { isValid: true };
  }

  /**
   * Unequip an item from a specific slot
   */
  unequip(slot: EquipmentSlot, creature?: any): Item | undefined {
    // Check if creature is in combat and trying to unequip armor
    if (creature && slot === 'armor' && creature.getCombatState()) {
      return undefined; // Cannot unequip armor while in combat
    }

    const item = this.slots[slot];
    if (item) {
      delete this.slots[slot];
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
    this.slots = {};
  }

  /**
   * Check if equipment is valid (no conflicts)
   */
  validateEquipment(): EquipmentValidation {
    // Import validation dynamically to avoid circular dependencies
    const { EquipmentValidator } = require('./validation');
    return EquipmentValidator.validateEquipment(this.slots);
  }

  // --- Equipment Queries ---

  /**
   * Check if creature has a ranged weapon equipped
   */
  hasRangedWeapon(): boolean {
    return this.slots.mainHand instanceof RangedWeapon || 
           this.slots.offHand instanceof RangedWeapon;
  }

  /**
   * Check if creature has a shield equipped
   */
  hasShield(isBackAttack: boolean = false): boolean {
    // Shields don't count during back attacks
    if (isBackAttack) {
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
    return this.slots.mainHand instanceof Weapon || 
           this.slots.offHand instanceof Weapon ||
           (this.slots.mainHand === undefined && this.slots.offHand === undefined); // Unarmed
  }

  /**
   * Check if creature is unarmed (no weapons equipped)
   */
  isUnarmed(): boolean {
    return this.slots.mainHand === undefined && this.slots.offHand === undefined;
  }

  /**
   * Get the main weapon (prioritizes main hand, then off hand)
   * Returns unarmed weapon if no weapon is equipped
   */
  getMainWeapon(): Weapon | RangedWeapon {
    if (this.slots.mainHand instanceof Weapon || this.slots.mainHand instanceof RangedWeapon) {
      return this.slots.mainHand;
    }
    if (this.slots.offHand instanceof Weapon || this.slots.offHand instanceof RangedWeapon) {
      return this.slots.offHand;
    }
    // Return unarmed weapon if no weapon is equipped
    return this.unarmedWeapon;
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
    return this.slots.offHand instanceof Shield ? this.slots.offHand : undefined;
  }

  // --- Combat Calculations (Delegated to CombatCalculator) ---

  /**
   * Get effective armor value (equipped armor or natural armor)
   */
  getEffectiveArmor(naturalArmor: number = 0): number {
    return CombatCalculator.getEffectiveArmor(this.slots.armor, naturalArmor);
  }

  /**
   * Get weapon damage value
   */
  getWeaponDamage(): number {
    return CombatCalculator.getWeaponDamage(this.getMainWeapon());
  }

  /**
   * Get weapon range information
   */
  getWeaponRange(rangeType: 'normal' | 'long' | 'info' = 'normal'): number | { rangeTiles: number; isRanged: boolean } {
    return CombatCalculator.getWeaponRange(this.slots.mainHand, this.slots.offHand, rangeType);
  }

  /**
   * Get attack range (normal range)
   */
  getAttackRange(): number {
    return this.getWeaponRange('normal') as number;
  }

  /**
   * Get maximum attack range (long range for ranged weapons, normal range for melee)
   */
  getMaxAttackRange(): number {
    return this.getWeaponRange('long') as number;
  }

  /**
   * Get attack bonus based on weapon type and modifiers
   */
  getAttackBonus(combatBonus: number, rangedBonus: number): number {
    return CombatCalculator.getAttackBonus(this.getMainWeapon(), combatBonus, rangedBonus);
  }

  /**
   * Get armor modifier from weapon
   */
  getWeaponArmorModifier(): number {
    return CombatCalculator.getWeaponArmorModifier(this.getMainWeapon());
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
