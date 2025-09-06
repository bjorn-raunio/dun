import { ICreature } from '../../creatures/index';
import { EquipmentSystem } from './system';
import { EquipmentSlot, EquipmentValidation } from './validation';
import { Item } from '../base';
import { Weapon } from '../meleeWeapons';
import { RangedWeapon } from '../rangedWeapons';
import { Shield } from '../shields';
import { Armor } from '../armor';

// --- Equipment Manager for Creatures ---

export class EquipmentManager {
  private equipment: EquipmentSystem;

  constructor(creature: ICreature) {
    this.equipment = new EquipmentSystem(creature.equipment);
  }

  /**
   * Equip an item to a creature
   */
  equip(creature: ICreature, item: Item, slot: EquipmentSlot): EquipmentValidation {
    const validation = this.equipment.equip(item, slot, creature);
    if (validation.isValid) {  
      const movement = creature.movement;    
      // Type assertion to ensure the item is compatible with the slot
      if (slot === 'mainHand' && item.isWeapon()) {
        creature.equipment[slot] = item;
      } else if (slot === 'offHand' && (item.isWeapon() || item instanceof Shield)) {
        creature.equipment[slot] = item;
      } else if (slot === 'armor' && item instanceof Armor) {
        creature.equipment[slot] = item;
      }
      creature.updateRemainingMovement(movement);
      // Invalidate equipment cache when equipment changes
      creature.invalidateEquipmentCache?.();
    }
    return validation;
  }

  /**
   * Unequip an item from a creature
   */
  unequip(creature: ICreature, slot: EquipmentSlot): Item | undefined {
    const item = this.equipment.unequip(slot, creature);
    if (item) {
      const movement = creature.movement;
      delete creature.equipment[slot];
      creature.updateRemainingMovement(movement);
      // Invalidate equipment cache when equipment changes
      creature.invalidateEquipmentCache?.();
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
  updateFromCreature(creature: ICreature): void {
    this.equipment = new EquipmentSystem(creature.equipment);
  }
}
