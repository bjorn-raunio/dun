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
      inventory: [],
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
