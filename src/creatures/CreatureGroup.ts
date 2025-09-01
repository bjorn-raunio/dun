import { ICreature } from './interfaces';

// CreatureGroup class definition
export class CreatureGroup {
  static PLAYER: CreatureGroup;
  static ENEMY: CreatureGroup;
  static NEUTRAL: CreatureGroup;

  name: string;
  private creatures: ICreature[];

  constructor(name: string) {
    this.name = name;
    this.creatures = [];
  }

  getCreatures(): ICreature[] {
    return this.creatures;
  }

  getLivingCreatures(): ICreature[] {
    return this.creatures.filter(c => c.isAlive());
  }

  addCreature(creature: ICreature) {
    this.creatures.push(creature);
  }

  removeCreature(creature: ICreature) {
    this.creatures = this.creatures.filter(c => c.id !== creature.id);
  }

  static initializeGroups() {
    CreatureGroup.PLAYER = new CreatureGroup('player');
    CreatureGroup.ENEMY = new CreatureGroup('enemy');
    CreatureGroup.NEUTRAL = new CreatureGroup('neutral');
  }

  // --- Group System Methods ---

  isPlayerControlled(): boolean {
    return this === CreatureGroup.PLAYER;
  }

  isAIControlled(): boolean {
    return this === CreatureGroup.ENEMY;
  }

  // --- Hostility and Friendship ---
  isHostileTo(otherGroup: CreatureGroup): boolean {
    return !this.isFriendlyTo(otherGroup);
  }

  isFriendlyTo(otherGroup: CreatureGroup): boolean {
    return this === otherGroup;
  }

  // --- Creature Filtering ---
  getHostileCreatures(allCreatures: ICreature[]): ICreature[] {
    return allCreatures.filter((c: ICreature) => this.isHostileTo(c.group));
  }

  getFriendlyCreatures(allCreatures: ICreature[]): ICreature[] {
    return allCreatures.filter((c: ICreature) => this.isFriendlyTo(c.group));
  }

  startTurn() {
    this.creatures.forEach(creature => {
      creature.startTurn();
    });
  }

  endTurn() {
    this.creatures.forEach(creature => {
      creature.endTurn();
    });
  }
}

// Initialize static groups
CreatureGroup.initializeGroups();

// Export the static groups for backward compatibility
export const CREATURE_GROUPS = {
  PLAYER: CreatureGroup.PLAYER,
  ENEMY: CreatureGroup.ENEMY,
  NEUTRAL: CreatureGroup.NEUTRAL
};

export type CreatureGroupType = 'player' | 'enemy' | 'neutral';
