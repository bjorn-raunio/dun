import { Creature } from '../creatures/index';
import { Weapon, RangedWeapon, Armor, Shield, Item } from './types';
import { GAME_SETTINGS } from '../utils/constants';
import { createWeapon } from './factories';

// --- Equipment Slot Types ---

export type EquipmentSlot = 'mainHand' | 'offHand' | 'armor';

export interface EquipmentSlots {
  mainHand?: Weapon | RangedWeapon;
  offHand?: Weapon | RangedWeapon | Shield;
  armor?: Armor;
}

// --- Equipment Validation ---

export interface EquipmentValidation {
  isValid: boolean;
  reason?: string;
  slot?: EquipmentSlot;
}

// --- Equipment Validator ---

export class EquipmentValidator {
  /**
   * Validate if an item can be equipped to a specific slot
   */
  static validateEquip(item: Item, slot: EquipmentSlot, creature?: Creature): EquipmentValidation {
    // Check if creature is in combat and trying to equip armor
    if (creature && slot === 'armor' && creature.getCombatState()) {
      return { isValid: false, reason: 'Cannot equip armor while in combat', slot };
    }

    // Check if the item type is valid for the slot
    const slotValidation = this.validateSlotCompatibility(item, slot);
    if (!slotValidation.isValid) {
      return slotValidation;
    }

    return { isValid: true };
  }

  /**
   * Validate if equipment configuration is valid (no conflicts)
   */
  static validateEquipment(slots: EquipmentSlots): EquipmentValidation {
    const { mainHand, offHand } = slots;

    // Check for two-handed weapon conflicts
    if (mainHand && mainHand.hands === 2 && offHand) {
      return { 
        isValid: false, 
        reason: 'Cannot equip off-hand item with two-handed weapon',
        slot: 'offHand'
      };
    }

    if (offHand && (offHand instanceof Weapon || offHand instanceof RangedWeapon) && offHand.hands === 2 && mainHand) {
      return { 
        isValid: false, 
        reason: 'Cannot equip main-hand item with two-handed weapon',
        slot: 'mainHand'
      };
    }

    return { isValid: true };
  }

  private static validateSlotCompatibility(item: Item, slot: EquipmentSlot): EquipmentValidation {
    switch (slot) {
      case 'mainHand':
        if (!(item instanceof Weapon || item instanceof RangedWeapon)) {
          return { isValid: false, reason: 'Main hand can only equip weapons', slot };
        }
        break;

      case 'offHand':
        if (!(item instanceof Weapon || item instanceof RangedWeapon || item instanceof Shield)) {
          return { isValid: false, reason: 'Off hand can only equip weapons or shields', slot };
        }
        // Two-handed weapons can only be equipped to main hand
        if ((item instanceof Weapon || item instanceof RangedWeapon) && item.hands === 2) {
          return { isValid: false, reason: 'Two-handed weapons can only be equipped to main hand', slot };
        }
        break;

      case 'armor':
        if (!(item instanceof Armor)) {
          return { isValid: false, reason: 'Armor slot can only equip armor', slot };
        }
        break;

      default:
        return { isValid: false, reason: 'Invalid equipment slot', slot };
    }

    return { isValid: true };
  }

  // --- Static Utility Methods ---

  static isItemEquippable(item: any): boolean {
    return item instanceof Weapon || 
           item instanceof RangedWeapon || 
           item instanceof Armor || 
           item instanceof Shield;
  }

  static isValidWeapon(item: any): boolean {
    return item instanceof Weapon || item instanceof RangedWeapon;
  }

  static isValidOffHand(item: any): boolean {
    return item instanceof Weapon || item instanceof RangedWeapon || item instanceof Shield;
  }

  static isValidArmor(item: any): boolean {
    return item instanceof Armor;
  }
}

// --- Combat Calculator ---

export class CombatCalculator {
  /**
   * Get effective armor value (equipped armor or natural armor)
   */
  static getEffectiveArmor(armor?: Armor, naturalArmor: number = GAME_SETTINGS.DEFAULT_NATURAL_ARMOR): number {
    return armor?.armor ?? naturalArmor;
  }

  /**
   * Get weapon damage value
   */
  static getWeaponDamage(weapon: Weapon | RangedWeapon): number {
    return weapon.damage ?? 0;
  }

  /**
   * Get weapon range information
   */
  static getWeaponRange(
    mainHand?: Weapon | RangedWeapon, 
    offHand?: Weapon | RangedWeapon | Shield,
    rangeType: 'normal' | 'long' | 'info' = 'normal'
  ): number | { rangeTiles: number; isRanged: boolean } {
    let rangeTiles = 1;
    let isRanged = false;
    
    if (mainHand instanceof Weapon) {
      rangeTiles = Math.max(1, mainHand.reach ?? 1);
    } else if (mainHand instanceof RangedWeapon) {
      isRanged = true;
      rangeTiles = Math.max(1, mainHand.range);
    } else if (offHand instanceof RangedWeapon) {
      isRanged = true;
      rangeTiles = Math.max(1, offHand.range);
    }
    
    if (rangeType === 'info') {
      return { rangeTiles, isRanged };
    }
    
    return rangeTiles;
  }

  /**
   * Get attack bonus based on weapon type and modifiers
   */
  static getAttackBonus(
    weapon: Weapon | RangedWeapon,
    combatBonus: number, 
    rangedBonus: number
  ): number {
    // Determine base bonus by weapon type
    const baseBonus = weapon instanceof RangedWeapon ? rangedBonus : combatBonus;
    const weaponModifier = weapon instanceof Weapon ? (weapon.combatModifier ?? 0) : 0;
    return baseBonus + weaponModifier;
  }

  /**
   * Get armor modifier from weapon
   */
  static getWeaponArmorModifier(weapon: Weapon | RangedWeapon): number {
    return weapon.armorModifier ?? 0;
  }

  /**
   * Get shield block value
   */
  static getShieldBlockValue(shield?: Shield, isBackAttack: boolean = false): number {
    // Shields don't have block value during back attacks
    if (isBackAttack || !shield) {
      return 0;
    }
    return shield.block;
  }
}

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
  equip(item: Item, slot: EquipmentSlot, creature?: Creature): EquipmentValidation {
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
  unequip(slot: EquipmentSlot, creature?: Creature): Item | undefined {
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
  getEffectiveArmor(naturalArmor: number = GAME_SETTINGS.DEFAULT_NATURAL_ARMOR): number {
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

// --- Equipment Manager for Creatures ---

export class EquipmentManager {
  private equipment: EquipmentSystem;

  constructor(creature: Creature) {
    this.equipment = new EquipmentSystem(creature.equipment);
  }

  /**
   * Equip an item to a creature
   */
  equip(creature: Creature, item: Item, slot: EquipmentSlot): EquipmentValidation {
    const validation = this.equipment.equip(item, slot, creature);
    if (validation.isValid) {
      creature.equipment[slot] = item as any;
    }
    return validation;
  }

  /**
   * Unequip an item from a creature
   */
  unequip(creature: Creature, slot: EquipmentSlot): Item | undefined {
    const item = this.equipment.unequip(slot, creature);
    if (item) {
      delete creature.equipment[slot];
    }
    return item;
  }

  /**
   * Get equipment system for a creature
   */
  getEquipment(): EquipmentSystem {
    return this.equipment;
  }

  /**
   * Update equipment from creature's current equipment
   */
  updateFromCreature(creature: Creature): void {
    this.equipment = new EquipmentSystem(creature.equipment);
  }
}
