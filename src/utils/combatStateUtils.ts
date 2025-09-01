import { ICreature } from '../creatures/index';

/**
 * Update combat states for all creatures based on their positions and enemies
 * A creature is considered to be in combat when an enemy is within 12 tiles
 */
export function updateCombatStates(creatures: ICreature[]): void {
  creatures.forEach(creature => {
    creature.updateCombatState(creatures);
  });
}
