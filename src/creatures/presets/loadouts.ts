import { AIBehaviorType } from '../../ai/types';

// --- Predefined Weapon Loadouts ---
// These loadouts can be reused across different monster presets

export type WeaponLoadout = {
  name: string;
  description: string;
  equipment: {
    mainHand?: { type: "weapon" | "ranged_weapon"; preset: string; id?: string };
    offHand?: { type: "weapon" | "ranged_weapon" | "shield"; preset: string; id?: string };
    armor?: { type: "armor"; preset: string; id?: string };
  };
  inventory?: Array<{ type: "weapon" | "ranged_weapon" | "armor" | "shield"; preset: string; id?: string }>;
  aiBehavior?: AIBehaviorType; // Override AI behavior for this loadout
};

export const WEAPON_LOADOUTS: Record<string, WeaponLoadout> = {
  // --- Light Melee Loadouts ---
  light_melee_dagger: {
    name: "Light Melee - Dagger",
    description: "Fast, light melee fighter with dagger",
    equipment: {
      mainHand: { type: "weapon", preset: "dagger" },
      armor: { type: "armor", preset: "leather" }
    },
    aiBehavior: AIBehaviorType.MELEE,
  },

  light_melee_scimitar: {
    name: "Light Melee - Scimitar",
    description: "Fast, light melee fighter with scimitar",
    equipment: {
      mainHand: { type: "weapon", preset: "scimitar" },
      armor: { type: "armor", preset: "leather" }
    },
    aiBehavior: AIBehaviorType.MELEE,
  },

  light_melee_defensive: {
    name: "Light Melee - Defensive",
    description: "Light melee fighter with shield for defense",
    equipment: {
      mainHand: { type: "weapon", preset: "dagger" },
      offHand: { type: "shield", preset: "buckler" },
      armor: { type: "armor", preset: "leather" }
    },
    aiBehavior: AIBehaviorType.MELEE,
  },

  // --- Medium Melee Loadouts ---
  medium_melee_sword: {
    name: "Medium Melee - Sword",
    description: "Balanced melee fighter with sword",
    equipment: {
      mainHand: { type: "weapon", preset: "broadsword" },
      armor: { type: "armor", preset: "leather" }
    },
    aiBehavior: AIBehaviorType.MELEE,
  },

  medium_melee_sword_shield: {
    name: "Medium Melee - Sword & Shield",
    description: "Balanced melee fighter with sword and shield",
    equipment: {
      mainHand: { type: "weapon", preset: "broadsword" },
      offHand: { type: "shield", preset: "shield" },
      armor: { type: "armor", preset: "leather" }
    },
    aiBehavior: AIBehaviorType.MELEE,
  },

  // --- Heavy Melee Loadouts ---
  heavy_melee_twohanded: {
    name: "Heavy Melee - Two-Handed",
    description: "Heavy melee fighter with two-handed weapon",
    equipment: {
      mainHand: { type: "weapon", preset: "battleaxe" },
      armor: { type: "armor", preset: "chainMail" }
    },
    aiBehavior: AIBehaviorType.MELEE,
  },

  heavy_melee_commander: {
    name: "Heavy Melee - Commander",
    description: "Heavy melee fighter with sword and heavy armor",
    equipment: {
      mainHand: { type: "weapon", preset: "broadsword" },
      armor: { type: "armor", preset: "chainMail" }
    },
    aiBehavior: AIBehaviorType.MELEE,
  },

  // --- Ranged Loadouts ---
  ranged_archer: {
    name: "Ranged - Archer",
    description: "Ranged fighter with longbow",
    equipment: {
      mainHand: { type: "ranged_weapon", preset: "longbow" },
      armor: { type: "armor", preset: "leather" }
    },
    inventory: [
      { type: "ranged_weapon", preset: "longbow" },
    ],
    aiBehavior: AIBehaviorType.RANGED,
  },

  ranged_crossbow: {
    name: "Ranged - Crossbow",
    description: "Ranged fighter with crossbow for heavy damage",
    equipment: {
      mainHand: { type: "ranged_weapon", preset: "crossbow" },
      armor: { type: "armor", preset: "leather" }
    },
    inventory: [
      { type: "ranged_weapon", preset: "crossbow" },
    ],
    aiBehavior: AIBehaviorType.RANGED,
  },

  ranged_skirmisher: {
    name: "Ranged - Skirmisher",
    description: "Light ranged fighter that can switch to melee",
    equipment: {
      mainHand: { type: "weapon", preset: "dagger" },
      armor: { type: "armor", preset: "leather" }
    },
    aiBehavior: AIBehaviorType.MELEE,
  },

  // --- Specialized Loadouts ---
  specialized_berserker: {
    name: "Specialized - Berserker",
    description: "Frenzied fighter with two-handed weapon",
    equipment: {
      mainHand: { type: "weapon", preset: "battleaxe" },
      armor: { type: "armor", preset: "chainMail" }
    },
    aiBehavior: AIBehaviorType.MELEE,
  },

  specialized_tactician: {
    name: "Specialized - Tactician",
    description: "Strategic fighter with sword and shield",
    equipment: {
      mainHand: { type: "weapon", preset: "broadsword" },
      offHand: { type: "shield", preset: "shield" },
      armor: { type: "armor", preset: "chainMail" }
    },
    inventory: [
      { type: "weapon", preset: "broadsword" },
      { type: "shield", preset: "shield" },
    ],
    aiBehavior: AIBehaviorType.MELEE,
  },

  // --- Unarmed Loadouts ---
  unarmed_light: {
    name: "Unarmed - Light",
    description: "Unarmed fighter with light armor",
    equipment: {
      armor: { type: "armor", preset: "leather" }
    },
    aiBehavior: AIBehaviorType.MELEE,
  },

  unarmed_heavy: {
    name: "Unarmed - Heavy",
    description: "Unarmed fighter with heavy armor",
    equipment: {
      armor: { type: "armor", preset: "chainMail" }
    },
    aiBehavior: AIBehaviorType.MELEE,
  },
};

// --- Loadout Categories for Easy Selection ---
export const LOADOUT_CATEGORIES = {
  LIGHT_MELEE: ['light_melee_dagger', 'light_melee_scimitar', 'light_melee_defensive'],
  MEDIUM_MELEE: ['medium_melee_sword', 'medium_melee_sword_shield'],
  HEAVY_MELEE: ['heavy_melee_twohanded', 'heavy_melee_commander'],
  RANGED: ['ranged_archer', 'ranged_crossbow', 'ranged_skirmisher'],
  SPECIALIZED: ['specialized_berserker', 'specialized_tactician'],
  UNARMED: ['unarmed_light', 'unarmed_heavy'],
} as const;

// --- Helper Functions ---
export function getLoadoutById(id: string): WeaponLoadout | undefined {
  return WEAPON_LOADOUTS[id];
}

export function getLoadoutsByCategory(category: keyof typeof LOADOUT_CATEGORIES): WeaponLoadout[] {
  return LOADOUT_CATEGORIES[category].map(id => WEAPON_LOADOUTS[id]);
}

export function getRandomLoadoutFromCategory(category: keyof typeof LOADOUT_CATEGORIES): WeaponLoadout {
  const categoryLoadouts = LOADOUT_CATEGORIES[category];
  const randomIndex = Math.floor(Math.random() * categoryLoadouts.length);
  return WEAPON_LOADOUTS[categoryLoadouts[randomIndex]];
}
