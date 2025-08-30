import { Creature } from '../../creatures/index';
import { EquipmentSystem } from './system';
import { EquipmentSlot, EquipmentValidation } from './validation';

// --- Equipment Manager for Creatures ---

export class EquipmentManager {
  private equipment: EquipmentSystem;

  constructor(creature: Creature) {
    this.equipment = new EquipmentSystem(creature.equipment);
  }

  /**
   * Equip an item to a creature
   */
  equip(creature: Creature, item: any, slot: EquipmentSlot): EquipmentValidation {
    const validation = this.equipment.equip(item, slot, creature);
    if (validation.isValid) {
      creature.equipment[slot] = item as any;
    }
    return validation;
  }

  /**
   * Unequip an item from a creature
   */
  unequip(creature: Creature, slot: EquipmentSlot): any | undefined {
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
