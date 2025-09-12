import { Spell } from "./spell";

export class SpellSchool {
    name: string;
    spells: { [key: string]: Spell };

    constructor(params: { name: string, spells: { [key: string]: Spell } }) {
        this.name = params.name;
        this.spells = params.spells;
    }
}