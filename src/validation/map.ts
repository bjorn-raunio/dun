import { Creature, ICreature } from '../creatures/index';
import { ValidationResult, validateArrayNotEmpty, validateArrayNoDuplicates } from './core';
import { VALIDATION_MESSAGES } from './messages';
import { rectsOverlap, areCreaturesOverlapping } from '../utils/geometry';
import { terrainHeightAt } from '../maps/mapRenderer';
import { getLivingCreatureIds, getDeadCreatureIds } from './creature';
import { MapDefinition } from '../maps/types';

/**
 * Check if a tile is within any room in the map definition
 */
function isTileWithinAnyRoom(x: number, y: number, mapDefinition?: MapDefinition): boolean {
  if (!mapDefinition) {
    return false;
  }
  
  for (const room of mapDefinition.rooms) {
    if (room.isTileWithinRoom(x, y)) {
      return true;
    }
  }
  
  return false;
}

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
  const livingIds = getLivingCreatureIds(creatures);
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
  const deadIds = getDeadCreatureIds(creatures);
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
  allCreatures: ICreature[], 
  mapData: { tiles: string[][] }, 
  mapDefinition?: MapDefinition, 
  considerCreatures: boolean = true, 
  creatureId?: string
): boolean {
  // Check map bounds
  if (x < 0 || y < 0 || x + dimensions.w > mapData.tiles[0].length || y + dimensions.h > mapData.tiles.length) {
    return false;
  }
  
  // Check terrain and room validation (if map definition provided)
  if (mapDefinition) {
    let hasStandableTile = false;
    
    for (let dx = 0; dx < dimensions.w; dx++) {
      for (let dy = 0; dy < dimensions.h; dy++) {
        const cx = x + dx;
        const cy = y + dy;
        const tile = mapData.tiles[cy]?.[cx];
        const height = terrainHeightAt(cx, cy, mapDefinition);
        
        // Check if tile is empty and outside any room - this blocks movement
        if (!tile || tile === "empty.jpg") {
          if (!isTileWithinAnyRoom(cx, cy, mapDefinition)) {
            return false; // Empty tiles outside rooms block movement
          }
        }
        
        // A tile is considered standable if it's not empty OR if it's within a room
        if (tile && tile !== "empty.jpg") {
          hasStandableTile = true;
        } else if (isTileWithinAnyRoom(cx, cy, mapDefinition)) {
          hasStandableTile = true;
        }
        
        // Allow terrain up to height 1 (elevation 1) - creatures can climb up to 1 elevation
        if (height > 1) {
          return false;
        }
      }
    }
    
    // For multi-tile creatures, at least one tile must be standable
    if (dimensions.w > 1 || dimensions.h > 1) {
      if (!hasStandableTile) {
        return false;
      }
    }
  }
  
  // Check creature collisions (if enabled)
  if (considerCreatures) {
    for (const creature of allCreatures) {
      if (creature.isDead()) continue; // Dead creatures don't block
      if (creatureId && creature.id === creatureId) continue; // Don't check against self
      
      const creatureDimensions = creature.getDimensions();
      if (rectsOverlap(
        x, y, dimensions.w, dimensions.h,
        creature.x, creature.y, creatureDimensions.w, creatureDimensions.h
      )) {
        return false;
      }
    }
  }
  
  return true;
}
