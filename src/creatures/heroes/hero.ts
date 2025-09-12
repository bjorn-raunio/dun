import { Skill } from '../../skills';
import { Creature } from '../base';
import { CREATURE_GROUPS } from '../CreatureGroup';
import { CreatureConstructorParams } from '../types';
import { Profession } from './professions/profession';
import { Race } from './races/race';

type HeroConstructorParams = CreatureConstructorParams & {
  profession: Profession;
  race: Race;
};

// --- Hero Class ---
export class Hero extends Creature {
  profession: Profession;
  race: Race;

  get kind(): "hero" {
    return "hero";
  }

  constructor(params: HeroConstructorParams) {
    // Ensure hero group is set
    super({
      ...params,
      group: params.group || CREATURE_GROUPS.PLAYER,
      spellSchools: params.profession.spellSchools ?? [],
      knownSpells: params.knownSpells
    });
    this.profession = params.profession;
    this.race = params.race;
  }

  // --- Abstract Method Implementation ---
  protected createInstance(params: HeroConstructorParams): Creature {
    return new Hero(params);
  }

  // Hero-specific methods can be added here
  // For example: special abilities, experience, leveling, etc.
  get skills(): Skill[] {
    return [...this.race.skills, ...this.profession.skills, ...this._skills];
  }

  protected extendCloneParams(baseParams: any, overrides?: Partial<Hero>): any {
    return {
      ...baseParams,
      profession: overrides?.profession ?? this.profession,
      race: overrides?.race ?? this.race
    };
  }

  castsWithCourage(): boolean {
    return this.profession.castsWithCourage;
  }
}
