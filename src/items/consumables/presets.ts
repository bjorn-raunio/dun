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
  dexterityPotion: { 
    name: "Dexterity Potion", 
    effect: "+1 combat/ranged/agility, +2 dexterity for 3 turns", 
    targetType: "self", 
    properties: ["magical"], 
    statusEffect: {
      type: "dexterity",
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

  // Throwing weapons
  greekFire: { 
    name: "Greek fire", 
    effect: "", 
    targetType: "self", 
    weight: 0.5, 
    value: 2 
  },

  // Food and sustenance
  provisions: { 
    name: "Pack of provisions", 
    effect: "Restores 1 vitality", 
    restoreVitality: 1,
    targetType: "self", 
    weight: 0.5, 
    value: 2 
  },
  mead: { 
    name: "Vigorous mead", 
    effect: "Restores 1 HP, gives +1 strength for 4 turns", 
    restoreVitality: 1,
    targetType: "self", 
    statusEffect: {
      type: "strength",
      duration: 4,
      value: 1
    },
    weight: 1, 
    value: 2 
  },

  // Magic
  components: {
    name: "Components for magic", 
    effect: "+2 to casting roll",
    targetType: "self", 
    weight: 2,
    value: 5
  },
};
