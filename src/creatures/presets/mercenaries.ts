import { MercenaryPreset } from './types';
import { SKILL_PRESETS } from './skills';

// --- Mercenary Presets ---

export const mercenaryPresets: Record<string, MercenaryPreset> = {
  civilian: {
    name: "Civilian",
    image: "creatures/civilian.png",
    attributes: {
      movement: 8,
      combat: 3,
      ranged: 5,
      strength: 2,
      agility: 3,
      courage: 1,
      intelligence: 2,
    },
    size: 2,
    inventory: [],
    equipment: {},
    vitality: 4,
    hireCost: 75,
    skills: [
      SKILL_PRESETS.lostInTheDark,
    ]
  },
};
