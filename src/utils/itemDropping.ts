import { ICreature } from '../creatures/index';
import { EquipmentManager } from '../items/equipment';
import { Item } from '../items';
import { EquipmentSlot } from '../items/equipment';
import { QuestMap } from '../maps/types';

/**
 * Drop an item from a creature's inventory or equipment to the ground
 * @param creature The creature dropping the item
 * @param mapDefinition The map to drop the item on
 * @param item The item to drop (required for inventory items)
 * @param force Whether to bypass action requirements
 * @param slot Optional equipment slot (if dropping equipped item)
 * @returns True if the item was successfully dropped
 */
export function dropItem(
  creature: ICreature,
  mapDefinition: QuestMap,
  item?: Item,
  force: boolean = false,
  slot?: EquipmentSlot
): boolean {
  // Check if creature has position
  if (creature.x === undefined || creature.y === undefined) {
    return false;
  }

  if (!force) {
    if (!creature.canUseQuickAction()) {
      return false;
    }
    creature.useQuickAction();
  }

  let itemToDrop: Item | undefined;

  if (slot) {
    // Handle dropping equipped item
    const equipmentManager = new EquipmentManager(creature);
    itemToDrop = equipmentManager.unequip(creature, slot);
  } else if (item) {
    // Handle dropping inventory item
    const itemIndex = creature.inventory.findIndex(invItem => invItem.id === item.id);
    if (itemIndex !== -1) {
      itemToDrop = creature.inventory.splice(itemIndex, 1)[0];
    }
  }

  if (itemToDrop) {
    // Add item to the tile the creature is standing on
    mapDefinition.addItemToTile(creature.x, creature.y, itemToDrop);
    return true;
  }

  return false;
}
