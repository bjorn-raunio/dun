import { Creature } from './base';
import { CREATURE_GROUPS } from './CreatureGroup';
// AIState not used directly in Monster class
import { createAIStateForCreature } from '../ai/decisionMaking';
import { CreatureConstructorParams } from './types';
import { MonsterPreset, MercenaryPreset } from './presets/types';

// --- Monster Faction System ---
export type MonsterFaction = "bandits" | "undead" | "beasts" | "neutral";

export interface MonsterFactionInfo {
  id: MonsterFaction;
  name: string;
  description: string;
  color?: string; // For UI display
  preferredBehavior?: string; // General behavior tendency
}

export const MONSTER_FACTIONS: Record<MonsterFaction, MonsterFactionInfo> = {
  bandits: {
    id: "bandits",
    name: "Bandits",
    description: "Human outlaws and thieves who prey on travelers and settlements",
    color: "#8B4513", // Brown
    preferredBehavior: "Opportunistic and tactical"
  },
  undead: {
    id: "undead",
    name: "Undead",
    description: "Animated corpses and skeletal warriors under dark magic",
    color: "#2F4F4F", // Dark slate gray
    preferredBehavior: "Mindless and relentless"
  },
  beasts: {
    id: "beasts",
    name: "Beasts",
    description: "Wild animals and monstrous creatures of the wilderness",
    color: "#228B22", // Forest green
    preferredBehavior: "Instinctive and territorial"
  },
  neutral: {
    id: "neutral",
    name: "Neutral",
    description: "Creatures with no particular faction allegiance",
    color: "#696969", // Dim gray
    preferredBehavior: "Variable"
  }
} as const;

export const MONSTER_FACTIONS_KEYS = {
  BANDITS: "bandits" as const,
  UNDEAD: "undead" as const,
  BEASTS: "beasts" as const,
  NEUTRAL: "neutral" as const,
} as const;

// --- Monster Class ---
export class Monster extends Creature {
  public faction: MonsterFaction;

  get kind(): "monster" {
    return "monster";
  }

  constructor(params: CreatureConstructorParams & { faction?: MonsterFaction; preset?: MonsterPreset | MercenaryPreset }) {
    // Ensure monster group is set (default to bandits if not specified)
    super({
      ...params,
      group: params.group || CREATURE_GROUPS.ENEMY
    });

    // Set faction (default to bandits if not specified)
    this.faction = params.faction || MONSTER_FACTIONS.bandits.id;

    // Initialize AI state for the monster
    this.setAIState(createAIStateForCreature(this, params.preset));
  }

  // --- Abstract Method Implementation ---
  protected createInstance(params: CreatureConstructorParams & { faction?: MonsterFaction; preset?: MonsterPreset | MercenaryPreset }): Creature {
    return new Monster(params);
  }
}
