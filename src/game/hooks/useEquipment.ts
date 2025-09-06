import { useCallback } from 'react';
import { Creature, ICreature } from '../../creatures/index';
import { EquipmentManager, EquipmentValidator } from '../../items/equipment';
import { Item, Weapon, RangedWeapon, Armor, Shield } from '../../items';
import { EquipmentSlot } from '../../items/equipment';
import { QuestMap } from '../../maps/types';
import { dropItem } from '../../utils/itemDropping';

export function useEquipment(
  creature: ICreature,
  mapDefinition: QuestMap | null,
  onUpdate?: (creature: ICreature) => void
) {

  const handleEquip = useCallback((item: Item, slot: EquipmentSlot) => {
    // Prevent equipment changes for AI-controlled creatures
    if (creature.isAIControlled()) {
      return;
    }

    // Use the existing validator to check if the action is allowed
    const actionValidation = EquipmentValidator.validateEquipmentAction('equip', item, slot, creature);
    if (!actionValidation.isValid) {
      return;
    }

    const equipmentManager = new EquipmentManager(creature);

    // First, unequip any existing item in the slot and add it to inventory
    const existingItem = creature.equipment[slot];
    if (existingItem) {
      equipmentManager.unequip(creature, slot);
      creature.inventory.push(existingItem);
    }

    // If equipping a two-handed weapon to main hand, unequip both hands
    if (slot === 'mainHand' && item.isWeapon() && item.hands === 2) {
      // Unequip off-hand item if it exists
      const offHandItem = creature.equipment.offHand;
      if (offHandItem) {
        equipmentManager.unequip(creature, 'offHand');
        creature.inventory.push(offHandItem);
      }
    }

    // If equipping any item to off-hand, check if there's a two-handed weapon in main hand that needs to be unequipped
    if (slot === 'offHand') {
      const mainHandItem = creature.equipment.mainHand;
      if (mainHandItem && mainHandItem.isWeapon() && mainHandItem.hands === 2) {
        // Unequip the two-handed weapon from main-hand
        equipmentManager.unequip(creature, 'mainHand');
        creature.inventory.push(mainHandItem);
      }
    }

    // Now equip the new item
    const validation = equipmentManager.equip(creature, item, slot);
    if (validation.isValid) {
      // Remove item from inventory
      const itemIndex = creature.inventory.findIndex(invItem => invItem.id === item.id);
      if (itemIndex !== -1) {
        creature.inventory.splice(itemIndex, 1);
      }

      // Consume actions based on validation results
      if (actionValidation.requiresQuickAction) {
        creature.useQuickAction();
      } else if (actionValidation.requiresAction) {
        creature.useAction();
      }

      // Apply movement restrictions if needed
      if (actionValidation.preventsMovement) {
        creature.setRemainingMovement(0);
      }

      onUpdate?.(creature);
    } else {
      // If equipping failed, restore the original item to the slot
      if (existingItem) {
        equipmentManager.equip(creature, existingItem, slot);
        // Remove the original item from inventory since it's back in the slot
        const originalItemIndex = creature.inventory.findIndex(invItem => invItem.id === existingItem.id);
        if (originalItemIndex !== -1) {
          creature.inventory.splice(originalItemIndex, 1);
        }
      }
      alert(`Cannot equip ${item.name}: ${validation.reason}`);
    }
  }, [creature, onUpdate]);

  const handleUnequip = useCallback((slot: EquipmentSlot) => {
    // Prevent equipment changes for AI-controlled creatures
    if (creature.isAIControlled()) {
      return;
    }

    // Use the existing validator to check if the action is allowed
    const actionValidation = EquipmentValidator.validateUnequipAction(slot, creature);
    if (!actionValidation.isValid) {
      alert(`Cannot unequip item: ${actionValidation.reason}`);
      return;
    }

    const equipmentManager = new EquipmentManager(creature);
    const unequippedItem = equipmentManager.unequip(creature, slot);
    if (unequippedItem) {
      // Add item to inventory
      creature.inventory.push(unequippedItem);

      // Consume actions based on validation results
      if (actionValidation.requiresQuickAction) {
        creature.useQuickAction();
      } else if (actionValidation.requiresAction) {
        creature.useAction();
      }

      // Apply movement restrictions if needed
      if (actionValidation.preventsMovement) {
        creature.setRemainingMovement(0);
      }

      onUpdate?.(creature);
    }
  }, [creature, onUpdate]);

  const canEquipToSlot = useCallback((item: Item, slot: EquipmentSlot): boolean => {
    return EquipmentValidator.validateEquip(item, slot, creature).isValid;
  }, [creature]);

  const canSwitchWeaponOrShield = useCallback((item: Item, slot: EquipmentSlot): boolean => {
    return EquipmentValidator.canPerformEquipmentAction('equip', item, slot, creature);
  }, [creature]);

  const canUnequipWeaponOrShield = useCallback((slot: EquipmentSlot): boolean => {
    return EquipmentValidator.canPerformUnequipAction(slot, creature);
  }, [creature]);

  const handleDropItem = useCallback((item: Item, force: boolean = false, slot?: EquipmentSlot) => {
    // Prevent dropping items for AI-controlled creatures
    if (creature.isAIControlled()) {
      return;
    }

    // Check if mapDefinition is available
    if (!mapDefinition) {
      return;
    }

    // Use the utility function to drop the item
    const success = dropItem(creature, mapDefinition, item, force, slot);
    
    if (success) {
      onUpdate?.(creature);
    }
  }, [creature, mapDefinition, onUpdate]);

  return {
    handleEquip,
    handleUnequip,
    handleDropItem,
    canEquipToSlot,
    canSwitchWeaponOrShield,
    canUnequipWeaponOrShield,
  };
}
