import { CreatureGroup } from './CreatureGroup';
import { Creature } from './index';
import { ICreatureRelationshipsManager, ICreature } from './interfaces';

// --- Creature Relationships Management ---

export class CreatureRelationshipsManager implements ICreatureRelationshipsManager {
  private group: CreatureGroup;
  constructor(group: CreatureGroup) {
    this.group = group;
  }

  // --- Group System Methods ---

  isPlayerControlled(): boolean {
    return this.group.isPlayerControlled();
  }

  isAIControlled(): boolean {
    return this.group.isAIControlled();
  }

  // --- Hostility and Friendship ---

  isHostileTo(otherGroup: CreatureGroup): boolean {
    return this.group.isHostileTo(otherGroup);
  }

  isFriendlyTo(otherGroup: CreatureGroup): boolean {
    return this.group.isFriendlyTo(otherGroup);
  }

  // --- Creature Filtering ---

  getHostileCreatures(allCreatures: ICreature[]): ICreature[] {
    return this.group.getHostileCreatures(allCreatures);
  }

  getFriendlyCreatures(allCreatures: ICreature[]): ICreature[] {
    return this.group.getFriendlyCreatures(allCreatures);
  }

  // --- Engagement Logic ---

  isEngaged(hostileCreatures: ICreature[], positionX: number, positionY: number, zoneOfControlRange: number): boolean {
    return false; // placeholder
  }

  getEngagingCreatures(allCreatures: ICreature[], positionX: number, positionY: number, zoneOfControlRange: number): ICreature[] {
    // Find all hostile creatures in our zone of control
    return [];
  }

  isInZoneOfControl(x: number, y: number, creature: Creature, zoneOfControlRange: number): boolean {
    if (creature.x === undefined || creature.y === undefined) {
      return false;
    }
    const distance = Math.max(Math.abs(x - creature.x), Math.abs(y - creature.y));
    return distance <= zoneOfControlRange;
  }
}
