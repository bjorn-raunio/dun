import { Creature } from '../creatures/index';
import { ValidationResult, validateArrayNotEmpty, validateArrayNoDuplicates } from './core';
import { VALIDATION_MESSAGES } from './messages';
import { rectsOverlap } from '../utils/geometry';
import { terrainHeightAt } from '../maps/mapRenderer';

/**
 * Validate map dimensions
 */
export function validateMapDimensions(mapData: { tiles: string[][] }): ValidationResult {
  if (!mapData.tiles || mapData.tiles.length === 0) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.MAP_DIMENSIONS_INVALID(0, 0)
    };
  }
  
  const height = mapData.tiles.length;
  const width = mapData.tiles[0]?.length || 0;
  
  if (width === 0 || height === 0) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.MAP_DIMENSIONS_INVALID(width, height)
    };
  }
  
  return { isValid: true };
}

/**
 * Validate that all creatures are within map bounds
 */
export function validateCreaturePositions(creatures: Creature[], mapData: { tiles: string[][] }): ValidationResult {
  const height = mapData.tiles.length;
  const width = mapData.tiles[0]?.length || 0;
  
  for (const creature of creatures) {
    if (creature.x < 0 || creature.x >= width || creature.y < 0 || creature.y >= height) {
      return {
        isValid: false,
        reason: VALIDATION_MESSAGES.CREATURE_OUTSIDE_BOUNDS(creature.name)
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate that no living creatures are overlapping
 */
export function validateCreaturesNoOverlap(creatures: Creature[]): ValidationResult {
  for (let i = 0; i < creatures.length; i++) {
    for (let j = i + 1; j < creatures.length; j++) {
      const creature1 = creatures[i];
      const creature2 = creatures[j];
      
      if (creature1.isDead() || creature2.isDead()) continue; // Dead creatures don't block
      
      if (rectsOverlap(
        creature1.x, creature1.y, creature1.mapWidth, creature1.mapHeight,
        creature2.x, creature2.y, creature2.mapWidth, creature2.mapHeight
      )) {
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
 * Validate that all creature IDs are unique
 */
export function validateCreatureIdsUnique(creatures: Creature[]): ValidationResult {
  const ids = creatures.map(c => c.id);
  const uniqueIds = new Set(ids);
  
  if (uniqueIds.size !== ids.length) {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.DUPLICATE_IDS(duplicates)
    };
  }
  
  return { isValid: true };
}

/**
 * Validate that turn order includes all living creatures
 */
export function validateTurnOrderComplete(creatures: Creature[], turnOrder: string[]): ValidationResult {
  const livingIds = creatures.filter(c => c.isAlive()).map(c => c.id);
  const missing = livingIds.filter(id => !turnOrder.includes(id));
  
  if (missing.length > 0) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.TURN_ORDER_INCOMPLETE(missing)
    };
  }
  
  return { isValid: true };
}

/**
 * Validate that turn order doesn't include dead creatures
 */
export function validateTurnOrderNoDeadCreatures(creatures: Creature[], turnOrder: string[]): ValidationResult {
  const deadIds = creatures.filter(c => c.isDead()).map(c => c.id);
  const deadInOrder = deadIds.filter(id => turnOrder.includes(id));
  
  if (deadInOrder.length > 0) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.TURN_ORDER_HAS_DEAD(deadInOrder)
    };
  }
  
  return { isValid: true };
}

/**
 * Validate that a position is standable (not occupied by creatures or terrain)
 */
export function validatePositionStandable(
  x: number, 
  y: number, 
  dimensions: { w: number; h: number }, 
  allCreatures: Creature[], 
  mapData: { tiles: string[][] }, 
  mapDefinition?: any, 
  considerCreatures: boolean = true, 
  creatureId?: string
): boolean {
  // Check map bounds
  if (x < 0 || y < 0 || x + dimensions.w > mapData.tiles[0].length || y + dimensions.h > mapData.tiles.length) {
    return false;
  }
  
  // Check terrain (if map definition provided)
  if (mapDefinition) {
    for (let dx = 0; dx < dimensions.w; dx++) {
      for (let dy = 0; dy < dimensions.h; dy++) {
        const height = terrainHeightAt(x + dx, y + dy, mapDefinition);
        if (height > 0) { // Assuming height > 0 means impassable terrain
          return false;
        }
      }
    }
  }
  
  // Check creature collisions (if enabled)
  if (considerCreatures) {
    for (const creature of allCreatures) {
      if (creature.isDead()) continue; // Dead creatures don't block
      if (creatureId && creature.id === creatureId) continue; // Don't check against self
      
      if (rectsOverlap(
        x, y, dimensions.w, dimensions.h,
        creature.x, creature.y, creature.mapWidth, creature.mapHeight
      )) {
        return false;
      }
    }
  }
  
  return true;
}
