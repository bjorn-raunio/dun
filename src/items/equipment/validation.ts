import { Creature } from '../../creatures/index';
import { Weapon, RangedWeapon, Armor, Shield, Item } from '../types';

// --- Equipment Slot Types ---

export type EquipmentSlot = 'mainHand' | 'offHand' | 'armor';

export interface EquipmentSlots {
  mainHand: Weapon | RangedWeapon | undefined;
  offHand: Weapon | RangedWeapon | Shield | undefined;
  armor: Armor | undefined;
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

  static isItemEquippable(item: Item): boolean {
    return item instanceof Weapon || 
           item instanceof RangedWeapon || 
           item instanceof Armor || 
           item instanceof Shield;
  }

  static isValidWeapon(item: Item): boolean {
    return item instanceof Weapon || item instanceof RangedWeapon;
  }

  static isValidOffHand(item: Item): boolean {
    return item instanceof Weapon || item instanceof RangedWeapon || item instanceof Shield;
  }

  static isValidArmor(item: Item): boolean {
    return item instanceof Armor;
  }
}
