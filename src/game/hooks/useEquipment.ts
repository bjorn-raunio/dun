import { useCallback } from 'react';
import { Creature } from '../../creatures/index';
import { EquipmentManager, EquipmentValidator } from '../../items/equipment';
import { Item, Weapon, RangedWeapon, Armor, Shield } from '../../items/types';
import { EquipmentSlot } from '../../items/equipment';

export function useEquipment(creature: Creature, onUpdate?: (creature: Creature) => void) {
  const handleEquip = useCallback((item: Item, slot: EquipmentSlot) => {
    // Prevent equipment changes for AI-controlled creatures
    if (creature.isAIControlled()) {
      alert(`Cannot equip ${item.name}: Equipment cannot be changed for AI-controlled creatures`);
      return;
    }

    // Check if this is a weapon/shield switch (equipping a weapon or shield to mainHand or offHand)
    const isWeaponOrShieldSwitch = (slot === 'mainHand' || slot === 'offHand') &&
      (item instanceof Weapon || item instanceof RangedWeapon || item instanceof Shield);

    // Check if this is an armor equip
    const isArmorEquip = slot === 'armor' && item instanceof Armor;

    // Check combat state for armor equips
    if (isArmorEquip && creature.getCombatState()) {
      alert(`Cannot equip ${item.name}: Cannot equip armor while in combat`);
      return;
    }

    // If it's a weapon/shield switch, check if we have any actions available (quick or regular)
    if (isWeaponOrShieldSwitch && creature.remainingQuickActions <= 0 && creature.remainingActions <= 0) {
      return; // Silently fail - button should be disabled
    }

    // If it's an armor equip, check if we have any actions available and haven't moved yet
    if (isArmorEquip && (creature.remainingActions <= 0 || creature.remainingMovement < creature.movement)) {
      return; // Silently fail - button should be disabled
    }

    const equipmentManager = new EquipmentManager(creature);

    // First, unequip any existing item in the slot and add it to inventory
    const existingItem = creature.equipment[slot];
    if (existingItem) {
      equipmentManager.unequip(creature, slot);
      creature.inventory.push(existingItem);
    }

    // If equipping a two-handed weapon to main hand, unequip both hands
    if (slot === 'mainHand' &&
      ((item instanceof Weapon && item.hands === 2) ||
        (item instanceof RangedWeapon && item.hands === 2))) {
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
      if (mainHandItem &&
        ((mainHandItem instanceof Weapon && mainHandItem.hands === 2) ||
          (mainHandItem instanceof RangedWeapon && mainHandItem.hands === 2))) {
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

      // Consume an action if this was a weapon/shield switch
      if (isWeaponOrShieldSwitch) {
        if (creature.remainingQuickActions > 0) {
          creature.useQuickAction();
        } else {
          creature.useAction();
        }
      }

      // Consume an action and prevent movement if this was an armor equip
      if (isArmorEquip) {
        creature.useAction();
        creature.setRemainingMovement(0); // Prevent movement in the same turn
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
      const item = creature.equipment[slot];
      alert(`Cannot unequip ${item ? item.name : 'item'}: Equipment cannot be changed for AI-controlled creatures`);
      return;
    }

    // Check if this is unequipping a weapon or shield from mainHand or offHand
    const item = creature.equipment[slot];
    const isWeaponOrShieldUnequip = item && (slot === 'mainHand' || slot === 'offHand') &&
      (item instanceof Weapon || item instanceof RangedWeapon || item instanceof Shield);

    // Check if this is an armor unequip
    const isArmorUnequip = item && slot === 'armor' && item instanceof Armor;

    // Check combat state for armor unequips
    if (isArmorUnequip && creature.getCombatState()) {
      alert(`Cannot unequip ${item.name}: Cannot unequip armor while in combat`);
      return;
    }

    // If it's a weapon/shield unequip, check if we have any actions available (quick or regular)
    if (isWeaponOrShieldUnequip && creature.remainingQuickActions <= 0 && creature.remainingActions <= 0) {
      return; // Silently fail - button should be disabled
    }

    // If it's an armor unequip, check if we have any actions available and haven't moved yet
    if (isArmorUnequip && (creature.remainingActions <= 0 || creature.remainingMovement < creature.movement)) {
      return; // Silently fail - button should be disabled
    }

    const equipmentManager = new EquipmentManager(creature);
    const unequippedItem = equipmentManager.unequip(creature, slot);
    if (unequippedItem) {
      // Add item to inventory
      creature.inventory.push(unequippedItem);

      // Consume an action if this was a weapon/shield unequip
      if (isWeaponOrShieldUnequip) {
        if (creature.remainingQuickActions > 0) {
          creature.useQuickAction();
        } else {
          creature.useAction();
        }
      }

      // Consume an action and prevent movement if this was an armor unequip
      if (isArmorUnequip) {
        creature.useAction();
        creature.setRemainingMovement(0); // Prevent movement in the same turn
      }

      onUpdate?.(creature);
    }
  }, [creature, onUpdate]);

  const canEquipToSlot = useCallback((item: Item, slot: EquipmentSlot): boolean => {
    // Always allow armor to be shown as equippable, but the actual validation will be done in canSwitchWeaponOrShield
    if (slot === 'armor' && item instanceof Armor) {
      return true;
    }

    return EquipmentValidator.validateEquip(item, slot, creature).isValid;
  }, [creature]);

  const canSwitchWeaponOrShield = useCallback((item: Item, slot: EquipmentSlot): boolean => {
    // Check if this is a weapon/shield switch (equipping a weapon or shield to mainHand or offHand)
    const isWeaponOrShieldSwitch = (slot === 'mainHand' || slot === 'offHand') &&
      (item instanceof Weapon || item instanceof RangedWeapon || item instanceof Shield);

    // Check if this is an armor equip
    const isArmorEquip = slot === 'armor' && item instanceof Armor;

    // If it's not a weapon/shield switch or armor equip, allow it (shields, etc.)
    if (!isWeaponOrShieldSwitch && !isArmorEquip) return true;

    // Check combat state for armor equips
    if (isArmorEquip && creature.getCombatState()) {
      return false; // Cannot equip armor while in combat
    }

    // For weapon/shield switches, check if we have any actions available (quick or regular)
    if (isWeaponOrShieldSwitch) {
      return creature.remainingQuickActions > 0 || creature.remainingActions > 0;
    }

    // For armor equips, check if we have regular actions available and haven't moved yet
    if (isArmorEquip) {
      return creature.remainingActions > 0 && creature.remainingMovement === creature.movement;
    }

    return true;
  }, [creature]);

  const canUnequipWeaponOrShield = useCallback((slot: EquipmentSlot): boolean => {
    const item = creature.equipment[slot];
    const isWeaponOrShieldUnequip = item && (slot === 'mainHand' || slot === 'offHand') &&
      (item instanceof Weapon || item instanceof RangedWeapon || item instanceof Shield);

    const isArmorUnequip = item && slot === 'armor' && item instanceof Armor;

    // If it's not a weapon/shield unequip or armor unequip, allow it
    if (!isWeaponOrShieldUnequip && !isArmorUnequip) return true;

    // Check combat state for armor unequips
    if (isArmorUnequip && creature.getCombatState()) {
      return false; // Cannot unequip armor while in combat
    }

    // For weapon/shield unequips, check if we have any actions available (quick or regular)
    if (isWeaponOrShieldUnequip) {
      return creature.remainingQuickActions > 0 || creature.remainingActions > 0;
    }

    // For armor unequips, check if we have regular actions available and haven't moved yet
    if (isArmorUnequip) {
      return creature.remainingActions > 0 && creature.remainingMovement === creature.movement;
    }

    return true;
  }, [creature]);

  return {
    handleEquip,
    handleUnequip,
    canEquipToSlot,
    canSwitchWeaponOrShield,
    canUnequipWeaponOrShield,
  };
}
