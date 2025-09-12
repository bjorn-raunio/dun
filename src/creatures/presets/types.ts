import { Attributes } from '../../statusEffects';
import { AIBehaviorType } from '../../ai/types';
import { CreatureGroup } from '../CreatureGroup';
import { Skill } from '../../skills';
import { Profession } from '../heroes/professions/profession';
import { Race } from '../heroes/races/race';
import { SpellSchool } from '../../spells/spellSchool';

// --- Shared Preset Types ---

export type BasePreset = {
  name: string;
  image: string;
  attributes: Attributes;
  actions?: number; // Optional - defaults to 1
  quickActions?: number; // Optional - defaults to 1
  mapWidth?: number;
  mapHeight?: number;
  facing?: number; // 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
  inventory?: Array<{ type: "weapon" | "ranged_weapon" | "armor" | "shield" | "consumable" | "miscellaneous"; preset: string; id?: string }>;
  equipment?: {
    mainHand?: { type: "weapon" | "ranged_weapon"; preset: string; id?: string };
    offHand?: { type: "weapon" | "ranged_weapon" | "shield"; preset: string; id?: string };
    armor?: { type: "armor"; preset: string; id?: string };
  };
  vitality: number;
  mana?: number; // Optional - defaults to 0
  fortune?: number;// Optional - defaults to 0
  naturalArmor?: number;
  group?: CreatureGroup;
  skills?: Skill[];
  naturalWeapons?: string[];
};

export type MonsterRank = "grunt" | "elite" | "champion";

export type MonsterPreset<T extends string> = BasePreset & {
  type: T;
  cost: number;
  rank: MonsterRank;
  aiBehavior?: AIBehaviorType; // AI behavior type (melee, ranged, animal)
  // Loadout system for different variants
  weaponLoadouts?: string[]; // Array of weapon loadout IDs
  armorLoadouts?: string[];  // Array of armor loadout IDs
  leader?: boolean;
  spellSchools?: SpellSchool[];
};

export type MercenaryPreset = BasePreset & {
  hireCost: number;
  spellSchools?: SpellSchool[];
};

export type HeroPreset = BasePreset & {
  // Hero-specific properties can be added here
  // For example: starting level, experience, special abilities, etc.
  race: Race;
  profession: Profession;
  gold: number;
  spellSchool?: SpellSchool;
};