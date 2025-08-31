import { Monster, Mercenary, CREATURE_GROUPS } from '../index';
import { createWeapon, createRangedWeapon, createArmor, createShield } from '../../items';
import { MONSTER_FACTIONS, type MonsterFaction } from '../monster';
import { monsterPresets } from './monsters';
import { mercenaryPresets } from './mercenaries';
import { MonsterPreset, MercenaryPreset } from './types';
import { getWeaponLoadoutById, getArmorLoadoutById, getRandomWeaponLoadout, getRandomArmorLoadout } from './loadouts';
import { EquipmentSystem, EquipmentSlots } from '../../items/equipment';
import { Item } from '../../items/types';

// --- Factory Functions ---

/**
 * Create inventory items from preset definitions
 */
function createInventoryFromPreset(preset: MonsterPreset | MercenaryPreset): Item[] {
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
      }
    }
  }
  return inventory;
}

/**
 * Create equipment from preset definitions
 */
function createEquipmentFromPreset(preset: MonsterPreset | MercenaryPreset): EquipmentSlots {
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
 * Create a monster from a preset
 */
export function createMonster(
  presetId: string, 
  faction: MonsterFaction,
  overrides?: Partial<Monster> & { id?: string; x: number; y: number; weaponLoadout?: string; armorLoadout?: string }
): Monster {
  const p = monsterPresets[presetId];
  if (!p) {
    throw new Error(`Monster preset "${presetId}" not found`);
  }

  // Validate that the faction is valid
  if (!Object.values(MONSTER_FACTIONS).some(f => f.id === faction)) {
    throw new Error(`Invalid faction "${faction}". Valid factions are: ${Object.values(MONSTER_FACTIONS).map(f => f.id).join(', ')}`);
  }

    // Handle weapon and armor loadouts
  let weaponLoadoutToUse = overrides?.weaponLoadout;
  let armorLoadoutToUse = overrides?.armorLoadout;
  
  // If no loadout specified, randomly select from available options
  if (!weaponLoadoutToUse && p.weaponLoadouts && p.weaponLoadouts.length > 0) {
    weaponLoadoutToUse = getRandomWeaponLoadout(p.weaponLoadouts);
  }
  
  if (!armorLoadoutToUse && p.armorLoadouts && p.armorLoadouts.length > 0) {
    armorLoadoutToUse = getRandomArmorLoadout(p.armorLoadouts);
  }
  
  let weaponLoadoutData = null;
  let armorLoadoutData = null;
   
  if (weaponLoadoutToUse && p.weaponLoadouts && p.weaponLoadouts.includes(weaponLoadoutToUse)) {
    weaponLoadoutData = getWeaponLoadoutById(weaponLoadoutToUse);
  }
  
  if (armorLoadoutToUse && p.armorLoadouts && p.armorLoadouts.includes(armorLoadoutToUse)) {
    armorLoadoutData = getArmorLoadoutById(armorLoadoutToUse);
  }

  // Combine weapon and armor loadouts with base preset
  const effectivePreset = {
    ...p,
    // Combine weapon loadout data
    equipment: {
      ...p.equipment,
      ...(weaponLoadoutData && {
        mainHand: weaponLoadoutData.mainHand,
        offHand: weaponLoadoutData.offHand,
      }),
      ...(armorLoadoutData && {
        armor: armorLoadoutData.armor,
        // Note: Shields from armor loadouts go to offHand if no weapon is using it
        ...(armorLoadoutData.shield && !weaponLoadoutData?.offHand && {
          offHand: armorLoadoutData.shield
        })
      })
    },
    // Combine inventory from both loadouts
    inventory: [
      ...(p.inventory || []),
      ...(weaponLoadoutData?.inventory || []),
      ...(armorLoadoutData?.inventory || [])
    ],
    // Use weapon loadout AI behavior if available
    aiBehavior: weaponLoadoutData?.aiBehavior || p.aiBehavior,
  };

  const inventory = createInventoryFromPreset(effectivePreset);
  const equipment = createEquipmentFromPreset(effectivePreset);

  // Validate equipment compatibility using the existing EquipmentSystem
  const equipmentSystem = new EquipmentSystem(equipment);
  const equipmentValidation = equipmentSystem.validateEquipment();
  if (!equipmentValidation.isValid) {
    console.warn(`Equipment validation failed for monster ${presetId}: ${equipmentValidation.reason}`);
    
    // Move conflicting items to inventory and fix equipment
    if (equipmentValidation.slot) {
      const conflictingItem = equipment[equipmentValidation.slot as keyof EquipmentSlots];
      if (conflictingItem) {
        // Remove the conflicting item from equipment
        equipment[equipmentValidation.slot as keyof EquipmentSlots] = undefined;
        // Add it to inventory
        inventory.push(conflictingItem);
        console.log(`Moved conflicting ${equipmentValidation.slot} item to inventory for monster ${presetId}`);
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
    skills: overrides?.skills ?? p.skills,
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
    group: overrides?.group ?? p.group ?? CREATURE_GROUPS.PLAYER,
    skills: overrides?.skills ?? p.skills,
    // Mercenary-specific properties
    hireCost: overrides?.hireCost ?? p.hireCost,
  });
}
