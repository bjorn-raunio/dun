import { MercenaryPreset } from './types';

// --- Mercenary Presets ---

export const mercenaryPresets: Record<string, MercenaryPreset> = {
  civilian: {
    name: "Civilian",
    image: "creatures/civilian.png",
    attributes: {
      movement: 6,
      combat: 3,
      ranged: 5,
      strength: 2,
      agility: 4,
      courage: 1,
      intelligence: 2,
    },
    size: 2,
    facing: 0,
    inventory: [],
    equipment: {},
    vitality: 4,
    mana: 0,
    fortune: 1,
    hireCost: 75,
  },
  archer: {
    name: "Archer",
    image: "creatures/civilian.png",
    attributes: {
      movement: 5,
      combat: 2,
      ranged: 5,
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
    vitality: 4,
    mana: 0,
    fortune: 1,
    hireCost: 100,
  },
};
