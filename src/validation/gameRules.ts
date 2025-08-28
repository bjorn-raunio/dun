import { Creature } from '../creatures';
import { BaseValidationResult } from '../utils/types';

// --- Game Rules Validation Logic ---

export interface GameRuleValidationResult extends BaseValidationResult {}

/**
 * Validate game state consistency
 */
export function validateGameState(
  creatures: Creature[],
  mapData: { tiles: string[][] }
): GameRuleValidationResult {
  // Check for duplicate creature IDs
  const creatureIds = creatures.map(c => c.id);
  const duplicateIds = creatureIds.filter((id, index) => creatureIds.indexOf(id) !== index);
  
  if (duplicateIds.length > 0) {
    return {
      isValid: false,
      reason: `Duplicate creature IDs found: ${duplicateIds.join(', ')}`
    };
  }

  // Check for creatures outside map bounds
  for (const creature of creatures) {
    if (!isCreatureInBounds(creature, mapData)) {
      return {
        isValid: false,
        reason: `${creature.name} is outside the map boundaries.`
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
          reason: `${creature1.name} and ${creature2.name} are overlapping.`
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Check if a creature is within map bounds
 */
export function isCreatureInBounds(
  creature: Creature,
  mapData: { tiles: string[][] }
): boolean {
  const dimensions = creature.getDimensions();
  
  // Check if the creature's area is within bounds
  if (creature.x < 0 || creature.y < 0) return false;
  if (creature.x + dimensions.w > mapData.tiles[0].length) return false;
  if (creature.y + dimensions.h > mapData.tiles.length) return false;
  
  return true;
}

/**
 * Check if two creatures are overlapping
 */
export function areCreaturesOverlapping(creature1: Creature, creature2: Creature): boolean {
  const dims1 = creature1.getDimensions();
  const dims2 = creature2.getDimensions();
  
  return creature1.x < creature2.x + dims2.w &&
         creature1.x + dims1.w > creature2.x &&
         creature1.y < creature2.y + dims2.h &&
         creature1.y + dims1.h > creature2.y;
}

/**
 * Validate turn order rules
 */
export function validateTurnOrder(
  creatures: Creature[],
  turnOrder: string[]
): GameRuleValidationResult {
  // Check if all living creatures are in turn order
  const livingCreatureIds = creatures
    .filter(c => c.isAlive())
    .map(c => c.id);
  
  const missingCreatures = livingCreatureIds.filter(id => !turnOrder.includes(id));
  if (missingCreatures.length > 0) {
    return {
      isValid: false,
      reason: `Living creatures missing from turn order: ${missingCreatures.join(', ')}`
    };
  }

  // Check if dead creatures are in turn order
  const deadCreatureIds = creatures
    .filter(c => c.isDead())
    .map(c => c.id);
  
  const deadInTurnOrder = deadCreatureIds.filter(id => turnOrder.includes(id));
  if (deadInTurnOrder.length > 0) {
    return {
      isValid: false,
      reason: `Dead creatures in turn order: ${deadInTurnOrder.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Validate creature statistics
 */
export function validateCreatureStats(creature: Creature): GameRuleValidationResult {
  // Check if vitality is within valid range
  if (creature.vitality < 0) {
    return {
      isValid: false,
      reason: `${creature.name} has negative vitality.`
    };
  }

  // Check if movement points are within valid range
  if (creature.remainingMovement < 0) {
    return {
      isValid: false,
      reason: `${creature.name} has negative movement points.`
    };
  }

  if (creature.remainingMovement > creature.movement) {
    return {
      isValid: false,
      reason: `${creature.name} has more movement points than maximum.`
    };
  }

  // Check if action points are within valid range
  if (creature.remainingActions < 0) {
    return {
      isValid: false,
      reason: `${creature.name} has negative action points.`
    };
  }

  if (creature.remainingActions > creature.actions) {
    return {
      isValid: false,
      reason: `${creature.name} has more action points than maximum.`
    };
  }

  // Check if size is within valid range
  if (creature.size < 1 || creature.size > 4) {
    return {
      isValid: false,
      reason: `${creature.name} has invalid size: ${creature.size}`
    };
  }

  // Check if facing direction is within valid range
  if (creature.facing < 0 || creature.facing > 7) {
    return {
      isValid: false,
      reason: `${creature.name} has invalid facing direction: ${creature.facing}`
    };
  }

  return { isValid: true };
}

/**
 * Validate equipment rules
 */
export function validateEquipmentRules(creature: Creature): GameRuleValidationResult {
  // Check if equipment slots are valid
  if (creature.equipment.mainHand && !isValidWeapon(creature.equipment.mainHand)) {
    return {
      isValid: false,
      reason: `${creature.name} has invalid main hand equipment.`
    };
  }

  if (creature.equipment.offHand && !isValidOffHand(creature.equipment.offHand)) {
    return {
      isValid: false,
      reason: `${creature.name} has invalid off hand equipment.`
    };
  }

  if (creature.equipment.armor && !isValidArmor(creature.equipment.armor)) {
    return {
      isValid: false,
      reason: `${creature.name} has invalid armor.`
    };
  }

  return { isValid: true };
}

import { isValidWeapon, isValidOffHand, isValidArmor } from '../utils/equipment';

/**
 * Check if weapon is valid
 */
export { isValidWeapon };

/**
 * Check if off-hand item is valid
 */
export { isValidOffHand };

/**
 * Check if armor is valid
 */
export { isValidArmor };

/**
 * Validate map consistency
 */
export function validateMapConsistency(
  mapData: { tiles: string[][] },
  creatures: Creature[]
): GameRuleValidationResult {
  // Check if map has valid dimensions
  if (mapData.tiles.length === 0 || mapData.tiles[0].length === 0) {
    return {
      isValid: false,
      reason: "Map has invalid dimensions."
    };
  }

  // Check if all rows have the same length
  const expectedLength = mapData.tiles[0].length;
  for (let i = 1; i < mapData.tiles.length; i++) {
    if (mapData.tiles[i].length !== expectedLength) {
      return {
        isValid: false,
        reason: `Map row ${i} has inconsistent length.`
      };
    }
  }

  // Check if creatures are on valid tiles
  for (const creature of creatures) {
    if (creature.isDead()) continue; // Dead creatures don't need valid tiles
    
    const dimensions = creature.getDimensions();
    for (let dy = 0; dy < dimensions.h; dy++) {
      for (let dx = 0; dx < dimensions.w; dx++) {
        const tileX = creature.x + dx;
        const tileY = creature.y + dy;
        
        if (tileY >= mapData.tiles.length || tileX >= mapData.tiles[0].length) {
          return {
            isValid: false,
            reason: `${creature.name} is on an invalid tile position.`
          };
        }
        
        const tile = mapData.tiles[tileY][tileX];
        if (!tile || tile === "empty.jpg") {
          return {
            isValid: false,
            reason: `${creature.name} is on an empty tile.`
          };
        }
      }
    }
  }

  return { isValid: true };
}
