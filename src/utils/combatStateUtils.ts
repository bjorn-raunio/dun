import { ICreature } from '../creatures/index';
import { CreatureGroup } from '../creatures/CreatureGroup';

/**
 * Update combat states for all creature groups based on their positions and enemies
 * A group is considered to be in combat when at least one member is within 12 tiles of an enemy
 */
export function updateCombatStates(creatures: ICreature[]): void {
  // Get all unique groups
  const groups = new Set<CreatureGroup>();
  creatures.forEach(creature => {
    groups.add(creature.group);
  });

  // Update combat state for each group
  groups.forEach(group => {
    group.updateCombatState(creatures);
  });
}
