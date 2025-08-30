import { Creature } from '../../creatures/index';
import { getCreatureDimensions } from '../dimensions';
import { calculateMovementCost } from '../movementCost';
import { isInZoneOfControl, pathPassesThroughZoneOfControl, getEngagingCreatures, isAdjacentToCreature } from '../zoneOfControl';
import { PathfindingResult, PathfindingOptions, PathfindingNode } from './types';
import { MOVEMENT_DIRECTIONS, MAX_PATHFINDING_ITERATIONS, DEFAULT_MOVEMENT_OPTIONS } from './constants';
import { getAreaStats, isAreaStandable, calculateMoveCostInto, calculateHeuristic, reconstructPath } from './helpers';

/**
 * Core pathfinding system that handles A* pathfinding algorithms
 */
export class PathfindingSystem {
  /**
   * Calculate reachable tiles for a creature using A* pathfinding
   */
  static getReachableTiles(
    creature: Creature,
    allCreatures: Creature[],
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any,
    options: PathfindingOptions = {}
  ): PathfindingResult {
    const maxBudget = options.maxBudget ?? creature.remainingMovement ?? creature.movement;
    const dist = new Map<string, number>();
    const pathMap = new Map<string, Array<{ x: number; y: number }>>();
    const result: Array<{ x: number; y: number }> = [];
    
    const cmp = (a: PathfindingNode, b: PathfindingNode) => a.cost - b.cost;
    const pq: PathfindingNode[] = [{
      x: creature.x,
      y: creature.y,
      cost: 0,
      path: [{ x: creature.x, y: creature.y }]
    }];
    
    dist.set(`${creature.x},${creature.y}`, 0);
    const selectedDims = getCreatureDimensions(creature.size);

    while (pq.length) {
      // Pop min-cost
      pq.sort(cmp);
      const current = pq.shift()!;
      if (current.cost > maxBudget) continue;

      // Don't add start position to result unless explicitly requested
      if (!(current.x === creature.x && current.y === creature.y) || options.includeStartPosition) {
        result.push({ x: current.x, y: current.y });
      }

      for (const [dx, dy] of MOVEMENT_DIRECTIONS) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        // Corner rule for diagonal movement
        if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
          if (!this.canMoveDiagonally(current.x, current.y, nx, ny, selectedDims, mapData, cols, rows, mapDefinition)) {
            continue;
          }
        }

        // Cost and passability
        const stepCost = calculateMoveCostInto(nx, ny, selectedDims, mapData, cols, rows, mapDefinition, current.x, current.y);
        if (!isFinite(stepCost)) continue;
        if (!isAreaStandable(nx, ny, selectedDims, true, allCreatures, cols, rows, mapData, mapDefinition)) continue;

        // Create the new path for this tile
        const newPath = [...current.path, { x: nx, y: ny }];

        // Check engagement restrictions if enabled
        if (options.considerEngagement !== false) {
          if (!this.canMoveToPositionWhenEngaged(creature, allCreatures, nx, ny, current, newPath)) {
            continue;
          }
        }

        const newCost = current.cost + stepCost;
        if (newCost > maxBudget) continue;
        
        const key = `${nx},${ny}`;
        if (newCost < (dist.get(key) ?? Infinity)) {
          dist.set(key, newCost);
          pathMap.set(key, newPath);
          pq.push({ x: nx, y: ny, cost: newCost, path: newPath });
        }
      }
    }

    return { tiles: result, costMap: dist, pathMap };
  }

  /**
   * Find path to target using A* pathfinding
   */
  static findPathToTarget(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    allCreatures: Creature[],
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any,
    creature?: Creature
  ): Array<{ x: number; y: number }> | null {
    const openSet = new Set<string>();
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const startKey = `${startX},${startY}`;
    openSet.add(startKey);
    gScore.set(startKey, 0);
    fScore.set(startKey, calculateHeuristic(startX, startY, targetX, targetY));

    let iterations = 0;

    while (openSet.size > 0 && iterations < MAX_PATHFINDING_ITERATIONS) {
      iterations++;

      // Find the node with lowest fScore
      let currentKey = '';
      let lowestFScore = Infinity;
      for (const key of Array.from(openSet)) {
        const f = fScore.get(key) ?? Infinity;
        if (f < lowestFScore) {
          lowestFScore = f;
          currentKey = key;
        }
      }

      const [currentX, currentY] = currentKey.split(',').map(Number);

      // Check if we reached the target
      if (currentX === targetX && currentY === targetY) {
        return reconstructPath(cameFrom, currentKey);
      }

      openSet.delete(currentKey);
      closedSet.add(currentKey);

      for (const [dx, dy] of MOVEMENT_DIRECTIONS) {
        const neighborX = currentX + dx;
        const neighborY = currentY + dy;
        const neighborKey = `${neighborX},${neighborY}`;

        // Skip if already evaluated or out of bounds
        if (closedSet.has(neighborKey) ||
          neighborX < 0 || neighborY < 0 ||
          neighborX >= cols || neighborY >= rows) {
          continue;
        }

        // Calculate movement cost to this neighbor
        const stepCost = this.calculateStepCost(
          currentX, currentY, neighborX, neighborY,
          allCreatures, mapData, cols, rows, mapDefinition, creature
        );

        if (stepCost === Infinity) {
          continue; // Cannot move to this neighbor
        }

        const tentativeGScore = (gScore.get(currentKey) ?? Infinity) + stepCost;

        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        } else if (tentativeGScore >= (gScore.get(neighborKey) ?? Infinity)) {
          continue; // This path is not better
        }

        // This path is the best so far
        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + calculateHeuristic(neighborX, neighborY, targetX, targetY));
      }
    }

    // No path found
    return null;
  }

  /**
   * Calculate movement cost for a single step
   */
  static calculateStepCost(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    allCreatures: Creature[],
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any,
    creature?: Creature
  ): number {
    return calculateMovementCost(fromX, fromY, toX, toY, allCreatures, mapData, mapDefinition, DEFAULT_MOVEMENT_OPTIONS);
  }

  /**
   * Check if diagonal movement is allowed (corner rule)
   */
  private static canMoveDiagonally(
    currentX: number,
    currentY: number,
    nx: number,
    ny: number,
    selectedDims: { w: number; h: number },
    mapData: { tiles: string[][] },
    cols: number,
    rows: number,
    mapDefinition?: any
  ): boolean {
    const sideA = getAreaStats(currentX + (nx - currentX), currentY, selectedDims, mapData, cols, rows, mapDefinition);
    const sideB = getAreaStats(currentX, currentY + (ny - currentY), selectedDims, mapData, cols, rows, mapDefinition);
    const destStats = getAreaStats(nx, ny, selectedDims, mapData, cols, rows, mapDefinition);
    const currentStats = getAreaStats(currentX, currentY, selectedDims, mapData, cols, rows, mapDefinition);

    // Check if the sides block diagonal movement
    const sideABlocks = sideA.maxH >= 1;
    const sideBBlocks = sideB.maxH >= 1;

    // Allow diagonal movement if:
    // 1. Neither side blocks, OR
    // 2. Creature is standing on terrain equal to or higher than the blocking sides, OR  
    // 3. Creature is moving into terrain (climbing up)
    if ((sideABlocks || sideBBlocks) &&
      currentStats.maxH < Math.max(sideA.maxH, sideB.maxH) &&
      destStats.maxH <= currentStats.maxH) {
      return false; // Block diagonal movement
    }

    return true;
  }

  /**
   * Check if a creature can move to a position when engaged
   */
  private static canMoveToPositionWhenEngaged(
    creature: Creature,
    allCreatures: Creature[],
    nx: number,
    ny: number,
    current: PathfindingNode,
    newPath: Array<{ x: number; y: number }>
  ): boolean {
    const engagingCreatures = getEngagingCreatures(creature, allCreatures);
    const wouldBecomeEngaged = allCreatures.some(c =>
      c !== creature &&
      c.isAlive() &&
      creature.isHostileTo(c) &&
      isInZoneOfControl(nx, ny, c)
    );

    if (engagingCreatures.length > 0 || wouldBecomeEngaged) {
      if (engagingCreatures.length > 0) {
        const canMoveToWhenEngaged = engagingCreatures.every(engager =>
          isInZoneOfControl(nx, ny, engager)
        );
        if (!canMoveToWhenEngaged) return false;

        const isAdjacent = isAdjacentToCreature(nx, ny, { x: current.x, y: current.y } as Creature);
        if (!isAdjacent) return false;

        if (creature.hasMovedWhileEngaged) return false;

        if (current.cost > 0) return false;
      } else if (wouldBecomeEngaged) {
        const isAdjacent = isAdjacentToCreature(nx, ny, { x: current.x, y: current.y } as Creature);
        if (!isAdjacent) return false;
      }
    }

    // Check if the complete path to this tile passes through hostile zones of control
    let wouldBecomeEngagedDuringPath = false;
    for (let i = 1; i < newPath.length; i++) {
      const pathStep = newPath[i];
      const wouldBeEngagedAtStep = allCreatures.some(c =>
        c !== creature &&
        c.isAlive() &&
        creature.isHostileTo(c) &&
        isInZoneOfControl(pathStep.x, pathStep.y, c)
      );
      if (wouldBeEngagedAtStep) {
        wouldBecomeEngagedDuringPath = true;
        break;
      }
    }

    if (wouldBecomeEngagedDuringPath) {
      const pathBlockedByHostileZOC = allCreatures.some(c =>
        c !== creature &&
        c.isAlive() &&
        creature.isHostileTo(c) &&
        pathPassesThroughZoneOfControl(current.x, current.y, nx, ny, c)
      );

      if (pathBlockedByHostileZOC) {
        return false;
      }
    }

    return true;
  }
}
