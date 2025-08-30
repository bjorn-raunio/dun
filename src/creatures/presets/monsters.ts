import { AIBehaviorType } from '../../ai/types';
import { MONSTER_FACTIONS } from '../monster';
import { MonsterPreset } from './types';

// --- Monster Presets Organized by Faction ---

export const monsterPresetsByFaction: Record<string, Record<string, MonsterPreset>> = {
  bandits: {
    bandit: {
      name: "Bandit",
      image: "creatures/bandit.png",
      attributes: {
        movement: 5,
        combat: 3,
        ranged: 3,
        strength: 3,
        agility: 3,
        courage: 3,
        intelligence: 4,
      },
      size: 2, // medium
      inventory: [],
      equipment: {
        mainHand: { type: "weapon", preset: "dagger" },
        armor: { type: "armor", preset: "leather" }
      },
      vitality: 4,
      aiBehavior: AIBehaviorType.MELEE,
      defaultLoadout: "light_melee_dagger",
      weaponLoadouts: {
        standard: "light_melee_dagger",
        aggressive: "light_melee_scimitar",
        defensive: "light_melee_defensive",
      },
    },
    bandit_archer: {
      name: "Shooter",
      image: "creatures/bandit.png",
      attributes: {
        movement: 5,
        combat: 3,
        ranged: 3,
        strength: 3,
        agility: 3,
        courage: 3,
        intelligence: 4,
      },
      size: 2,
      inventory: [
        { type: "ranged_weapon", preset: "longbow" },
      ],
      equipment: {
        mainHand: { type: "ranged_weapon", preset: "longbow" },
        armor: { type: "armor", preset: "leather" }
      },
      vitality: 4,
      aiBehavior: AIBehaviorType.RANGED,
      defaultLoadout: "ranged_archer",
      weaponLoadouts: {
        archer: "ranged_archer",
        crossbowman: "ranged_crossbow",
        skirmisher: "ranged_skirmisher",
      },
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
      inventory: [
        { type: "weapon", preset: "broadsword" },
      ],
      equipment: {
        mainHand: { type: "weapon", preset: "broadsword" },
        armor: { type: "armor", preset: "chainMail" }
      },
      vitality: 6,
      aiBehavior: AIBehaviorType.MELEE,
      defaultLoadout: "heavy_melee_commander",
      weaponLoadouts: {
        commander: "heavy_melee_commander",
        berserker: "specialized_berserker",
        tactician: "specialized_tactician",
      },
    },
  },
  undead: {
    skeleton: {
      name: "Skeleton",
      image: "creatures/skeleton.png",
      attributes: {
        movement: 4,
        combat: 2,
        ranged: 1,
        strength: 2,
        agility: 2,
        courage: 5,
        intelligence: 1,
      },
      size: 2,
      inventory: [],
      equipment: {
        mainHand: { type: "weapon", preset: "dagger" },
        armor: { type: "armor", preset: "leather" }
      },
      vitality: 3,
      aiBehavior: AIBehaviorType.MELEE,
      defaultLoadout: "light_melee_dagger",
      weaponLoadouts: {
        basic: "light_melee_dagger",
        aggressive: "light_melee_scimitar",
        defensive: "light_melee_defensive",
      },
    },
    skeleton_archer: {
      name: "Skeleton Archer",
      image: "creatures/skeleton.png",
      attributes: {
        movement: 4,
        combat: 2,
        ranged: 3,
        strength: 2,
        agility: 3,
        courage: 5,
        intelligence: 1,
      },
      size: 2,
      inventory: [
        { type: "ranged_weapon", preset: "shortbow" },
      ],
      equipment: {
        mainHand: { type: "ranged_weapon", preset: "shortbow" },
        armor: { type: "armor", preset: "leather" }
      },
      vitality: 3,
      aiBehavior: AIBehaviorType.RANGED,
      defaultLoadout: "ranged_archer",
      weaponLoadouts: {
        archer: "ranged_archer",
        crossbowman: "ranged_crossbow",
        skirmisher: "ranged_skirmisher",
      },
    },
    skeleton_warrior: {
      name: "Skeleton Warrior",
      image: "creatures/skeleton.png",
      attributes: {
        movement: 3,
        combat: 3,
        ranged: 1,
        strength: 3,
        agility: 2,
        courage: 5,
        intelligence: 1,
      },
      size: 2,
      inventory: [
        { type: "weapon", preset: "broadsword" },
      ],
      equipment: {
        mainHand: { type: "weapon", preset: "broadsword" },
        armor: { type: "armor", preset: "chainMail" }
      },
      vitality: 5,
      aiBehavior: AIBehaviorType.MELEE,
      defaultLoadout: "heavy_melee_commander",
      weaponLoadouts: {
        warrior: "heavy_melee_commander",
        berserker: "specialized_berserker",
        tactician: "specialized_tactician",
      },
    },
  },
};

// Flattened monster presets for backward compatibility
export const monsterPresets: Record<string, MonsterPreset> = Object.values(monsterPresetsByFaction)
  .reduce((acc, factionPresets) => ({ ...acc, ...factionPresets }), {});
