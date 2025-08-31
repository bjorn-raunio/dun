import { Creature } from '../creatures/index';
import { ValidationResult } from './core';
import { VALIDATION_MESSAGES } from './messages';
import { validateCreatureAlive, validateActionsRemaining } from './creature';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { terrainHeightAt } from '../maps/mapRenderer';
import { LineOfSightSystem } from '../utils/pathfinding/lineOfSight';
import { MapDefinition } from '../maps/types';

/**
 * Comprehensive combat validation - validates all aspects of an attack in one function
 */
export function validateCombat(
  attacker: Creature,
  target: Creature,
  allCreatures: Creature[],
  mapDefinition?: MapDefinition,
  mapData?: { tiles: string[][] }
): ValidationResult {
  // Basic creature state checks
  if (!attacker.isAlive()) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.CREATURE_DEAD(attacker.name, 'attack')
    };
  }

  if (!attacker.hasActionsRemaining()) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.NO_ACTIONS_REMAINING(attacker.name)
    };
  }

  // Target checks
  if (!target.isAlive()) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.TARGET_NOT_VISIBLE(target.name)
    };
  }

  if (attacker.isFriendlyTo(target)) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.FRIENDLY_FIRE(attacker.name)
    };
  }

  // Range check
  const attackRange = attacker.hasRangedWeapon() ? attacker.getMaxAttackRange() : attacker.getAttackRange();
  const distance = calculateDistanceBetween(attacker.x, attacker.y, target.x, target.y);
  
  if (distance > attackRange) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.OUT_OF_RANGE(target.name, distance, attackRange)
    };
  }

  // Line of sight check - only if map data is available
  if (mapData && mapData.tiles && mapData.tiles.length > 0) {
    const cols = mapData.tiles[0].length;
    const rows = mapData.tiles.length;
    
    if (!LineOfSightSystem.hasLineOfSight(
      attacker.x, 
      attacker.y, 
      target.x, 
      target.y, 
      mapData, 
      cols, 
      rows, 
      mapDefinition,
      { maxRange: attackRange },
      attacker,
      target,
      allCreatures
    )) {
      return {
        isValid: false,
        reason: VALIDATION_MESSAGES.TARGET_NOT_VISIBLE(target.name)
      };
    }
  }

  // Elevation check for melee attacks
  if (!attacker.hasRangedWeapon() && mapDefinition) {
    const attackerHeight = terrainHeightAt(attacker.x, attacker.y, mapDefinition);
    const targetHeight = terrainHeightAt(target.x, target.y, mapDefinition);
    const heightDifference = Math.abs(attackerHeight - targetHeight);
    
    if (heightDifference > 1) {
      return {
        isValid: false,
        reason: VALIDATION_MESSAGES.ELEVATION_DIFFERENCE_TOO_HIGH(attacker.name, target.name, heightDifference)
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate that a target is in range
 */
export function validateTargetInRange(attacker: Creature, target: Creature): ValidationResult {
  const attackRange = attacker.hasRangedWeapon() ? attacker.getMaxAttackRange() : attacker.getAttackRange();
  const distance = calculateDistanceBetween(attacker.x, attacker.y, target.x, target.y);
  
  if (distance > attackRange) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.OUT_OF_RANGE(target.name, distance, attackRange)
    };
  }
  
  return { isValid: true };
}

/**
 * Validate that a target is alive
 */
export function validateTargetAlive(target: Creature): ValidationResult {
  if (!target.isAlive()) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.TARGET_DEAD(target.name)
    };
  }
  
  return { isValid: true };
}

/**
 * Validate that the attack is not friendly fire
 */
export function validateNotFriendlyFire(attacker: Creature, target: Creature): ValidationResult {
  if (attacker.isFriendlyTo(target)) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.FRIENDLY_FIRE(attacker.name)
    };
  }
  
  return { isValid: true };
}
