import { SKILL_PRESETS } from "../../../skills/presets";
import { Profession } from "./profession";

const PROFESSIONS: { [key: string]: Profession } = {
  "forester": new Profession("Forester", [SKILL_PRESETS.battleWizard, SKILL_PRESETS.tamingAnimals, SKILL_PRESETS.scout]),
  "rogue": new Profession("Rogue", [SKILL_PRESETS.mislead, SKILL_PRESETS.skulk]),
  "warriorMonk": new Profession("Warrior monk", []),
  "wizard": new Profession("Wizard", [SKILL_PRESETS.secretsOfMagic]),
};

export default PROFESSIONS;