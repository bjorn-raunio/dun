import { Skill } from "../../../skills";
import { SpellSchool } from "../../../spells/spellSchool";

export class Profession {
  readonly name: string;
  readonly skills: Skill[];
  readonly spellSchools?: SpellSchool[];
  readonly startingSpells?: number;
  readonly castsWithCourage: boolean;

  constructor({ name, skills, spellSchools, startingSpells, castsWithCourage }: { name: string, skills: Skill[], spellSchools?: SpellSchool[], startingSpells?: number, castsWithCourage?: boolean }) {
    this.name = name;
    this.skills = skills;
    this.spellSchools = spellSchools;
    this.startingSpells = startingSpells;
    this.castsWithCourage = castsWithCourage ?? false;
  }
}