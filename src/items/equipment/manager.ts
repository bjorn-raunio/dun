import { Creature } from '../../creatures/index';
import { EquipmentSystem } from './system';
import { EquipmentSlot, EquipmentValidation } from './validation';
import { Item } from '../types';
import { Weapon, RangedWeapon, Shield, Armor } from '../types';

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
      // Type assertion to ensure the item is compatible with the slot
      if (slot === 'mainHand' && (item instanceof Weapon || item instanceof RangedWeapon)) {
        creature.equipment[slot] = item;
      } else if (slot === 'offHand' && (item instanceof Weapon || item instanceof RangedWeapon || item instanceof Shield)) {
        creature.equipment[slot] = item;
      } else if (slot === 'armor' && item instanceof Armor) {
        creature.equipment[slot] = item;
      }
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
