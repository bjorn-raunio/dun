import { Creature } from '../creatures/index';
import { terrainHeightAt } from '../maps/mapRenderer';
import { isCreatureAtPosition } from './pathfinding';

// --- Centralized Movement Cost Calculation Service ---

/**
 * Calculate the total movement cost for moving from one position to another
 */
export function calculateMovementCost(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  mapDefinition?: any,
  creature?: Creature
): number {
  // Base movement cost
  let cost = 1;
  
  // Check if this is a diagonal movement
  const isDiagonal = (fromX !== toX) && (fromY !== toY);
  
  // For diagonal movement, check if both adjacent cardinal directions are passable
  if (isDiagonal) {
    const horizontalX = toX;
    const horizontalY = fromY;
    const verticalX = fromX;
    const verticalY = toY;
    
    // Check if horizontal adjacent tile is passable
    const horizontalTerrainCost = getTerrainCost(horizontalX, horizontalY, mapData, mapDefinition);
    const isHorizontalBlocked = isCreatureAtPosition(horizontalX, horizontalY, allCreatures);
    
    // Check if vertical adjacent tile is passable
    const verticalTerrainCost = getTerrainCost(verticalX, verticalY, mapData, mapDefinition);
    const isVerticalBlocked = isCreatureAtPosition(verticalX, verticalY, allCreatures);
    
    // If either adjacent tile is impassable, diagonal movement is blocked
    if (horizontalTerrainCost === Infinity || isHorizontalBlocked || 
        verticalTerrainCost === Infinity || isVerticalBlocked) {
      return Infinity;
    }
  }
  
  // Check terrain cost at destination
  const terrainCost = getTerrainCost(toX, toY, mapData, mapDefinition);
  cost += terrainCost;
  
  // Check if movement is blocked by creatures
  const isBlocked = isCreatureAtPosition(toX, toY, allCreatures);
  
  if (isBlocked) {
    return Infinity; // Movement is blocked
  }
  
  if (terrainCost === Infinity) {
    return Infinity;
  }
  
  return cost;
}

/**
 * Get terrain movement cost for a tile
 */
export function getTerrainCost(x: number, y: number, mapData: { tiles: string[][] }, mapDefinition?: any): number {
  if (x < 0 || y < 0 || x >= mapData.tiles[0]?.length || y >= mapData.tiles.length) {
    return Infinity; // Out of bounds
  }
  
  const tile = mapData.tiles[y]?.[x];
  if (!tile || tile === "empty.jpg") {
    return 0; // Empty space has no additional cost
  }
  
  // Check terrain height and other properties
  if (mapDefinition) {
    const height = terrainHeightAt(x, y, mapDefinition);
    if (height > 1) {
      return Infinity; // Impassable terrain
    }
    if (height === 1) {
      return 1; // Elevated terrain costs extra
    }
  }
  
  // Default terrain cost
  return 0;
}

/**
 * Calculate the cost difference between two positions (for step-by-step movement)
 */
export function calculateCostDifference(currentCost: number, destCost: number): number {
  return Math.max(0, destCost - currentCost);
}

/**
 * Check if a creature can afford the movement cost
 */
export function canAffordMovement(creature: Creature, cost: number): boolean {
  return creature.remainingMovement >= cost;
}
