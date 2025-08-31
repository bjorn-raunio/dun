import { Creature } from '../creatures/index';
import { ValidationResult } from './core';
import { VALIDATION_MESSAGES } from './messages';
import { Item } from '../items/types';

/**
 * Validate that an item is in the creature's inventory
 */
export function validateItemInInventory(creature: Creature, item: Item): ValidationResult {
  const hasItem = creature.inventory.some(invItem => invItem.id === item.id);
  
  if (!hasItem) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.ITEM_NOT_IN_INVENTORY(creature.name, item.name)
    };
  }
  
  return { isValid: true };
}

/**
 * Validate that an item can be equipped
 */
export function validateItemEquippable(item: Item, isItemEquippable: (item: Item) => boolean): ValidationResult {
  if (!isItemEquippable(item)) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.ITEM_NOT_EQUIPPABLE(item.name)
    };
  }
  
  return { isValid: true };
}
