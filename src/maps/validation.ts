import { MapDefinition } from './types';
import { Hero, CREATURE_GROUPS } from '../creatures/index';
import { getRandomElement } from '../utils/dice';

// --- Map Validation and Utility Functions ---

/**
 * Check if a position is a valid starting tile for heroes
 */
export function isValidStartingTile(mapDefinition: MapDefinition, x: number, y: number): boolean {
  return mapDefinition.startingTiles.some(tile => tile.x === x && tile.y === y);
}

/**
 * Get all available starting tiles (not occupied by creatures)
 */
export function getAvailableStartingTiles(mapDefinition: MapDefinition): Array<{ x: number; y: number; name?: string }> {
  const occupiedPositions = new Set(
    mapDefinition.creatures.map(creature => `${creature.x},${creature.y}`)
  );
  
  return mapDefinition.startingTiles.filter(tile => 
    !occupiedPositions.has(`${tile.x},${tile.y}`)
  );
}

/**
 * Get a random available starting position
 */
export function getRandomStartingPosition(mapDefinition: MapDefinition): { x: number; y: number; name?: string } | null {
  const available = getAvailableStartingTiles(mapDefinition);
  return getRandomElement(available) || null;
}

/**
 * Validate that all heroes are placed on valid starting tiles
 */
export function validateHeroStartingPositions(mapDefinition: MapDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const heroes = mapDefinition.creatures.filter(creature => 
    creature.group === CREATURE_GROUPS.PLAYER || creature instanceof Hero
  );
  
  for (const hero of heroes) {
    // Skip heroes that are not on the map (undefined position)
    if (hero.x === undefined || hero.y === undefined) {
      continue;
    }
    
    if (!isValidStartingTile(mapDefinition, hero.x, hero.y)) {
      errors.push(`${hero.name} is not placed on a valid starting tile (${hero.x}, ${hero.y})`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate that a map has at least one starting tile
 */
export function validateMapHasStartingTiles(mapDefinition: MapDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!mapDefinition.startingTiles || mapDefinition.startingTiles.length === 0) {
    errors.push("Map must have at least one starting tile for heroes");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate the entire map definition
 */
export function validateMapDefinition(mapDefinition: MapDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for starting tiles
  const startingTilesValidation = validateMapHasStartingTiles(mapDefinition);
  errors.push(...startingTilesValidation.errors);
  
  // Check hero starting positions
  const heroPositionsValidation = validateHeroStartingPositions(mapDefinition);
  errors.push(...heroPositionsValidation.errors);
  
  return {
    valid: errors.length === 0,
    errors
  };
}
