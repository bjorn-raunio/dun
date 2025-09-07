import { STATUS_EFFECT_PRESETS } from '../statusEffects';
import { DiceRoll, isDoubles } from '../utils';
import { CombatEventData } from '../utils/combat/execution';
import { Skill, SkillType } from './types';

// --- Skill Presets ---
export const SKILL_PRESETS: { [key: string]: Skill } = {
  // Combat Skills
  "ambush": {
    name: "Ambush",
    type: "combat",
    description: "reroll first miss when winning initiative",
  },
  "dirtyFighter": {
    name: "Dirty Fighter",
    type: "combat",
    description: "stun on doubles during an attack",
    combatTriggers: [
      {
        events: ["onHitRoll", "onDefendRoll"],
        type: "melee",
        effect: (data: CombatEventData) => {
          if (data.target.size < 4) {
            data.target.addStatusEffect(STATUS_EFFECT_PRESETS.stunned.createEffect());
          }
        },
        validator: (roll: DiceRoll) => {
          return isDoubles(roll.dice);
        }
      }
    ]
  },

  // Stealth Skills
  "scout": {
    name: "Scout",
    type: "stealth",
    description: "",
  },
  "skulk": {
    name: "Skulk",
    type: "stealth",
    description: "",
  },
  "stealth": {
    name: "Stealth",
    type: "stealth",
    description: "",
  },

  // Academic Skills
  "battleWizard": {
    name: "Battle Wizard",
    type: "academic",
    description: "",
  },
  "ironWill": {
    name: "Iron Will",
    type: "academic",
    description: "+1 courage",
    attributeModifiers: [
      { attribute: "courage", value: 1 }
    ]
  },
  "mislead": {
    name: "Mislead",
    type: "academic",
    description: ""
  },
  "secretsOfMagic": {
    name: "Secrets of Magic",
    type: "academic",
    description: ""
  },
  "tamingAnimals": {
    name: "Taming Animals",
    type: "academic",
    description: "",
  },

  // Natural Skills
  "crystalBody": {
    name: "Crystal Body",
    type: "natural",
    description: "",
  },
  "lostInTheDark": {
    name: "Lost In The Dark",
    type: "natural",
    description: "-1 to all attributes in darkness",
    darkVision: -1
  },
  "sharpSenses": {
    name: "Sharp Senses",
    type: "natural",
    description: "+1 perception",
    attributeModifiers: [
      { attribute: "perception", value: 1 }
    ]
  },
  "small": {
    name: "Small",
    type: "natural",
    description: ""
  },
  "undead": {
    name: "Undead",
    type: "natural",
    description: "",
    darkVision: 1
  },
};

// --- Skill Type Groups ---
export const COMBAT_SKILLS = Object.values(SKILL_PRESETS).filter(skill => skill.type === "combat");
export const STEALTH_SKILLS = Object.values(SKILL_PRESETS).filter(skill => skill.type === "stealth");
export const ACADEMIC_SKILLS = Object.values(SKILL_PRESETS).filter(skill => skill.type === "academic");
export const NATURAL_SKILLS = Object.values(SKILL_PRESETS).filter(skill => skill.type === "natural");

// --- Helper Functions ---
export function getSkillByName(name: string): Skill | undefined {
  return SKILL_PRESETS[name];
}

export function getSkillsByType(type: SkillType): Skill[] {
  return Object.values(SKILL_PRESETS).filter(skill => skill.type === type);
}

export function getAllSkills(): Skill[] {
  return Object.values(SKILL_PRESETS);
}
