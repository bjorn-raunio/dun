import { ICreature } from './interfaces';
import { calculateDistanceBetween } from '../utils/pathfinding';

// CreatureGroup class definition
export class CreatureGroup {
  static PLAYER: CreatureGroup;
  static ENEMY: CreatureGroup;
  static NEUTRAL: CreatureGroup;

  name: string;
  private creatures: ICreature[];
  private _isInCombat: boolean = false;

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

  // --- Combat State Management ---
  
  /**
   * Check if any member of this group is within 12 tiles of an enemy
   */
  checkCombatState(allCreatures: ICreature[]): boolean {
    const livingCreatures = this.getLivingCreatures();
    
    for (const creature of livingCreatures) {
      const hostileCreatures = creature.getHostileCreatures(allCreatures);
      
      for (const enemy of hostileCreatures) {
        if (creature.x !== undefined && creature.y !== undefined && 
            enemy.x !== undefined && enemy.y !== undefined) {
          const distance = calculateDistanceBetween(creature.x, creature.y, enemy.x, enemy.y);
          if (distance <= 12) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Update the combat state for this group
   */
  updateCombatState(allCreatures: ICreature[]): void {
    this._isInCombat = this.checkCombatState(allCreatures);
  }

  /**
   * Get the current combat state of this group
   */
  isInCombat(): boolean {
    return this._isInCombat;
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
