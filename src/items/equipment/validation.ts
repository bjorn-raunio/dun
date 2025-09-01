import { ICreature } from '../../creatures/index';
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

// --- Equipment Action Validation ---

export interface EquipmentActionValidation extends EquipmentValidation {
  requiresAction: boolean;
  requiresQuickAction: boolean;
  preventsMovement: boolean;
}

// --- Equipment Validator ---

export class EquipmentValidator {
  /**
   * Validate if an item can be equipped to a specific slot
   */
  static validateEquip(item: Item, slot: EquipmentSlot, creature?: ICreature): EquipmentValidation {
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

  /**
   * Validate if an equipment action is allowed based on game rules
   */
  static validateEquipmentAction(
    action: 'equip' | 'unequip',
    item: Item,
    slot: EquipmentSlot,
    creature: ICreature
  ): EquipmentActionValidation {
    // Check if this is a weapon/shield action
    const isWeaponOrShieldAction = (slot === 'mainHand' || slot === 'offHand') &&
      (item instanceof Weapon || item instanceof RangedWeapon || item instanceof Shield);

    // Check if this is an armor action
    const isArmorAction = slot === 'armor' && item instanceof Armor;

    // Check combat state for armor actions
    if (isArmorAction && creature.getCombatState()) {
      return {
        isValid: false,
        reason: `Cannot ${action} armor while in combat`,
        slot,
        requiresAction: false,
        requiresQuickAction: false,
        preventsMovement: false
      };
    }

    // For weapon/shield actions, check if we have any actions available
    if (isWeaponOrShieldAction) {
      if (!creature.canUseQuickAction()) {
        return {
          isValid: false,
          reason: `No actions available to ${action} ${item.name}`,
          slot,
          requiresAction: true,
          requiresQuickAction: true,
          preventsMovement: false
        };
      } else {
        return {
          isValid: true,
          requiresAction: false,
          requiresQuickAction: true,
          preventsMovement: false
        };
      }
    }

    // For armor actions, check if we have regular actions available and haven't moved yet
    if (isArmorAction) {
      const hasAction = creature.remainingActions > 0;
      const hasFullMovement = creature.remainingMovement === creature.movement;

      if (!hasAction) {
        return {
          isValid: false,
          reason: `No actions available to ${action} ${item.name}`,
          slot,
          requiresAction: true,
          requiresQuickAction: false,
          preventsMovement: true
        };
      }

      if (!hasFullMovement) {
        return {
          isValid: false,
          reason: `Cannot ${action} armor after moving`,
          slot,
          requiresAction: true,
          requiresQuickAction: false,
          preventsMovement: true
        };
      }

      return {
        isValid: true,
        requiresAction: true,
        requiresQuickAction: false,
        preventsMovement: true
      };
    }

    // Default case - no special requirements
    return {
      isValid: true,
      requiresAction: false,
      requiresQuickAction: false,
      preventsMovement: false
    };
  }

  /**
   * Validate if an unequip action is allowed based on game rules
   */
  static validateUnequipAction(
    slot: EquipmentSlot,
    creature: ICreature
  ): EquipmentActionValidation {
    const item = creature.equipment[slot];
    if (!item) {
      return {
        isValid: false,
        reason: 'No item to unequip',
        slot,
        requiresAction: false,
        requiresQuickAction: false,
        preventsMovement: false
      };
    }

    return this.validateEquipmentAction('unequip', item, slot, creature);
  }

  /**
   * Check if an item can be equipped to a slot (basic compatibility)
   */
  static canEquipToSlot(item: Item, slot: EquipmentSlot): boolean {
    return this.validateEquip(item, slot).isValid;
  }

  /**
   * Check if an equipment action is allowed (includes game rules)
   */
  static canPerformEquipmentAction(
    action: 'equip' | 'unequip',
    item: Item,
    slot: EquipmentSlot,
    creature: ICreature
  ): boolean {
    return this.validateEquipmentAction(action, item, slot, creature).isValid;
  }

  /**
   * Check if an unequip action is allowed (includes game rules)
   */
  static canPerformUnequipAction(slot: EquipmentSlot, creature: ICreature): boolean {
    return this.validateUnequipAction(slot, creature).isValid;
  }

  /**
   * Generate a user-friendly tooltip message for equipment actions
   */
  static getTooltipMessage(
    action: 'equip' | 'unequip',
    item: Item,
    slot: EquipmentSlot,
    creature: ICreature
  ): string {
    const validation = this.validateEquipmentAction(action, item, slot, creature);

    if (!validation.isValid) {
      return validation.reason || `Cannot ${action} ${item.name}`;
    }

    // Generate action cost description
    let actionCost = '';
    if (validation.requiresQuickAction) {
      actionCost = 'uses quick action or regular action';
    } else if (validation.requiresAction) {
      actionCost = 'uses action';
    }

    // Generate movement restriction description
    let movementRestriction = '';
    if (validation.preventsMovement) {
      movementRestriction = ', prevents movement';
    }

    return `${action.charAt(0).toUpperCase() + action.slice(1)} ${item.name} (${actionCost}${movementRestriction})`;
  }

  /**
   * Generate a user-friendly tooltip message for unequip actions
   */
  static getUnequipTooltipMessage(slot: EquipmentSlot, creature: ICreature): string {
    const validation = this.validateUnequipAction(slot, creature);

    if (!validation.isValid) {
      return validation.reason || `Cannot unequip item`;
    }

    const item = creature.equipment[slot];
    if (!item) {
      return 'No item to unequip';
    }

    return this.getTooltipMessage('unequip', item, slot, creature);
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
