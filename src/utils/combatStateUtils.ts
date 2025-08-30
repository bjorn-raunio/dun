import { Creature } from '../creatures/index';

/**
 * Update combat states for all creatures based on their positions and enemies
 * A creature is considered to be in combat when an enemy is within 12 tiles
 */
export function updateCombatStates(creatures: Creature[]): void {
  creatures.forEach(creature => {
    creature.updateCombatState(creatures);
  });
}

/**
 * Get all creatures that are currently in combat
 */
export function getCreaturesInCombat(creatures: Creature[]): Creature[] {
  return creatures.filter(creature => creature.getCombatState());
}

/**
 * Check if any creatures are in combat
 */
export function hasCreaturesInCombat(creatures: Creature[]): boolean {
  return creatures.some(creature => creature.getCombatState());
}

/**
 * Get a summary of combat states for all creatures
 */
export function getCombatStateSummary(creatures: Creature[]): {
  totalCreatures: number;
  creaturesInCombat: number;
  combatCreatures: Array<{ name: string; enemiesInRange: number }>;
} {
  const combatCreatures = getCreaturesInCombat(creatures);
  
  return {
    totalCreatures: creatures.length,
    creaturesInCombat: combatCreatures.length,
    combatCreatures: combatCreatures.map(creature => ({
      name: creature.name,
      enemiesInRange: creature.getEnemiesInCombatRange(creatures).length
    }))
  };
}
