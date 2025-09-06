import { Creature, ICreature } from '../creatures/index';
import { ValidationResult } from './core';
import { VALIDATION_MESSAGES } from './messages';
import { validateCreatureAlive, validateActionsRemaining } from './creature';
import { calculateDistanceBetween } from '../utils/pathfinding';

import { LineOfSightSystem } from '../utils/pathfinding/lineOfSight';
import { QuestMap } from '../maps/types';
import { isEngaged } from '../utils/zoneOfControl';
import { Weapon, RangedWeapon, BaseWeapon } from '../items';

/**
 * Comprehensive combat validation - validates all aspects of an attack in one function
 */
export function validateCombat(
  attacker: ICreature,
  target: ICreature,
  weapon: BaseWeapon,
  allCreatures: ICreature[],
  mapDefinition: QuestMap,
  attackerPosition?: { x: number, y: number },
  ignoreActions?: boolean
): ValidationResult {

  const attackerX_undefined = attackerPosition?.x || attacker.x;
  const attackerY_undefined = attackerPosition?.y || attacker.y;

  // Skip range check if either creature is not on the map (undefined position)
  if (attackerX_undefined === undefined || attackerY_undefined === undefined ||
    target.x === undefined || target.y === undefined) {
    return {
      isValid: false,
      reason: ''
    };
  }

  const attackerX = attackerX_undefined;
  const attackerY = attackerY_undefined;

  // Basic creature state checks
  if (!attacker.isAlive()) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.CREATURE_DEAD(attacker.name, 'attack')
    };
  }

  if (!ignoreActions && !attacker.hasActionsRemaining()) {
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
  const attackRange = weapon.getValidRange();

  const distance = calculateDistanceBetween(attackerX, attackerY, target.x, target.y);

  if ((distance > attackRange.max || distance < attackRange.min) && distance > 1) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.OUT_OF_RANGE(target.name, distance, attackRange.max)
    };
  }

  // Line of sight check - only if map definition is available
  if (mapDefinition && mapDefinition.tiles && mapDefinition.tiles.length > 0) {
    const cols = mapDefinition.tiles[0].length;
    const rows = mapDefinition.tiles.length;

    if (!LineOfSightSystem.hasLineOfSight(
      attackerX,
      attackerY,
      target.x,
      target.y,
      cols,
      rows,
      mapDefinition,
      { maxRange: attackRange.max },
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
  if (weapon.isMeleeWeapon() && mapDefinition) {
    const attackerHeight = mapDefinition.terrainHeightAt(attackerX, attackerY);
    const targetHeight = mapDefinition.terrainHeightAt(target.x, target.y);
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
