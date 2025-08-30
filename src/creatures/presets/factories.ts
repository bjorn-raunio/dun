import { Monster, Mercenary, CREATURE_GROUPS } from '../index';
import { createWeapon, createRangedWeapon, createArmor, createShield } from '../../items';
import { MONSTER_FACTIONS } from '../monster';
import { monsterPresets, monsterPresetsByFaction } from './monsters';
import { mercenaryPresets } from './mercenaries';
import { MonsterPreset, MercenaryPreset } from './types';
import { getLoadoutById } from './loadouts';

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
  overrides?: Partial<Monster> & { id?: string; x: number; y: number; loadout?: string }
): Monster {
  const p = monsterPresets[presetId];
  if (!p) {
    throw new Error(`Monster preset "${presetId}" not found`);
  }

  // Determine faction from preset location in monsterPresetsByFaction
  let faction: string = MONSTER_FACTIONS.bandits.id; // default
  for (const [factionId, factionPresets] of Object.entries(monsterPresetsByFaction)) {
    if (presetId in factionPresets) {
      faction = factionId as string;
      break;
    }
  }

  // Handle weapon loadouts
  let loadoutToUse = overrides?.loadout || p.defaultLoadout;
  let loadoutData = null;
  
  if (loadoutToUse && p.weaponLoadouts && p.weaponLoadouts[loadoutToUse]) {
    const loadoutId = p.weaponLoadouts[loadoutToUse];
    loadoutData = getLoadoutById(loadoutId);
  }

  // Use loadout data if available, otherwise fall back to base preset
  const effectivePreset = loadoutData ? {
    ...p,
    equipment: loadoutData.equipment || p.equipment,
    inventory: loadoutData.inventory || p.inventory,
    aiBehavior: loadoutData.aiBehavior || p.aiBehavior,
  } : p;

  const inventory = createInventoryFromPreset(effectivePreset);
  const equipment = createEquipmentFromPreset(effectivePreset);

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
    mana: overrides?.mana ?? p.mana ?? 0,
    fortune: overrides?.fortune ?? p.fortune ?? 0,
    naturalArmor: overrides?.naturalArmor ?? p.naturalArmor ?? 3,
    group: overrides?.group ?? p.group ?? CREATURE_GROUPS.ENEMY,
    faction: faction,
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
    mana: overrides?.mana ?? p.mana ?? 0,
    fortune: overrides?.fortune ?? p.fortune ?? 0,
    naturalArmor: overrides?.naturalArmor ?? p.naturalArmor ?? 3,
    group: overrides?.group ?? p.group ?? CREATURE_GROUPS.HERO,
    // Mercenary-specific properties
    hireCost: overrides?.hireCost ?? p.hireCost,
  });
}
