import { Monster, Mercenary, CREATURE_GROUPS } from '../index';
import { createWeapon, createRangedWeapon, createArmor, createShield } from '../../items';
import { MONSTER_FACTIONS } from '../monster';
import { monsterPresets } from './monsters';
import { mercenaryPresets } from './mercenaries';
import { MonsterPreset, MercenaryPreset } from './types';

// --- Factory Functions ---

/**
 * Create inventory items from preset definitions
 */
function createInventoryFromPreset(preset: MonsterPreset | MercenaryPreset): any[] {
  const inventory: any[] = [];
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
      }
    }
  }
  return inventory;
}

/**
 * Create equipment from preset definitions
 */
function createEquipmentFromPreset(preset: MonsterPreset | MercenaryPreset): any {
  const equipment: any = {};
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
 * Create a monster from a preset
 */
export function createMonster(
  presetId: string, 
  overrides?: Partial<Monster> & { id?: string; x: number; y: number }
): Monster {
  const p = monsterPresets[presetId];
  if (!p) {
    throw new Error(`Monster preset "${presetId}" not found`);
  }

  const inventory = createInventoryFromPreset(p);
  const equipment = createEquipmentFromPreset(p);

  const attributes = {
    movement: overrides?.movement ?? p.attributes.movement,
    combat: overrides?.combat ?? p.attributes.combat,
    ranged: overrides?.ranged ?? p.attributes.ranged,
    strength: overrides?.strength ?? p.attributes.strength,
    agility: overrides?.agility ?? p.attributes.agility,
    courage: overrides?.courage ?? p.attributes.courage,
    intelligence: overrides?.intelligence ?? p.attributes.intelligence,
  };

  return new Monster({
    name: overrides?.name ?? p.name,
    x: overrides?.x ?? 0,
    y: overrides?.y ?? 0,
    image: overrides?.image ?? p.image,
    attributes,
    actions: overrides?.actions ?? p.actions ?? 1,
    mapWidth: overrides?.mapWidth ?? p.mapWidth ?? 1,
    mapHeight: overrides?.mapHeight ?? p.mapHeight ?? 1,
    size: overrides?.size ?? p.size,
    facing: overrides?.facing ?? p.facing ?? 0,
    inventory: overrides?.inventory ?? inventory,
    equipment: overrides?.equipment ?? equipment,
    vitality: overrides?.vitality ?? p.vitality,
    mana: overrides?.mana ?? p.mana,
    fortune: overrides?.fortune ?? p.fortune,
    naturalArmor: overrides?.naturalArmor ?? p.naturalArmor ?? 3,
    group: overrides?.group ?? p.group ?? CREATURE_GROUPS.ENEMY,
    faction: overrides?.faction ?? p.faction ?? MONSTER_FACTIONS.bandits.id,
  });
}

/**
 * Create a mercenary from a preset
 */
export function createMercenary(
  presetId: string, 
  overrides?: Partial<Mercenary> & { id?: string; x: number; y: number }
): Mercenary {
  const p = mercenaryPresets[presetId];
  if (!p) {
    throw new Error(`Mercenary preset "${presetId}" not found`);
  }

  const inventory = createInventoryFromPreset(p);
  const equipment = createEquipmentFromPreset(p);

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
    x: overrides?.x ?? 0,
    y: overrides?.y ?? 0,
    image: overrides?.image ?? p.image,
    attributes,
    actions: overrides?.actions ?? p.actions ?? 1,
    mapWidth: overrides?.mapWidth ?? p.mapWidth ?? 1,
    mapHeight: overrides?.mapHeight ?? p.mapHeight ?? 1,
    size: overrides?.size ?? p.size,
    facing: overrides?.facing ?? p.facing ?? 0,
    inventory: overrides?.inventory ?? inventory,
    equipment: overrides?.equipment ?? equipment,
    vitality: overrides?.vitality ?? p.vitality,
    mana: overrides?.mana ?? p.mana,
    fortune: overrides?.fortune ?? p.fortune,
    naturalArmor: overrides?.naturalArmor ?? p.naturalArmor ?? 3,
    group: overrides?.group ?? p.group ?? CREATURE_GROUPS.HERO,
    // Mercenary-specific properties
    hireCost: overrides?.hireCost ?? p.hireCost,
  });
}
