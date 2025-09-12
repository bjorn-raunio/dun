import { SKILL_PRESETS } from "../../../skills/presets";
import { SPELLS_FIRE, SPELLS_BLESSINGS } from "../../../spells/index";
import { Profession } from "./profession";

const PROFESSIONS: { [key: string]: Profession } = {
  "forester": new Profession({ 
    name: "Forester", 
    skills: [SKILL_PRESETS.battleWizard, SKILL_PRESETS.tamingAnimals, SKILL_PRESETS.scout],
    startingSpells: 2
  }),
  "rogue": new Profession({ 
    name: "Rogue", 
    skills: [SKILL_PRESETS.mislead, SKILL_PRESETS.skulk]
  }),
  "warriorMonk": new Profession({ 
    name: "Warrior monk", 
    skills: [],
    spellSchools: [SPELLS_BLESSINGS],
    startingSpells: 2,
    castsWithCourage: true
  }),
  "wizard": new Profession({ 
    name: "Wizard", 
    skills: [SKILL_PRESETS.secretsOfMagic],
    spellSchools: [SPELLS_FIRE],
    startingSpells: 4
  }),
};

export default PROFESSIONS;