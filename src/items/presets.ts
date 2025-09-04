// --- Reusable item presets and factories ---
export type WeaponPreset = {
  name: string;
  damage: number;
  hands: 1 | 2;
  reach?: number;
  properties?: string[];
  combatModifier?: number;
  armorModifier?: number;
  weight?: number;
  value?: number
};

export const weaponPresets: Record<string, WeaponPreset> = {
  unarmed: { name: "Unarmed", damage: 0, hands: 1, properties: ["light"], combatModifier: -1, armorModifier: 1, weight: 0, value: 0 },
  dagger: { name: "Dagger", damage: 0, hands: 1, properties: ["finesse", "light", "thrown"], combatModifier: -1, armorModifier: 0, weight: 1, value: 2 },
  scimitar: { name: "Scimitar", damage: 0, hands: 1, properties: ["finesse", "light"], armorModifier: 0, weight: 3, value: 25 },
  broadsword: { name: "Broadsword", damage: 1, hands: 1, properties: ["versatile"], armorModifier: 0, weight: 3, value: 15 },
  axe: { name: "Axe", damage: 1, hands: 1, properties: ["heavy", "two-handed"], combatModifier: -1, armorModifier: -1, weight: 4, value: 30 },
  mace: { name: "Mace", damage: 0, hands: 1, properties: ["heavy", "two-handed"], combatModifier: -1, armorModifier: -1, weight: 4, value: 30 },
};

export type RangedWeaponPreset = {
  name: string;
  damage: number;
  range: number;
  hands: 1 | 2;
  ammoType?: string;
  properties?: string[];
  armorModifier?: number;
  weight?: number;
  value?: number
};

export const rangedPresets: Record<string, RangedWeaponPreset> = {
  shortbow: { name: "Shortbow", damage: 3, range: 6, hands: 2, properties: ["ammunition", "two-handed"], armorModifier: 0, weight: 2, value: 25 },
  longbow: { name: "Longbow", damage: 4, range: 12, hands: 2, properties: ["ammunition", "heavy", "two-handed"], armorModifier: 0, weight: 2, value: 50 },
};

export type ArmorPreset = {
  name: string;
  armor: number;
  armorType: "light" | "heavy";
  weight?: number;
  value?: number
};

export const armorPresets: Record<string, ArmorPreset> = {
  leather: { name: "Leather Armor", armor: 1, armorType: "light", weight: 10, value: 10 },
  chainMail: { name: "Chain Mail", armor: 2, armorType: "heavy", weight: 55, value: 75 },
};

export type ShieldPreset = {
  name: string;
  block: number;
  special?: string[];
  weight?: number;
  value?: number
};

export const shieldPresets: Record<string, ShieldPreset> = {
  buckler: { name: "Buckler", block: 6, weight: 2, value: 5 },
  shield: { name: "Shield", block: 5, weight: 6, value: 10 },
};

export type ConsumablePreset = {
  name: string;
  effect: string;
  duration?: number;
  charges?: number;
  targetType?: "self" | "ally" | "enemy" | "area";
  range?: number;
  properties?: string[];
  restoreVitality?: number;
  restoreMana?: number;
  statusEffect?: {
    type: string;
    duration?: number;
    value?: number;
  };
  removeStatusEffect?: string | string[];
  weight?: number;
  value?: number;
};

export const consumablePresets: Record<string, ConsumablePreset> = {
  // Healing items
  healingPotion: { 
    name: "Healing Potion", 
    effect: "Restores 4 vitality", 
    restoreVitality: 4,
    targetType: "self", 
    properties: ["magical"], 
    weight: 1, 
    value: 4 
  },
  
  manaPotion: { 
    name: "Mana Potion", 
    effect: "Restores 4 mana", 
    restoreMana: 4,
    targetType: "self", 
    properties: ["magical"], 
    weight: 1, 
    value: 6 
  },
  
  // Antidotes and cures
  antidote: { 
    name: "Antidote", 
    effect: "Cures poison and restores 1 vitality", 
    targetType: "self", 
    removeStatusEffect: "poison",
    restoreVitality: 1,
    weight: 0.5, 
    value: 30 
  },
  
  // Combat enhancers
  strengthPotion: { 
    name: "Strength Potion", 
    effect: "+2 strength for 3 turns", 
    targetType: "self", 
    properties: ["magical"], 
    statusEffect: {
      type: "strength",
      duration: 3,
      value: 2
    },
    weight: 0.5, 
    value: 60 
  },
  speedPotion: { 
    name: "Speed Potion", 
    effect: "+2 move/agility for 3 turns", 
    targetType: "self", 
    properties: ["magical"], 
    statusEffect: {
      type: "speed",
      duration: 3,
      value: 2
    },
    weight: 0.5, 
    value: 60 
  },
  heroicPotion: { 
    name: "Heroic Potion", 
    effect: "+1 action for 2 turns", 
    targetType: "self", 
    properties: ["magical"], 
    statusEffect: {
      type: "heroism",
      duration: 2,
      value: 1
    },
    weight: 0.5, 
    value: 60 
  },
  
  // Utility items
  torch: { 
    name: "Torch", 
    effect: "Provides light in dark areas", 
    charges: 1, 
    targetType: "self", 
    properties: ["light"], 
    weight: 1, 
    value: 1 
  },
  rope: { 
    name: "Rope", 
    effect: "50 feet of sturdy rope", 
    charges: 1, 
    targetType: "self", 
    weight: 10, 
    value: 1 
  },
  lockpick: { 
    name: "Lockpick", 
    effect: "Attempt to pick a lock", 
    charges: 1, 
    targetType: "self", 
    weight: 0.1, 
    value: 10 
  },
  
  acidVial: { 
    name: "Acid Vial", 
    effect: "Deals 3 acid damage and may damage armor", 
    targetType: "enemy", 
    range: 2, 
    properties: ["thrown", "corrosive"], 
    weight: 1, 
    value: 25 
  },
  
  // Food and sustenance
  bread: { 
    name: "Bread", 
    effect: "Restores 1 HP and removes hunger", 
    restoreVitality: 1,
    targetType: "self", 
    weight: 0.5, 
    value: 2 
  },
  ale: { 
    name: "Ale", 
    effect: "Restores 1 HP, may cause intoxication", 
    restoreVitality: 1,
    targetType: "self", 
    properties: ["intoxicating"], 
    weight: 1, 
    value: 2 
  }
};
