import { MonsterPreset } from "../presets";

export class MonsterGroup<T extends string> {
    monsters: MonsterPreset<T>[];

    constructor(monsters: MonsterPreset<T>[]) {
        this.monsters = monsters;
    }
}   

export class Faction<T extends string> extends MonsterGroup<T> {

    encounterTable: string[];

    constructor(encounterTable: string[], monsters: MonsterPreset<T>[]) {
        super(monsters);        
        this.encounterTable = encounterTable;
    }
}