import { Skill } from "../../../skills";

export class Profession {
  readonly name: string;
  readonly skills: Skill[];

  constructor(name: string, skills: Skill[]) {
    this.name = name;
    this.skills = skills;
  }
}