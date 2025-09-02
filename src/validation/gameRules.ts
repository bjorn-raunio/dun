import { Creature } from '../creatures/index';
import { BaseValidationResult } from '../utils/types';
import { isCreatureInBounds, areCreaturesOverlapping } from '../utils/geometry';
import { VALIDATION_MESSAGES } from './messages';
import { getLivingCreatureIds, getDeadCreatureIds } from './creature';
import { validateNonNegative, validateNotExceeding, validateRange } from './core';
import { QuestMap } from '../maps/types';

// --- Game Rules Validation Logic ---

export interface GameRuleValidationResult extends BaseValidationResult {}

/**
 * Validate game state consistency
 */
export function validateGameState(
  creatures: Creature[],
  mapDefinition: QuestMap
): GameRuleValidationResult {
  // Check for duplicate creature IDs using centralized utility
  const creatureIds = creatures.map(c => c.id);
  const duplicateIds = creatureIds.filter((id, index) => creatureIds.indexOf(id) !== index);
  
  if (duplicateIds.length > 0) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.DUPLICATE_IDS(duplicateIds)
    };
  }

  // Check for creatures outside map bounds
  for (const creature of creatures) {
    // Skip creatures that are not on the map (undefined position)
    if (creature.x === undefined || creature.y === undefined) {
      continue;
    }
    
    if (!isCreatureInBounds(creature, mapDefinition)) {
      return {
        isValid: false,
        reason: VALIDATION_MESSAGES.CREATURE_OUTSIDE_BOUNDS(creature.name)
      };
    }
  }

  // Check for overlapping creatures
  for (let i = 0; i < creatures.length; i++) {
    for (let j = i + 1; j < creatures.length; j++) {
      const creature1 = creatures[i];
      const creature2 = creatures[j];
      
      if (creature1.isDead() || creature2.isDead()) continue; // Dead creatures don't block
      
      if (areCreaturesOverlapping(creature1, creature2)) {
        return {
          isValid: false,
          reason: VALIDATION_MESSAGES.CREATURES_OVERLAPPING(creature1.name, creature2.name)
        };
      }
    }
  }

  return { isValid: true };
}



/**
 * Validate turn order rules
 */
export function validateTurnOrder(
  creatures: Creature[],
  turnOrder: string[]
): GameRuleValidationResult {
  // Check if all living creatures are in turn order
  const livingCreatureIds = getLivingCreatureIds(creatures);
  
  const missingCreatures = livingCreatureIds.filter(id => !turnOrder.includes(id));
  if (missingCreatures.length > 0) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.LIVING_CREATURES_MISSING(missingCreatures)
    };
  }

  // Check if dead creatures are in turn order
  const deadCreatureIds = getDeadCreatureIds(creatures);
  
  const deadInTurnOrder = deadCreatureIds.filter(id => turnOrder.includes(id));
  if (deadInTurnOrder.length > 0) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.DEAD_CREATURES_IN_TURN_ORDER(deadInTurnOrder)
    };
  }

  return { isValid: true };
}

/**
 * Validate creature statistics
 */
export function validateCreatureStats(creature: Creature): GameRuleValidationResult {
  // Use centralized validation utilities instead of duplicating logic
  
  // Check if vitality is not negative
  const vitalityCheck = validateNonNegative(creature.remainingVitality, creature.name, 'vitality');
  if (!vitalityCheck.isValid) return vitalityCheck;

  // Check if movement points are within valid range
  const movementNegativeCheck = validateNonNegative(creature.remainingMovement, creature.name, 'movement points');
  if (!movementNegativeCheck.isValid) return movementNegativeCheck;

  const movementExcessCheck = validateNotExceeding(creature.remainingMovement, creature.movement, creature.name, 'movement points');
  if (!movementExcessCheck.isValid) return movementExcessCheck;

  // Check if action points are within valid range
  const actionsNegativeCheck = validateNonNegative(creature.remainingActions, creature.name, 'action points');
  if (!actionsNegativeCheck.isValid) return actionsNegativeCheck;

  const actionsExcessCheck = validateNotExceeding(creature.remainingActions, creature.actions, creature.name, 'action points');
  if (!actionsExcessCheck.isValid) return actionsExcessCheck;

  // Check if size is within valid range (1-4)
  const sizeCheck = validateRange(creature.size, 1, 4, creature.name, 'size');
  if (!sizeCheck.isValid) return sizeCheck;

  // Check if facing direction is within valid range (0-7)
  // Skip validation if creature is not on the map (undefined position)
  if (creature.facing !== undefined) {
    const facingCheck = validateRange(creature.facing, 0, 7, creature.name, 'facing direction');
    if (!facingCheck.isValid) return facingCheck;
  }

  return { isValid: true };
}

/**
 * Validate map consistency
 */
export function validateMapConsistency(
  mapDefinition: QuestMap,
  creatures: Creature[]
): GameRuleValidationResult {
  // Check if map has valid dimensions
  if (mapDefinition.tiles.length === 0 || mapDefinition.tiles[0].length === 0) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.MAP_INVALID_DIMENSIONS(0, 0)
    };
  }

  // Check if all rows have the same length
  const expectedLength = mapDefinition.tiles[0].length;
  for (let i = 1; i < mapDefinition.tiles.length; i++) {
    if (mapDefinition.tiles[i].length !== expectedLength) {
      return {
        isValid: false,
        reason: VALIDATION_MESSAGES.MAP_INCONSISTENT_ROWS(expectedLength, mapDefinition.tiles[i].length)
      };
    }
  }

  // Check if creatures are on valid tiles
  for (const creature of creatures) {
    if (creature.isDead()) continue; // Dead creatures don't need valid tiles
    
    // Skip creatures that are not on the map (undefined position)
    if (creature.x === undefined || creature.y === undefined) {
      continue;
    }
    
    const dimensions = creature.getDimensions();
    for (let dy = 0; dy < dimensions.h; dy++) {
      for (let dx = 0; dx < dimensions.w; dx++) {
        const tileX = creature.x + dx;
        const tileY = creature.y + dy;
        
        if (tileY >= mapDefinition.tiles.length || tileX >= mapDefinition.tiles[0].length) {
          return {
            isValid: false,
            reason: VALIDATION_MESSAGES.CREATURE_INVALID_TILE(creature.name, tileX, tileY)
          };
        }
        
        const tile = mapDefinition.tiles[tileY][tileX];
        if (!tile || tile === "empty.jpg") {
          return {
            isValid: false,
            reason: VALIDATION_MESSAGES.CREATURE_EMPTY_TILE(creature.name, tileX, tileY)
          };
        }
      }
    }
  }

  return { isValid: true };
}
