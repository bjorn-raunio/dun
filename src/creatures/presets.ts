import { Hero, Monster, Mercenary, CREATURE_GROUPS, Attributes } from './index';
import { createWeapon, createRangedWeapon, createArmor, createShield } from '../items';
import { AIBehaviorType } from '../ai/types';
import { MONSTER_FACTIONS, MONSTER_FACTIONS_KEYS } from './monster';

// --- Monster Presets and Factory Functions ---
export type MonsterPreset = {
  name: string;
  image: string;
  attributes: Attributes;
  actions?: number; // Optional - defaults to 1
  mapWidth?: number;
  mapHeight?: number;
  size: number; // 1=small, 2=medium, 3=large, 4=huge
  facing?: number; // 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
  inventory?: Array<{ type: "weapon" | "ranged_weapon" | "armor" | "shield"; preset: string; id?: string }>;
  equipment?: {
    mainHand?: { type: "weapon" | "ranged_weapon"; preset: string; id?: string };
    offHand?: { type: "weapon" | "ranged_weapon" | "shield"; preset: string; id?: string };
    armor?: { type: "armor"; preset: string; id?: string };
  };
  vitality: number;
  mana: number;
  fortune: number;
  naturalArmor?: number;
  aiBehavior?: AIBehaviorType; // AI behavior type (melee, ranged, animal)
  group?: string; // Which group this monster belongs to
  faction?: string; // Which faction this monster belongs to
};

// Monster presets organized by faction
export const monsterPresetsByFaction: Record<string, Record<string, MonsterPreset>> = {
  bandits: {
    bandit: {
      name: "Bandit",
      image: "creatures/bandit.png",
      attributes: {
        movement: 2,
        combat: 3,
        ranged: 1,
        strength: 2,
        agility: 3,
        courage: 2,
        intelligence: 1,
      },
      size: 2, // medium
      facing: 0, // North
      inventory: [
      ],
      equipment: {
        mainHand: { type: "weapon", preset: "dagger" },
        armor: { type: "armor", preset: "leather" }
      },
      vitality: 4,
      mana: 0,
      fortune: 1,
      aiBehavior: AIBehaviorType.MELEE,
      faction: MONSTER_FACTIONS.bandits.id,
    },
    bandit_archer: {
      name: "Bandit Archer",
      image: "creatures/bandit.png",
      attributes: {
        movement: 3,
        combat: 2,
        ranged: 4,
        strength: 2,
        agility: 4,
        courage: 2,
        intelligence: 2,
      },
      size: 2,
      facing: 0,
      inventory: [
        { type: "ranged_weapon", preset: "longbow" },
      ],
      equipment: {
        mainHand: { type: "ranged_weapon", preset: "longbow" },
        armor: { type: "armor", preset: "leather" }
      },
      vitality: 3,
      mana: 0,
      fortune: 1,
      aiBehavior: AIBehaviorType.RANGED,
      faction: MONSTER_FACTIONS.bandits.id,
    },
    bandit_leader: {
      name: "Bandit Leader",
      image: "creatures/bandit.png",
      attributes: {
        movement: 2,
        combat: 4,
        ranged: 1,
        strength: 3,
        agility: 3,
        courage: 3,
        intelligence: 2,
      },
      size: 2,
      facing: 0,
      inventory: [
        { type: "weapon", preset: "sword" },
      ],
      equipment: {
        mainHand: { type: "weapon", preset: "sword" },
        armor: { type: "armor", preset: "chainMail" }
      },
      vitality: 6,
      mana: 0,
      fortune: 2,
      aiBehavior: AIBehaviorType.MELEE,
      faction: MONSTER_FACTIONS.bandits.id,
    },
  },
};

// Flattened monster presets for backward compatibility
export const monsterPresets: Record<string, MonsterPreset> = Object.values(monsterPresetsByFaction)
  .reduce((acc, factionPresets) => ({ ...acc, ...factionPresets }), {});

export function createMonster(presetId: string, overrides?: Partial<Monster> & { id?: string; x: number; y: number }): Monster {
  const p = monsterPresets[presetId];
  if (!p) {
    throw new Error(`Monster preset "${presetId}" not found`);
  }

  // Create inventory items
  const inventory: any[] = [];
  if (p.inventory) {
    for (const itemDef of p.inventory) {
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

  // Create equipment
  const equipment: Monster["equipment"] = {};
  if (p.equipment) {
    if (p.equipment.mainHand) {
      if (p.equipment.mainHand.type === "weapon") {
        equipment.mainHand = createWeapon(p.equipment.mainHand.preset);
      } else if (p.equipment.mainHand.type === "ranged_weapon") {
        equipment.mainHand = createRangedWeapon(p.equipment.mainHand.preset);
      }
    }
    if (p.equipment.offHand) {
      if (p.equipment.offHand.type === "weapon") {
        equipment.offHand = createWeapon(p.equipment.offHand.preset);
      } else if (p.equipment.offHand.type === "ranged_weapon") {
        equipment.offHand = createRangedWeapon(p.equipment.offHand.preset);
      } else if (p.equipment.offHand.type === "shield") {
        equipment.offHand = createShield(p.equipment.offHand.preset);
      }
    }
    if (p.equipment.armor) {
      equipment.armor = createArmor(p.equipment.armor.preset);
    }
  }

  const attributes: Attributes = {
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

// --- Mercenary Presets and Factory Functions ---
export type MercenaryPreset = {
  name: string;
  image: string;
  attributes: Attributes;
  actions?: number; // Optional - defaults to 1
  mapWidth?: number;
  mapHeight?: number;
  size: number;
  facing?: number;
  inventory?: Array<{ type: "weapon" | "ranged_weapon" | "armor" | "shield"; preset: string; id?: string }>;
  equipment?: {
    mainHand?: { type: "weapon" | "ranged_weapon"; preset: string; id?: string };
    offHand?: { type: "weapon" | "ranged_weapon" | "shield"; preset: string; id?: string };
    armor?: { type: "armor"; preset: string; id?: string };
  };
  vitality: number;
  mana: number;
  fortune: number;
  naturalArmor?: number;
  hireCost: number;
  group?: string;
};

export const mercenaryPresets: Record<string, MercenaryPreset> = {
  civilian: {
    name: "Civilian",
    image: "creatures/civilian.png",
    attributes: {
      movement: 6,
      combat: 3,
      ranged: 5,
      strength: 2,
      agility: 4,
      courage: 1,
      intelligence: 2,
    },
    size: 2,
    facing: 0,
    inventory: [],
    equipment: {},
    vitality: 4,
    mana: 0,
    fortune: 1,
    hireCost: 75,
  },
  archer: {
    name: "Archer",
    image: "creatures/civilian.png",
    attributes: {
      movement: 5,
      combat: 2,
      ranged: 5,
      strength: 2,
      agility: 4,
      courage: 2,
      intelligence: 2,
    },
    size: 2,
    facing: 0,
    inventory: [
      { type: "ranged_weapon", preset: "longbow" },
    ],
    equipment: {
      mainHand: { type: "ranged_weapon", preset: "longbow" },
      armor: { type: "armor", preset: "leather" }
    },
    vitality: 4,
    mana: 0,
    fortune: 1,
    hireCost: 100,
  },
  guard: {
    name: "Guard",
    image: "creatures/civilian.png",
    attributes: {
      movement: 4,
      combat: 4,
      ranged: 1,
      strength: 3,
      agility: 3,
      courage: 3,
      intelligence: 2,
    },
    size: 2,
    facing: 0,
    inventory: [
      { type: "weapon", preset: "sword" },
      { type: "shield", preset: "shield" },
    ],
    equipment: {
      mainHand: { type: "weapon", preset: "sword" },
      offHand: { type: "shield", preset: "shield" },
      armor: { type: "armor", preset: "chainMail" }
    },
    vitality: 6,
    mana: 0,
    fortune: 2,
    hireCost: 125,
  },
};

export function createMercenary(presetId: string, overrides?: Partial<Mercenary> & { id?: string; x: number; y: number }): Mercenary {
  const p = mercenaryPresets[presetId];
  if (!p) {
    throw new Error(`Mercenary preset "${presetId}" not found`);
  }

  // Create inventory items
  const inventory: any[] = [];
  if (p.inventory) {
    for (const itemDef of p.inventory) {
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

  // Create equipment
  const equipment: Mercenary["equipment"] = {};
  if (p.equipment) {
    if (p.equipment.mainHand) {
      if (p.equipment.mainHand.type === "weapon") {
        equipment.mainHand = createWeapon(p.equipment.mainHand.preset);
      } else if (p.equipment.mainHand.type === "ranged_weapon") {
        equipment.mainHand = createRangedWeapon(p.equipment.mainHand.preset);
      }
    }
    if (p.equipment.offHand) {
      if (p.equipment.offHand.type === "weapon") {
        equipment.offHand = createWeapon(p.equipment.offHand.preset);
      } else if (p.equipment.offHand.type === "ranged_weapon") {
        equipment.offHand = createRangedWeapon(p.equipment.offHand.preset);
      } else if (p.equipment.offHand.type === "shield") {
        equipment.offHand = createShield(p.equipment.offHand.preset);
      }
    }
    if (p.equipment.armor) {
      equipment.armor = createArmor(p.equipment.armor.preset);
    }
  }

  const attributes: Attributes = {
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
