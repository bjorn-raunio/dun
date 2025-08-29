import { Creature } from '../creatures/index';
import { ValidationResult, chainValidations, validateNonNegative, validateNotExceeding, validateRange } from './core';
import { VALIDATION_MESSAGES } from './messages';
import { isValidWeapon, isValidOffHand, isValidArmor } from '../utils/equipment';

/**
 * Validate that a creature is alive
 */
export function validateCreatureAlive(creature: Creature, action: string): ValidationResult {
  if (!creature.isAlive()) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.CREATURE_DEAD(creature.name, action)
    };
  }
  return { isValid: true };
}

/**
 * Validate that a creature has actions remaining
 */
export function validateActionsRemaining(creature: Creature): ValidationResult {
  if (!creature.hasActionsRemaining()) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.NO_ACTIONS_REMAINING(creature.name)
    };
  }
  return { isValid: true };
}

/**
 * Validate that a creature has sufficient movement points
 */
export function validateMovementPoints(creature: Creature, requiredPoints: number): ValidationResult {
  if (creature.remainingMovement < requiredPoints) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.NO_MOVEMENT_POINTS(creature.name, requiredPoints)
    };
  }
  return { isValid: true };
}

/**
 * Validate creature vitality
 */
export function validateCreatureVitality(creature: Creature): ValidationResult {
  return validateNonNegative(creature.vitality, creature.name, 'vitality');
}

/**
 * Validate creature movement points
 */
export function validateCreatureMovementPoints(creature: Creature): ValidationResult {
  const nonNegativeCheck = validateNonNegative(creature.remainingMovement, creature.name, 'movement points');
  if (!nonNegativeCheck.isValid) return nonNegativeCheck;
  
  return validateNotExceeding(creature.remainingMovement, creature.movement, creature.name, 'movement points');
}

/**
 * Validate creature action points
 */
export function validateCreatureActionPoints(creature: Creature): ValidationResult {
  const nonNegativeCheck = validateNonNegative(creature.remainingActions, creature.name, 'action points');
  if (!nonNegativeCheck.isValid) return nonNegativeCheck;
  
  return validateNotExceeding(creature.remainingActions, creature.actions, creature.name, 'action points');
}

/**
 * Validate creature size
 */
export function validateCreatureSize(creature: Creature): ValidationResult {
  return validateRange(creature.size, 1, 4, creature.name, 'size');
}

/**
 * Validate creature facing direction
 */
export function validateCreatureFacing(creature: Creature): ValidationResult {
  return validateRange(creature.facing, 0, 7, creature.name, 'facing direction');
}

/**
 * Validate creature equipment
 */
export function validateCreatureEquipment(creature: Creature): ValidationResult {
  const validations: ValidationResult[] = [];
  
  // Validate main hand
  if (creature.equipment.mainHand && !isValidWeapon(creature.equipment.mainHand)) {
    validations.push({
      isValid: false,
      reason: VALIDATION_MESSAGES.INVALID_MAIN_HAND(creature.name)
    });
  }

  // Validate off hand
  if (creature.equipment.offHand && !isValidOffHand(creature.equipment.offHand)) {
    validations.push({
      isValid: false,
      reason: VALIDATION_MESSAGES.INVALID_OFF_HAND(creature.name)
    });
  }

  // Validate armor
  if (creature.equipment.armor && !isValidArmor(creature.equipment.armor)) {
    validations.push({
      isValid: false,
      reason: VALIDATION_MESSAGES.INVALID_ARMOR(creature.name)
    });
  }
  
  return chainValidations(...validations);
}

/**
 * Get all living creatures from an array
 */
export function getLivingCreatures(creatures: Creature[]): Creature[] {
  return creatures.filter(c => c.isAlive());
}

/**
 * Get all dead creatures from an array
 */
export function getDeadCreatures(creatures: Creature[]): Creature[] {
  return creatures.filter(c => c.isDead());
}

/**
 * Get IDs of all living creatures
 */
export function getLivingCreatureIds(creatures: Creature[]): string[] {
  return creatures.filter(c => c.isAlive()).map(c => c.id);
}

/**
 * Get IDs of all dead creatures
 */
export function getDeadCreatureIds(creatures: Creature[]): string[] {
  return creatures.filter(c => c.isDead()).map(c => c.id);
}
