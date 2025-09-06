import { Creature, ICreature } from '../../creatures/index';
import { getCreatureDimensions, isPositionInCreatureBounds } from '../dimensions';
import { getTileCost } from '../movement';
import { DistanceOptions } from './types';
import { PathfindingSystem } from './core';
import { QuestMap } from '../../maps/types';

/**
 * Distance calculation utilities
 */
export class DistanceSystem {
  /**
   * Calculate distance between two positions with optional pathfinding support
   * This is the main distance calculation function - use this instead of individual functions
   */
  static calculateDistanceBetween(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    options: DistanceOptions = {}
  ): number {
    const { usePathfinding, cols, rows, mapDefinition, allCreatures, metric = 'chebyshev' } = options;

    // Return infinity if any position is undefined (creature not on map)
    if (fromX === undefined || fromY === undefined || toX === undefined || toY === undefined) {
      return Infinity;
    }

    // If positions are the same, distance is 0
    if (fromX === toX && fromY === toY) {
      return 0;
    }

    // Use pathfinding if requested and we have the necessary data
    if (usePathfinding && cols !== undefined && rows !== undefined && allCreatures && mapDefinition) {
      return this.calculatePathDistance(fromX, fromY, toX, toY, allCreatures, cols, rows, mapDefinition);
    }

    // Fallback to simple distance calculation
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);

    switch (metric) {
      case 'chebyshev':
        return Math.max(dx, dy);
      case 'manhattan':
        return dx + dy;
      case 'euclidean':
        return Math.sqrt(dx * dx + dy * dy);
      default:
        return Math.max(dx, dy);
    }
  }

  /**
   * Calculate distance from a position to a creature
   */
  static calculateDistanceToCreature(
    fromX: number,
    fromY: number,
    target: ICreature,
    options: DistanceOptions = {}
  ): number {
    const { usePathfinding, cols, rows, mapDefinition, allCreatures, costMap, metric = 'chebyshev' } = options;

    // Return infinity if target is not on the map (undefined position)
    if (target.x === undefined || target.y === undefined) {
      return Infinity;
    }

    // If we have map data and want pathfinding, use comprehensive pathfinding
    if (usePathfinding && cols !== undefined && rows !== undefined && allCreatures && mapDefinition) {
      return this.calculatePathDistanceToTarget(fromX, fromY, target, allCreatures, cols, rows, mapDefinition);
    }

    // If we have a cost map, use cost-based distance
    if (costMap && allCreatures && mapDefinition && cols !== undefined && rows !== undefined) {
      return this.calculateCostMapDistance(fromX, fromY, target, costMap, allCreatures, cols, rows, mapDefinition);
    }

    // Fallback to simple distance calculation
    return this.calculateDistanceBetween(fromX, fromY, target.x!, target.y!);
  }

  /**
   * Check if a creature can reach and attack a target
   */
  static canReachAndAttack(
    attacker: ICreature,
    target: ICreature,
    allCreatures: ICreature[],
    cols: number,
    rows: number,
    mapDefinition: QuestMap
  ): boolean {
    // Return false if either creature is not on the map (undefined position)
    if (attacker.x === undefined || attacker.y === undefined || 
        target.x === undefined || target.y === undefined) {
      return false;
    }

    const distance = this.calculateDistanceToCreature(attacker.x!, attacker.y!, target, {
      usePathfinding: true,
      cols,
      rows,
      mapDefinition,
      allCreatures
    });

    // Check if target is within attack range
    const attackRange = attacker.getMaxAttackRange();
    return distance <= attackRange;
  }

  /**
   * Check if a creature can attack immediately (target is adjacent)
   */
  static canAttackImmediately(
    attacker: ICreature,
    target: ICreature
  ): boolean {
    // Return false if either creature is not on the map (undefined position)
    if (attacker.x === undefined || attacker.y === undefined || 
        target.x === undefined || target.y === undefined) {
      return false;
    }
    
    const distance = this.calculateDistanceBetween(attacker.x, attacker.y, target.x, target.y);
    const attackRange = attacker.getMaxAttackRange();
    return distance <= attackRange;
  }

  /**
   * Calculate distance to an attackable position near a target
   */
  static calculateDistanceToAttackablePosition(
    fromX: number,
    fromY: number,
    target: ICreature,
    creature: ICreature,
    allCreatures: ICreature[],
    cols: number,
    rows: number,
    mapDefinition: QuestMap
  ): number {
    // Return infinity if target is not on the map (undefined position)
    if (target.x === undefined || target.y === undefined) {
      return Infinity;
    }
    
    // Always use pathfinding since we have the required parameters

    const closestPosition = this.findClosestAccessiblePositionToTarget(fromX, fromY, target, allCreatures, cols, rows, mapDefinition);

    if (!closestPosition) {
      return Infinity;
    }

    return this.calculatePathDistance(fromX, fromY, closestPosition.x, closestPosition.y, allCreatures, cols, rows, mapDefinition);
  }

  /**
   * Calculate path distance between two positions using pathfinding
   */
  private static calculatePathDistance(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    allCreatures: ICreature[],
    cols: number,
    rows: number,
    mapDefinition: QuestMap
  ): number {
    const path = PathfindingSystem.findPathToTarget(fromX, fromY, toX, toY, allCreatures, cols, rows, mapDefinition);

    if (!path || path.length === 0) {
      return Infinity; // No path found
    }

    return path.length;
  }

  /**
   * Calculate path distance to a target creature
   */
  private static calculatePathDistanceToTarget(
    fromX: number,
    fromY: number,
    target: ICreature,
    allCreatures: ICreature[],
    cols: number,
    rows: number,
    mapDefinition: QuestMap
  ): number {
    // Find the closest accessible position to the target
    const closestPosition = this.findClosestAccessiblePositionToTarget(fromX, fromY, target, allCreatures, cols, rows, mapDefinition);

    if (!closestPosition) {
      return Infinity; // No accessible position found
    }

    return this.calculatePathDistance(fromX, fromY, closestPosition.x, closestPosition.y, allCreatures, cols, rows, mapDefinition);
  }

  /**
   * Calculate distance using a cost map
   */
  private static calculateCostMapDistance(
    fromX: number,
    fromY: number,
    target: ICreature,
    costMap: Map<string, number>,
    allCreatures: ICreature[],
    cols: number,
    rows: number,
    mapDefinition: QuestMap
  ): number {
    const key = `${fromX},${fromY}`;
    const cost = costMap.get(key);

    if (cost === undefined) {
      return Infinity; // Position not reachable
    }

    return cost;
  }

  /**
   * Find the closest accessible position to a target creature
   */
  private static findClosestAccessiblePositionToTarget(
    fromX: number,
    fromY: number,
    target: ICreature,
    allCreatures: ICreature[],
    cols: number,
    rows: number,
    mapDefinition: QuestMap
  ): { x: number; y: number } | null {
    // Return null if target is not on the map (undefined position)
    if (target.x === undefined || target.y === undefined) {
      return null;
    }
    
    // Check positions around the target
    const positions = [];

    const targetDims = getCreatureDimensions(target.size);
    for (let dy = -1; dy <= targetDims.h; dy++) {
      for (let dx = -1; dx <= targetDims.w; dx++) {
        const x = target.x + dx;
        const y = target.y + dy;

        if (x >= 0 && x < cols && y >= 0 && y < rows) {
          if (this.isPositionAccessible(x, y, allCreatures, mapDefinition)) {
            positions.push({ x, y });
          }
        }
      }
    }

    if (positions.length === 0) {
      return null;
    }

    // Find the closest position
    let closest = positions[0];
    let minDistance = this.calculateDistanceBetween(fromX, fromY, closest.x, closest.y);

    for (const pos of positions) {
      const distance = this.calculateDistanceBetween(fromX, fromY, pos.x, pos.y);
      if (distance < minDistance) {
        minDistance = distance;
        closest = pos;
      }
    }

    return closest;
  }

  /**
   * Check if a position is accessible (not occupied by creatures)
   */
  static isPositionAccessible(
    x: number,
    y: number,
    allCreatures: ICreature[],
    mapDefinition: QuestMap
  ): boolean {
    // Check map bounds using mapDefinition
    if (!mapDefinition.isWithinBounds(x, y)) {
      return false;
    }

    // Check if any creature occupies this position
    for (const creature of allCreatures) {
      if (creature.isDead()) continue; // Dead creatures don't block
      
      // Skip creatures that are not on the map (undefined position)
      if (creature.x === undefined || creature.y === undefined) continue;

      if (isPositionInCreatureBounds(x, y, creature.x, creature.y, creature.size)) {
        return false;
      }
    }

    // Check terrain cost (if map definition provided)
    if (mapDefinition) {
      const terrainCost = getTileCost(x, y, mapDefinition);
      if (!isFinite(terrainCost)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a creature is at a specific position
   */
  static isCreatureAtPosition(
    x: number,
    y: number,
    allCreatures: ICreature[]
  ): boolean {
    for (const creature of allCreatures) {
      if (creature.isDead()) continue; // Dead creatures don't block
      
      // Skip creatures that are not on the map (undefined position)
      if (creature.x === undefined || creature.y === undefined) continue;

      if (isPositionInCreatureBounds(x, y, creature.x, creature.y, creature.size)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Find a creature by ID
   */
  static findCreatureById(creatures: ICreature[], id: string): ICreature | null {
    return creatures.find(creature => creature.id === id) || null;
  }
}
