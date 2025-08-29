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

// --- Unified Equipment System ---

export class EquipmentSystem {
  private slots: EquipmentSlots = {};

  constructor(initialEquipment?: Partial<EquipmentSlots>) {
    if (initialEquipment) {
      this.slots = { ...initialEquipment };
    }
  }

  // --- Private helper methods ---

  /**
   * Get the off-hand item (private method for internal use)
   */
  private getOffHandItem(): Weapon | RangedWeapon | Shield | undefined {
    return this.slots.offHand;
  }

  /**
   * Get the main hand item (private method for internal use)
   */
  private getMainHandItem(): Weapon | RangedWeapon | undefined {
    return this.slots.mainHand;
  }

  /**
   * Get the armor item (private method for internal use)
   */
  private getArmorItem(): Armor | undefined {
    return this.slots.armor;
  }

  // --- Equipment Management ---

  /**
   * Equip an item to a specific slot
   */
  equip(item: Item, slot: EquipmentSlot): EquipmentValidation {
    const validation = this.validateEquip(item, slot);
    if (!validation.isValid) {
      return validation;
    }

    this.slots[slot] = item as any;
    return { isValid: true };
  }

  /**
   * Unequip an item from a specific slot
   */
  unequip(slot: EquipmentSlot): Item | undefined {
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

  // --- Equipment Validation ---

  /**
   * Validate if an item can be equipped to a specific slot
   */
  validateEquip(item: Item, slot: EquipmentSlot): EquipmentValidation {
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

  /**
   * Check if equipment is valid (no conflicts)
   */
  validateEquipment(): EquipmentValidation {
    const mainHand = this.slots.mainHand;
    const offHand = this.slots.offHand;

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
    return this.getOffHandItem() instanceof Shield;
  }

  /**
   * Check if creature has armor equipped
   */
  hasArmor(): boolean {
    return this.getArmorItem() instanceof Armor;
  }

  /**
   * Check if creature has a melee weapon equipped
   */
  hasMeleeWeapon(): boolean {
    return this.getMainHandItem() instanceof Weapon || 
           this.getOffHandItem() instanceof Weapon ||
           (!this.getMainHandItem() && !this.getOffHandItem()); // Unarmed
  }

  /**
   * Get the main weapon (prioritizes main hand, then off hand)
   */
  getMainWeapon(): Weapon | RangedWeapon | undefined {
    const mainHand = this.getMainHandItem();
    if (mainHand instanceof Weapon || mainHand instanceof RangedWeapon) {
      return mainHand;
    }
    const offHand = this.getOffHandItem();
    if (offHand instanceof Weapon || offHand instanceof RangedWeapon) {
      return offHand;
    }
    return undefined;
  }

  /**
   * Get the equipped armor
   */
  getArmor(): Armor | undefined {
    return this.getArmorItem();
  }

  /**
   * Get the equipped shield
   */
  getShield(): Shield | undefined {
    const offHand = this.getOffHandItem();
    return offHand instanceof Shield ? offHand : undefined;
  }

  // --- Combat Calculations ---

  /**
   * Get effective armor value (equipped armor or natural armor)
   */
  getEffectiveArmor(naturalArmor: number = GAME_SETTINGS.DEFAULT_NATURAL_ARMOR): number {
    return this.getArmorItem()?.armor ?? naturalArmor;
  }

  /**
   * Get weapon damage value
   */
  getWeaponDamage(): number {
    const weapon = this.getMainWeapon();
    
    // Handle unarmed creatures (no weapon equipped)
    if (!weapon) {
      const unarmedWeapon = createWeapon('unarmed');
      return unarmedWeapon.damage ?? 0;
    }
    
    return weapon.damage ?? 0;
  }

  /**
   * Get weapon range information
   */
  getWeaponRange(rangeType: 'normal' | 'long' | 'info' = 'normal'): number | { rangeTiles: number; isRanged: boolean } {
    const main = this.getMainHandItem();
    const offHand = this.getOffHandItem();
    
    let rangeTiles = 1;
    let isRanged = false;
    
    if (main instanceof Weapon) {
      rangeTiles = Math.max(1, main.reach ?? 1);
    } else if (main instanceof RangedWeapon) {
      isRanged = true;
      rangeTiles = Math.max(1, rangeType === 'long' ? main.range.long : main.range.normal);
    } else if (offHand instanceof RangedWeapon) {
      isRanged = true;
      rangeTiles = Math.max(1, rangeType === 'long' ? offHand.range.long : offHand.range.normal);
    }
    
    if (rangeType === 'info') {
      return { rangeTiles, isRanged };
    }
    
    return rangeTiles;
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
    const weapon = this.getMainWeapon();
    const baseBonus = this.hasRangedWeapon() ? rangedBonus : combatBonus;
    
    // Handle unarmed creatures (no weapon equipped)
    if (!weapon) {
      const unarmedWeapon = createWeapon('unarmed');
      return baseBonus + (unarmedWeapon.combatModifier ?? 0);
    }
    
    const weaponModifier = weapon instanceof Weapon ? (weapon.combatModifier ?? 0) : 0;
    return baseBonus + weaponModifier;
  }

  /**
   * Get armor modifier from weapon
   */
  getWeaponArmorModifier(): number {
    const weapon = this.getMainWeapon();
    
    // Handle unarmed creatures (no weapon equipped)
    if (!weapon) {
      const unarmedWeapon = createWeapon('unarmed');
      return unarmedWeapon.armorModifier ?? 0;
    }
    
    return weapon.armorModifier ?? 0;
  }

  /**
   * Get shield block value
   */
  getShieldBlockValue(isBackAttack: boolean = false): number {
    // Shields don't have block value during back attacks
    if (isBackAttack) {
      return 0;
    }
    const shield = this.getShield();
    return shield ? shield.block : 0;
  }

  // --- Utility Methods ---

  /**
   * Check if an item is equippable
   */
  static isItemEquippable(item: any): boolean {
    return item instanceof Weapon || 
           item instanceof RangedWeapon || 
           item instanceof Armor || 
           item instanceof Shield;
  }

  /**
   * Check if an item is a valid weapon
   */
  static isValidWeapon(item: any): boolean {
    return item instanceof Weapon || item instanceof RangedWeapon;
  }

  /**
   * Check if an item is a valid off-hand item
   */
  static isValidOffHand(item: any): boolean {
    return item instanceof Weapon || item instanceof RangedWeapon || item instanceof Shield;
  }

  /**
   * Check if an item is valid armor
   */
  static isValidArmor(item: any): boolean {
    return item instanceof Armor;
  }

  /**
   * Get equipment summary for debugging
   */
  getSummary(): string {
    const parts: string[] = [];
    
    const mainHand = this.getMainHandItem();
    const offHand = this.getOffHandItem();
    const armor = this.getArmorItem();
    
    if (mainHand) {
      parts.push(`Main: ${mainHand.name}`);
    }
    if (offHand) {
      parts.push(`Off: ${offHand.name}`);
    }
    if (armor) {
      parts.push(`Armor: ${armor.name}`);
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
    const validation = this.equipment.equip(item, slot);
    if (validation.isValid) {
      creature.equipment[slot] = item as any;
    }
    return validation;
  }

  /**
   * Unequip an item from a creature
   */
  unequip(creature: Creature, slot: EquipmentSlot): Item | undefined {
    const item = this.equipment.unequip(slot);
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
