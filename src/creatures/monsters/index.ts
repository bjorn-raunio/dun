import { Creature } from '../base';
import { CREATURE_GROUPS } from '../CreatureGroup';
// AIState not used directly in Monster class
import { createAIStateForCreature } from '../../ai/decisionMaking';
import { CreatureConstructorParams } from '../types';
import { MonsterPreset, MercenaryPreset } from '../presets/types';

// Re-export presets and factory
export * from './presets';
export * from './factory';
export * from './factions';

// --- Monster Class ---
export class Monster extends Creature {

  private _leader: boolean;

  get kind(): "monster" {
    return "monster";
  }

  constructor(params: CreatureConstructorParams & { preset?: MonsterPreset<any> | MercenaryPreset }) {
      
    // Ensure monster group is set (default to bandits if not specified)
    super({
      ...params,
      group: params.group || CREATURE_GROUPS.ENEMY
    });

    // Initialize AI state for the monster
    // Only pass MonsterPreset to createAIStateForCreature, not MercenaryPreset
    const monsterPreset = params.preset && 'type' in params.preset ? params.preset : undefined;
    this.setAIState(createAIStateForCreature(this, monsterPreset));
    this._leader = params.leader ?? false;
  }

  get leader(): boolean {
    return this._leader;
  }

  // --- Abstract Method Implementation ---
  protected createInstance(params: CreatureConstructorParams & { preset?: MonsterPreset<any> | MercenaryPreset }): Creature {
    return new Monster(params);
  }

}
