import { Creature } from '../creatures/index';
import { StatusEffect, StatusEffectType } from './types';

/**
 * Apply a status effect to a creature
 */
export function applyStatusEffect(
  creature: Creature,
  effect: StatusEffect
): void {
  creature.addStatusEffect(effect);
}

/**
 * Remove a status effect from a creature
 */
export function removeStatusEffect(creature: Creature, type: StatusEffectType): void {
  const effect = creature.getStatusEffect(type);
  if (effect) {
    creature.removeStatusEffect(effect.id);
  }
}

/**
 * Check if a creature has a specific status effect
 */
export function hasStatusEffect(creature: Creature, type: StatusEffectType): boolean {
  return creature.hasStatusEffect(type);
}

/**
 * Get all active status effects for a creature
 */
export function getActiveStatusEffects(creature: Creature): StatusEffect[] {
  return creature.getActiveStatusEffects();
}

/**
 * Clear all status effects from a creature
 */
export function clearAllStatusEffects(creature: Creature): void {
  creature.getStatusEffectManager().clearAllEffects();
}

/**
 * Process status effects for all creatures at turn start
 */
export function processStatusEffectsForAllCreatures(creatures: Creature[]): void {
  creatures.forEach(creature => {
    if (creature.isAlive()) {
      const statusEffectManager = creature.getStatusEffectManager();
      statusEffectManager.updateEffects();
      
      // Apply turn-start effects
      const activeEffects = statusEffectManager.getAllActiveEffects();  
      activeEffects.forEach(effect => {      
        if (effect.onTurnStart) {
          effect.onTurnStart(creature);
        }
      });
    }
  });
}

/**
 * Process status effects for all creatures at turn end
 */
export function processStatusEffectsAtTurnEnd(creatures: Creature[]): void {
  creatures.forEach(creature => {
    if (creature.isAlive()) {
      const activeEffects = creature.getActiveStatusEffects();
      activeEffects.forEach(effect => {
        if (effect.onTurnEnd) {
          effect.onTurnEnd(creature);
        }
      });
    }
  });
}
