import { Skill } from "../../../skills";

export class Race {
    readonly name: string;
    readonly skills: Skill[];
  
    constructor(name: string, skills: Skill[]) {
      this.name = name;
      this.skills = skills;
    }
  }