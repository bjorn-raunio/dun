import { SKILL_PRESETS } from "../../../skills";
import { Race } from "./race";

const RACES: { [key: string]: Race } = {
  "elf": new Race("Elf", [SKILL_PRESETS.sharpSenses]),
  "halfling": new Race("Halfling", [SKILL_PRESETS.lostInTheDark, SKILL_PRESETS.stealth, SKILL_PRESETS.small]),
  "human": new Race("Human", [SKILL_PRESETS.lostInTheDark]),
  "shardmin": new Race("Shardmin", [SKILL_PRESETS.crystalBody]),
};

export default RACES;