import { Hero } from './hero';
import { CreatureGroup, CreaturePositionOrUndefined } from '../index';
import { createWeapon, createRangedWeapon, createArmor, createShield, createConsumable, createMiscellaneous } from '../../items';
import { heroPresets } from './presets';
import { HeroPreset } from '../presets/types';
import { Item } from '../../items';
import { EquipmentSystem, EquipmentSlots } from '../../items/equipment';

// --- Factory Functions ---

/**
 * Create inventory items from hero preset definitions
 */
function createInventoryFromPreset(preset: HeroPreset): Item[] {
  const inventory: Item[] = [];
  if (preset.inventory) {
    for (const itemDef of preset.inventory) {
      switch (itemDef.type) {
        case "weapon":
          inventory.push(createWeapon(itemDef.preset));
          break;
        case "ranged_weapon":
          inventory.push(createRangedWeapon(itemDef.preset));
          break;
        case "armor":
          inventory.push(createArmor(itemDef.preset));
          break;
        case "shield":
          inventory.push(createShield(itemDef.preset));
          break;
        case "consumable":
          inventory.push(createConsumable(itemDef.preset));
          break;
        case "miscellaneous":
          const miscItem = createMiscellaneous(itemDef.preset);
          if (miscItem) {
            inventory.push(miscItem);
          }
          break;
      }
    }
  }
  return inventory;
}

/**
 * Create equipment from hero preset definitions
 */
function createEquipmentFromPreset(preset: HeroPreset): EquipmentSlots {
  const equipment: EquipmentSlots = { mainHand: undefined, offHand: undefined, armor: undefined };
  if (preset.equipment) {
    if (preset.equipment.mainHand) {
      if (preset.equipment.mainHand.type === "weapon") {
        equipment.mainHand = createWeapon(preset.equipment.mainHand.preset);
      } else if (preset.equipment.mainHand.type === "ranged_weapon") {
        equipment.mainHand = createRangedWeapon(preset.equipment.mainHand.preset);
      }
    }
    if (preset.equipment.offHand) {
      if (preset.equipment.offHand.type === "weapon") {
        equipment.offHand = createWeapon(preset.equipment.offHand.preset);
      } else if (preset.equipment.offHand.type === "ranged_weapon") {
        equipment.offHand = createRangedWeapon(preset.equipment.offHand.preset);
      } else if (preset.equipment.offHand.type === "shield") {
        equipment.offHand = createShield(preset.equipment.offHand.preset);
      }
    }
    if (preset.equipment.armor) {
      equipment.armor = createArmor(preset.equipment.armor.preset);
    }
  }
  return equipment;
}

/**
 * Create a hero from a preset
 */
export function createHero(
  presetId: string,
  overrides?: Partial<Hero> & { id?: string; position?: CreaturePositionOrUndefined }
): Hero {
  const p = heroPresets[presetId];
  if (!p) {
    throw new Error(`Hero preset "${presetId}" not found`);
  }

  const inventory = createInventoryFromPreset(p);
  const equipment = createEquipmentFromPreset(p);

  // Validate equipment compatibility using the existing EquipmentSystem
  const equipmentSystem = new EquipmentSystem(equipment);
  const equipmentValidation = equipmentSystem.validateEquipment();
  if (!equipmentValidation.isValid) {
    console.warn(`Equipment validation failed for hero ${presetId}: ${equipmentValidation.reason}`);

    // Move conflicting items to inventory and fix equipment
    if (equipmentValidation.slot) {
      const conflictingItem = equipment[equipmentValidation.slot as keyof EquipmentSlots];
      if (conflictingItem) {
        // Remove the conflicting item from equipment
        equipment[equipmentValidation.slot as keyof EquipmentSlots] = undefined;
        // Add it to inventory
        inventory.push(conflictingItem);
        console.log(`Moved conflicting ${equipmentValidation.slot} item to inventory for hero ${presetId}`);
      }
    }

    // Re-validate after fixing
    const revalidation = equipmentSystem.validateEquipment();
    if (!revalidation.isValid) {
      console.warn(`Equipment still invalid after fixing: ${revalidation.reason}`);
    }
  }

  const attributes = {
    movement: overrides?.movement ?? p.attributes.movement,
    combat: overrides?.combat ?? p.attributes.combat,
    ranged: overrides?.ranged ?? p.attributes.ranged,
    strength: overrides?.strength ?? p.attributes.strength,
    agility: overrides?.agility ?? p.attributes.agility,
    courage: overrides?.courage ?? p.attributes.courage,
    intelligence: overrides?.intelligence ?? p.attributes.intelligence,
  };

  const hero = new Hero({
    name: overrides?.name ?? p.name,
    position: overrides?.position ?? undefined,
    image: overrides?.image ?? p.image,
    attributes,
    actions: overrides?.actions ?? p.actions ?? 1,
    mapWidth: overrides?.mapWidth ?? p.mapWidth ?? 1,
    mapHeight: overrides?.mapHeight ?? p.mapHeight ?? 1,
    size: overrides?.size ?? p.size,
    inventory: overrides?.inventory ?? inventory,
    equipment: overrides?.equipment ?? equipment,
    vitality: overrides?.vitality ?? p.vitality,
    mana: overrides?.mana ?? p.mana ?? 0,
    fortune: overrides?.fortune ?? p.fortune ?? 0,
    naturalArmor: overrides?.naturalArmor ?? p.naturalArmor,
    group: overrides?.group ?? CreatureGroup.PLAYER,
    skills: overrides?.skills ?? p.skills,
  });
  hero.setRemainingMovement(hero.movement);
  hero.setRemainingActions(hero.actions);
  hero.setRemainingQuickActions(hero.quickActions);
  return hero;
}
