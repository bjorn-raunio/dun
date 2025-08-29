import { Creature } from '../../creatures/index';
import { getTerrainCost } from '../movementCost';

/**
 * Find a creature by ID
 */
export function findCreatureById(creatures: Creature[], id: string): Creature | null {
  return creatures.find(creature => creature.id === id) || null;
}

/**
 * Check if a position is accessible (not occupied by creatures)
 */
export function isPositionAccessible(
  x: number, 
  y: number, 
  allCreatures: Creature[], 
  mapData: { tiles: string[][] }, 
  mapDefinition?: any
): boolean {
  // Check map bounds
  if (x < 0 || y < 0 || x >= mapData.tiles[0].length || y >= mapData.tiles.length) {
    return false;
  }
  
  // Check if any creature occupies this position
  for (const creature of allCreatures) {
    if (creature.isDead()) continue; // Dead creatures don't block
    
    if (x >= creature.x && x < creature.x + creature.mapWidth &&
        y >= creature.y && y < creature.y + creature.mapHeight) {
      return false;
    }
  }
  
  // Check terrain cost (if map definition provided)
  if (mapDefinition) {
    const terrainCost = getTerrainCost(x, y, mapData, mapDefinition);
    if (!isFinite(terrainCost)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if a position is accessible with bounds checking
 */
export function isPositionAccessibleWithBounds(
  x: number, 
  y: number, 
  allCreatures: Creature[], 
  mapData: { tiles: string[][] }, 
  cols: number, 
  rows: number, 
  mapDefinition?: any
): boolean {
  // Check map bounds
  if (x < 0 || y < 0 || x >= cols || y >= rows) {
    return false;
  }
  
  // Check if any creature occupies this position
  for (const creature of allCreatures) {
    if (creature.isDead()) continue; // Dead creatures don't block
    
    if (x >= creature.x && x < creature.x + creature.mapWidth &&
        y >= creature.y && y < creature.y + creature.mapHeight) {
      return false;
    }
  }
  
  // Check terrain cost (if map definition provided)
  if (mapDefinition) {
    const terrainCost = getTerrainCost(x, y, mapData, mapDefinition);
    if (!isFinite(terrainCost)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if a creature is at a specific position
 */
export function isCreatureAtPosition(
  x: number, 
  y: number, 
  allCreatures: Creature[]
): boolean {
  for (const creature of allCreatures) {
    if (creature.isDead()) continue; // Dead creatures don't block
    
    if (x >= creature.x && x < creature.x + creature.mapWidth &&
        y >= creature.y && y < creature.y + creature.mapHeight) {
      return true;
    }
  }
  
  return false;
}
