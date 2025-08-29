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
  guard: {
    name: "Guard",
    image: "creatures/civilian.png",
    attributes: {
      movement: 4,
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
      { type: "shield", preset: "shield" },
    ],
    equipment: {
      mainHand: { type: "weapon", preset: "sword" },
      offHand: { type: "shield", preset: "shield" },
      armor: { type: "armor", preset: "chainMail" }
    },
    vitality: 6,
    mana: 0,
    fortune: 2,
    hireCost: 125,
  },
};
