import { StatusEffectType } from '../../statusEffects/types';

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
  removeStatusEffect?: StatusEffectType | StatusEffectType[];
  healStatusEffects?: boolean;
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
    healStatusEffects: true,
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
    removeStatusEffect: "poisoned",
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
