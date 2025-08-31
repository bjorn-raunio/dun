import { AIBehaviorType } from '../../ai/types';
import { MonsterPreset } from './types';
import { SKILL_PRESETS } from './skills';

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
      armorLoadouts: ["shield", "leather"],
      aiBehavior: AIBehaviorType.MELEE,
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
      aiBehavior: AIBehaviorType.RANGED,
      skills: [
        SKILL_PRESETS.lostInTheDark,
        SKILL_PRESETS.dirtyFighter,
        SKILL_PRESETS.ambush,
      ]
    },
  },
};

// Flattened monster presets for backward compatibility
export const monsterPresets: Record<string, MonsterPreset> = Object.values(monsterPresetsByFaction)
  .reduce((acc, factionPresets) => ({ ...acc, ...factionPresets }), {});
