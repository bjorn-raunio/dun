import { MercenaryPreset } from './types';
import { SKILL_PRESETS } from '../../skills';

// --- Mercenary Presets ---

export const mercenaryPresets: Record<string, MercenaryPreset> = {
  civilian: {
    name: "Civilian",
    image: "creatures/civilian.png",
    attributes: {
      movement: 4,
      combat: 6,
      ranged: 2,
      strength: 2,
      agility: 2,
      courage: 2,
      intelligence: 4,
    },
    size: 2,
    inventory: [],
    equipment: {},
    vitality: 400,
    hireCost: 75,
    skills: [
      SKILL_PRESETS.lostInTheDark,
    ]
  },
};
