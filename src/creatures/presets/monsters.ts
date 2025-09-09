import { AIBehaviorType } from '../../ai/types';
import { MonsterPreset } from './types';
import { SKILL_PRESETS } from '../../skills';
import { AI_BEHAVIORS } from '../../ai';

// --- Monster Presets Organized by Faction ---

export const monsterPresetsByFaction: Record<string, Record<string, MonsterPreset>> = {
  bandits: {
    human_bandit: {
      name: "Human bandit",
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
      vitality: 4,
      size: 2,
      weaponLoadouts: ["broadsword", "axe", "mace"],
      armorLoadouts: ["shield", "leatherArmor"],
      aiBehavior: AI_BEHAVIORS.MELEE,
      skills: [
        SKILL_PRESETS.lostInTheDark,
        SKILL_PRESETS.dirtyFighter,
        SKILL_PRESETS.ambush,
      ]
    },
    shooter: {
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
      vitality: 4,
      inventory: [
        { type: "weapon", preset: "broadsword" },
      ],
      weaponLoadouts: ["shortbow"],
      armorLoadouts: [],
      aiBehavior: AI_BEHAVIORS.RANGED,
      skills: [
        SKILL_PRESETS.lostInTheDark,
        SKILL_PRESETS.dirtyFighter,
        SKILL_PRESETS.ambush,
      ]
    },    
    warhound: {
      name: "Warhound",
      image: "creatures/warhound.png",
      attributes: {
        movement: 7,
        combat: 4,
        ranged: 0,
        strength: 3,
        agility: 4,
        courage: 5,
        intelligence: 1,
      },
      size: 2,
      vitality: 4,
      aiBehavior: AI_BEHAVIORS.ANIMAL,
      skills: [
        SKILL_PRESETS.sharpSenses,
      ],
      naturalWeapons: ["fangs"]
    },
  },
};

// Flattened monster presets for backward compatibility
export const monsterPresets: Record<string, MonsterPreset> = Object.values(monsterPresetsByFaction)
  .reduce((acc, factionPresets) => ({ ...acc, ...factionPresets }), {});
