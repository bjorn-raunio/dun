import { Mercenary, CreatureGroup, CreaturePositionOrUndefined } from '../index';
import { createWeapon, createRangedWeapon, createArmor, createShield, createConsumable, createMiscellaneous, createNaturalWeapon } from '../../items';
import { mercenaryPresets } from './presets';
import { MercenaryPreset } from '../presets/types';
import { EquipmentSystem, EquipmentSlots } from '../../items/equipment';
import { Item } from '../../items';

// --- Factory Functions ---

/**
 * Create inventory items from preset definitions
 */
function createInventoryFromPreset(preset: MercenaryPreset): Item[] {
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
 * Create natural weapons from preset definitions
 */
function createNaturalWeaponsFromPreset(preset: MercenaryPreset): import('../../items').NaturalWeapon[] {
  const naturalWeapons: import('../../items').NaturalWeapon[] = [];
  if (preset.naturalWeapons) {
    for (const weaponId of preset.naturalWeapons) {
      try {
        naturalWeapons.push(createNaturalWeapon(weaponId));
      } catch (error) {
        console.warn(`Failed to create natural weapon "${weaponId}":`, error);
      }
    }
  }
  return naturalWeapons;
}

/**
 * Create equipment from preset definitions
 */
function createEquipmentFromPreset(preset: MercenaryPreset): EquipmentSlots {
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
 * Create a mercenary from a preset
 */
export function createMercenary(
  presetId: string, 
  overrides?: Partial<Mercenary> & { id?: string; position?: CreaturePositionOrUndefined }
): Mercenary {
  const p = mercenaryPresets[presetId];
  if (!p) {
    throw new Error(`Mercenary preset "${presetId}" not found`);
  }

  const inventory = createInventoryFromPreset(p);
  const equipment = createEquipmentFromPreset(p);
  const naturalWeapons = createNaturalWeaponsFromPreset(p);

  const attributes = {
    movement: overrides?.movement ?? p.attributes.movement,
    combat: overrides?.combat ?? p.attributes.combat,
    ranged: overrides?.ranged ?? p.attributes.ranged,
    strength: overrides?.strength ?? p.attributes.strength,
    agility: overrides?.agility ?? p.attributes.agility,
    courage: overrides?.courage ?? p.attributes.courage,
    intelligence: overrides?.intelligence ?? p.attributes.intelligence,
  };

  return new Mercenary({
    name: overrides?.name ?? p.name,
    position: overrides?.position ?? { x: 0, y: 0, facing: 0 },
    image: overrides?.image ?? p.image,
    attributes,
    actions: overrides?.actions ?? p.actions ?? 1,
    mapWidth: overrides?.mapWidth ?? p.mapWidth ?? 1,
    mapHeight: overrides?.mapHeight ?? p.mapHeight ?? 1,
    inventory: overrides?.inventory ?? inventory,
    equipment: overrides?.equipment ?? equipment,
    vitality: overrides?.vitality ?? p.vitality,
    mana: overrides?.mana ?? p.mana ?? 0,
    fortune: overrides?.fortune ?? p.fortune ?? 0,
    naturalArmor: overrides?.naturalArmor ?? p.naturalArmor,
    group: overrides?.group ?? CreatureGroup.PLAYER,
    skills: overrides?.skills ?? p.skills,
    naturalWeapons: (overrides as any)?.naturalWeapons ?? naturalWeapons,
    // Mercenary-specific properties
    hireCost: overrides?.hireCost ?? p.hireCost,
  });
}
