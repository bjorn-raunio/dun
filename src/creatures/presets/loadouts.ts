import { AIBehaviorType } from '../../ai/types';

// --- Predefined Weapon Loadouts ---
// These loadouts define weapon combinations (mainHand, offHand)

export type WeaponLoadout = {
  mainHand?: { type: "weapon" | "ranged_weapon"; preset: string; id?: string };
  offHand?: { type: "weapon" | "ranged_weapon" | "shield"; preset: string; id?: string };
  inventory?: Array<{ type: "weapon" | "ranged_weapon" | "shield"; preset: string; id?: string }>;
  aiBehavior?: AIBehaviorType; // Override AI behavior for this loadout
};

// --- Predefined Armor Loadouts ---
// These loadouts define armor combinations (armor, shield)

export type ArmorLoadout = {
  armor?: { type: "armor"; preset: string; id?: string };
  shield?: { type: "shield"; preset: string; id?: string };
  inventory?: Array<{ type: "armor" | "shield"; preset: string; id?: string }>;
};

export const WEAPON_LOADOUTS: Record<string, WeaponLoadout> = {

  broadsword: {
    mainHand: { type: "weapon", preset: "broadsword" },
  },

  axe: {
    mainHand: { type: "weapon", preset: "axe" },
  },

  mace: {
    mainHand: { type: "weapon", preset: "mace" },
  },

  shortbow: {
    mainHand: { type: "ranged_weapon", preset: "shortbow" },
  },
};

// --- Armor Loadouts ---
export const ARMOR_LOADOUTS: Record<string, ArmorLoadout> = {

  leather: {
    armor: { type: "armor", preset: "leather" },
  },

  shield: {
    shield: { type: "shield", preset: "shield" },
  },
};

// --- Helper Functions ---
export function getWeaponLoadoutById(id: string): WeaponLoadout | undefined {
  return WEAPON_LOADOUTS[id];
}

export function getArmorLoadoutById(id: string): ArmorLoadout | undefined {
  return ARMOR_LOADOUTS[id];
}

/**
 * Get a random weapon loadout from the available options
 */
export function getRandomWeaponLoadout(availableLoadouts: string[]): string | undefined {
  if (!availableLoadouts || availableLoadouts.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * availableLoadouts.length);
  return availableLoadouts[randomIndex];
}

/**
 * Get a random armor loadout from the available options
 */
export function getRandomArmorLoadout(availableLoadouts: string[]): string | undefined {
  if (!availableLoadouts || availableLoadouts.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * availableLoadouts.length);
  return availableLoadouts[randomIndex];
}

/**
 * Get all available weapon loadout IDs
 */
export function getAllWeaponLoadoutIds(): string[] {
  return Object.keys(WEAPON_LOADOUTS);
}

/**
 * Get all available armor loadout IDs
 */
export function getAllArmorLoadoutIds(): string[] {
  return Object.keys(ARMOR_LOADOUTS);
}

/**
 * Get weapon loadouts by category
 */
export function getWeaponLoadoutsByCategory(category: 'melee' | 'ranged' | 'defensive' | 'agile' | 'testing'): string[] {
  const categoryMap: Record<string, string[]> = {
    melee: ['dagger', 'broadsword', 'greatsword'],
    ranged: ['ranged_archer'],
    defensive: ['sword_shield'],
    agile: ['dual_dagger'],
    testing: ['invalid_greatsword_shield']
  };
  
  return categoryMap[category] || [];
}

/**
 * Get armor loadouts by category
 */
export function getArmorLoadoutsByCategory(category: 'light' | 'medium' | 'heavy' | 'shield_only' | 'combined'): string[] {
  const categoryMap: Record<string, string[]> = {
    light: ['leather', 'buckler', 'leather_buckler'],
    medium: ['chain_mail', 'round_shield', 'chain_round_shield'],
    heavy: ['plate_mail', 'tower_shield', 'plate_tower_shield'],
    shield_only: ['buckler', 'round_shield', 'tower_shield'],
    combined: ['leather_buckler', 'chain_round_shield', 'plate_tower_shield']
  };
  
  return categoryMap[category] || [];
}