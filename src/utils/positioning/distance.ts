import { Creature } from '../../creatures/index';
import { calculateDistance } from '../geometry';
import { PathfindingSystem } from '../pathfinding';
import { getTerrainCost } from '../movementCost';
import { isPositionAccessibleWithBounds } from './accessibility';

/**
 * Distance calculation options
 */
export interface DistanceOptions {
  /** Use pathfinding for accurate distance calculation */
  usePathfinding?: boolean;
  /** Map data for pathfinding calculations */
  mapData?: { tiles: string[][] };
  /** Map dimensions for bounds checking */
  cols?: number;
  rows?: number;
  /** Map definition for terrain costs */
  mapDefinition?: any;
  /** All creatures for obstacle checking */
  allCreatures?: Creature[];
  /** Cost map for path-based distance calculation */
  costMap?: Map<string, number>;
  /** Distance metric to use for simple calculations */
  metric?: 'chebyshev' | 'manhattan' | 'euclidean';
}

/**
 * Calculate distance between two positions with optional pathfinding support
 * This is the main distance calculation function - use this instead of individual functions
 */
export function calculateDistanceBetween(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  options: DistanceOptions = {}
): number {
  const { usePathfinding, mapData, cols, rows, mapDefinition, allCreatures, metric = 'chebyshev' } = options;

  // If positions are the same, distance is 0
  if (fromX === toX && fromY === toY) {
    return 0;
  }

  // Use pathfinding if requested and we have the necessary data
  if (usePathfinding && mapData && cols !== undefined && rows !== undefined && allCreatures) {
    return calculatePathDistance(fromX, fromY, toX, toY, allCreatures, mapData, cols, rows, mapDefinition);
  }

  // Fallback to simple distance calculation
  return calculateDistance(fromX, fromY, toX, toY, metric);
}

/**
 * Calculate distance from a position to a creature
 */
export function calculateDistanceToCreature(
  fromX: number,
  fromY: number,
  target: Creature,
  options: DistanceOptions = {}
): number {
  const { usePathfinding, mapData, cols, rows, mapDefinition, allCreatures, costMap, metric = 'chebyshev' } = options;

  // If we have map data and want pathfinding, use comprehensive pathfinding
  if (usePathfinding && mapData && cols !== undefined && rows !== undefined && allCreatures) {
    return calculatePathDistanceToTarget(fromX, fromY, target, allCreatures, mapData, cols, rows, mapDefinition);
  }

  // If we have a cost map, use cost-based distance
  if (costMap && allCreatures) {
    return calculateCostMapDistance(fromX, fromY, target, costMap, allCreatures, mapData, cols, rows, mapDefinition);
  }

  // Fallback to simple distance calculation
  return calculateDistance(fromX, fromY, target.x, target.y, metric);
}

/**
 * Calculate path distance between two positions using pathfinding
 */
function calculatePathDistance(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  cols: number,
  rows: number,
  mapDefinition?: any
): number {
  const path = PathfindingSystem.findPathToTarget(fromX, fromY, toX, toY, allCreatures, mapData, cols, rows, mapDefinition);
  
  if (!path || path.length === 0) {
    return Infinity; // No path found
  }
  
  return path.length;
}

/**
 * Calculate path distance to a target creature
 */
function calculatePathDistanceToTarget(
  fromX: number,
  fromY: number,
  target: Creature,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  cols: number,
  rows: number,
  mapDefinition?: any
): number {
  const path = PathfindingSystem.findPathToTarget(fromX, fromY, target.x, target.y, allCreatures, mapData, cols, rows, mapDefinition);
  
  if (!path || path.length === 0) {
    return Infinity; // No path found
  }
  
  return path.length;
}

/**
 * Calculate distance using a cost map
 */
function calculateCostMapDistance(
  fromX: number,
  fromY: number,
  target: Creature,
  costMap: Map<string, number>,
  allCreatures: Creature[],
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): number {
  const key = `${target.x},${target.y}`;
  const cost = costMap.get(key);
  
  if (cost === undefined) {
    return Infinity; // Position not reachable
  }
  
  return cost;
}

/**
 * Check if a creature can reach and attack a target this turn
 * This considers movement range and attack range
 */
export function canReachAndAttack(
  attacker: Creature,
  target: Creature,
  allCreatures?: Creature[],
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): boolean {
  // Check if attacker has actions remaining
  if (!attacker.hasActionsRemaining()) {
    return false;
  }

  // Check if target is alive and hostile
  if (target.isDead() || attacker.isFriendlyTo(target)) {
    return false;
  }

  // Calculate distance to nearest attackable position
  const distance = calculateDistanceToAttackablePosition(attacker.x, attacker.y, target, attacker, allCreatures || [], mapData, cols, rows, mapDefinition);

  // Check if target is within movement range
  const movementRange = attacker.remainingMovement;

  return distance <= movementRange;
}

/**
 * Check if a creature can attack a target immediately from current position
 */
export function canAttackImmediately(
  attacker: Creature,
  target: Creature
): boolean {
  // Check if attacker has actions remaining
  if (!attacker.hasActionsRemaining()) {
    return false;
  }

  // Check if target is alive and hostile
  if (target.isDead() || attacker.isFriendlyTo(target)) {
    return false;
  }

  // Calculate simple distance to target
  const distance = calculateDistance(attacker.x, attacker.y, target.x, target.y, 'chebyshev');
  const attackRange = attacker.getAttackRange();

  return distance <= attackRange;
}

/**
 * Calculate distance to the nearest position where a creature can attack a target
 * This is different from distance to target's position - it finds the closest position
 * within attack range of the target
 */
export function calculateDistanceToAttackablePosition(
  fromX: number,
  fromY: number,
  target: Creature,
  attacker: Creature,
  allCreatures: Creature[],
  mapData?: { tiles: string[][] },
  cols?: number,
  rows?: number,
  mapDefinition?: any
): number {
  if (!mapData || cols === undefined || rows === undefined) {
    // Fallback to simple distance calculation
    const distance = calculateDistance(fromX, fromY, target.x, target.y, 'chebyshev');
    const attackRange = attacker.getAttackRange();
    return Math.max(0, distance - attackRange);
  }

  const attackRange = attacker.getAttackRange();
  let closestDistance = Infinity;

  // Check all positions within attack range of the target
  for (let dx = -attackRange; dx <= attackRange; dx++) {
    for (let dy = -attackRange; dy <= attackRange; dy++) {
      // Skip positions outside attack range (using Chebyshev distance)
      if (Math.max(Math.abs(dx), Math.abs(dy)) > attackRange) {
        continue;
      }

      const attackX = target.x + dx;
      const attackY = target.y + dy;

      // Skip positions outside map bounds
      if (attackX < 0 || attackY < 0 || attackX >= cols || attackY >= rows) {
        continue;
      }

      // Check if this position is accessible
      if (!isPositionAccessibleWithBounds(attackX, attackY, allCreatures, mapData, cols, rows, mapDefinition)) {
        continue;
      }

      // Calculate pathfinding distance to this attackable position
      const path = PathfindingSystem.findPathToTarget(fromX, fromY, attackX, attackY, allCreatures, mapData, cols, rows, mapDefinition);
      
      if (path && path.length > 0) {
        closestDistance = Math.min(closestDistance, path.length);
      }
    }
  }

  return closestDistance === Infinity ? Infinity : closestDistance;
}
