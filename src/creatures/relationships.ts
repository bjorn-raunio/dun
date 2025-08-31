import { CreatureGroup, CREATURE_GROUPS } from './types';

// --- Creature Relationships Management ---

export class CreatureRelationshipsManager {
  constructor(private group: CreatureGroup) {}

  // --- Group System Methods ---

  isHeroGroup(): boolean {
    return this.group === CREATURE_GROUPS.PLAYER;
  }

  isPlayerControlled(): boolean {
    return this.isHeroGroup();
  }

  isAIControlled(): boolean {
    return !this.isPlayerControlled();
  }

  // --- Hostility and Friendship ---

  isHostileTo(otherGroup: CreatureGroup): boolean {
    // Creatures of the same group are not hostile to each other
    if (this.group === otherGroup) {
      return false;
    }
    
    // All other groups are hostile to each other
    return true;
  }

  isFriendlyTo(otherGroup: CreatureGroup): boolean {
    return !this.isHostileTo(otherGroup);
  }

  // --- Creature Filtering ---

  getHostileCreatures(allCreatures: any[]): any[] {
    return allCreatures.filter(creature => 
      creature !== this && 
      creature.isAlive() && 
      this.isHostileTo(creature.group)
    );
  }

  getFriendlyCreatures(allCreatures: any[]): any[] {
    return allCreatures.filter(creature => 
      creature !== this && 
      creature.isAlive() && 
      this.isFriendlyTo(creature.group)
    );
  }

  // --- Engagement Logic ---

  isEngaged(hostileCreatures: any[], positionX: number, positionY: number, zoneOfControlRange: number): boolean {
    return this.getEngagingCreatures(hostileCreatures, positionX, positionY, zoneOfControlRange).length > 0;
  }

  getEngagingCreatures(allCreatures: any[], positionX: number, positionY: number, zoneOfControlRange: number): any[] {
    // Find all hostile creatures in our zone of control
    return allCreatures.filter(creature => 
      creature !== this && 
      creature.isAlive() && 
      this.isHostileTo(creature.group) && // Must be hostile
      this.isInZoneOfControl(positionX, positionY, creature, zoneOfControlRange) // They are in our zone
    );
  }

  isInZoneOfControl(x: number, y: number, creature: any, zoneOfControlRange: number): boolean {
    const distance = Math.max(Math.abs(x - creature.x), Math.abs(y - creature.y));
    return distance <= zoneOfControlRange;
  }

  // --- Group Action Management ---

  resetGroupActions(allCreatures: any[]): void {
    const friendlyCreatures = this.getFriendlyCreatures(allCreatures);
    
    // Reset remaining movement and actions for all friendly creatures that have already acted
    friendlyCreatures.forEach(creature => {
      if (creature.hasTakenActionsThisTurn()) {
        creature.resetRemainingActions();
      }
    });
  }
}
