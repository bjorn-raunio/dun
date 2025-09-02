import { Creature } from './base';
import { ICreatureMovement } from './interfaces';
import { PathfindingSystem } from '../utils/pathfinding';
import {
  isInZoneOfControl,
  getEngagingCreatures
} from '../utils/zoneOfControl';
import { updateCombatStates } from '../utils/combatStateUtils';
import { calculateMovementCost } from '../utils/movement';
import { MovementResult, MovementStatus } from '../utils/movement';
import { QuestMap } from '../maps/types';
import { logMovement } from '../utils';
import { CreaturePositionOrUndefined } from './types';

// Movement and pathfinding logic for creatures
export class CreatureMovement implements ICreatureMovement {
  // Calculate reachable tiles for this creature
  getReachableTiles(
    creature: Creature,
    allCreatures: Creature[],
    mapDefinition: QuestMap,
    cols: number,
    rows: number
  ): { tiles: Array<{ x: number; y: number }>; costMap: Map<string, number>; pathMap: Map<string, Array<{ x: number; y: number }>> } {
    if (creature.x !== undefined && creature.y !== undefined) {
      return PathfindingSystem.getReachableTiles(
        creature,
        allCreatures,
        cols,
        rows,
        mapDefinition,
        { considerEngagement: true },
      );
    } else if (mapDefinition) {
      const tiles = mapDefinition.startingTiles.map(tile => ({ x: tile.x, y: tile.y }));
      const dist = new Map<string, number>();
      const pathMap = new Map<string, Array<{ x: number; y: number }>>();
      tiles.forEach(tile => {
        const key = PathfindingSystem.createKey(tile.x, tile.y);
        dist.set(key, 0);
        pathMap.set(key, [{ x: tile.x, y: tile.y }]);
      });
      return { tiles: tiles, costMap: dist, pathMap: pathMap };
    }
    return { tiles: [], costMap: new Map(), pathMap: new Map() };
  }

  // Move creature through a sequence of adjacent tiles (prevents teleporting)
  moveTo(creature: Creature, path: Array<{ x: number; y: number }>, allCreatures: Creature[] = [], mapDefinition?: QuestMap): MovementResult {
    if (path.length === 0) {
      return {
        status: 'failed',
        message: 'No path provided',
        cost: 0,
        tilesMoved: 0,
        totalPathLength: 0
      };
    }
    // Validate that the path starts from the creature's current position
    const startTile = path[0];
    if (creature.x !== undefined && creature.y !== undefined && (startTile.x !== creature.x || startTile.y !== creature.y)) {
      return {
        status: 'failed',
        message: `Path must start from creature's current position (${creature.x}, ${creature.y}), but starts at (${startTile.x}, ${startTile.y})`,
        cost: 0,
        tilesMoved: 0,
        totalPathLength: path.length - 1
      };
    }

    let totalCost = 0;
    let currentX = creature.x;
    let currentY = creature.y;
    let tilesMoved = 0;

    // Move through each tile in the path sequentially
    for (let i = 1; i < path.length; i++) {
      const currentTile = path[i - 1];
      const nextTile = path[i];

      // Validate that tiles are adjacent (including diagonal)
      const dx = Math.abs(nextTile.x - currentTile.x);
      const dy = Math.abs(nextTile.y - currentTile.y);
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1) || (dx === 0 && dy === 0)) {
        // Valid adjacent movement (orthogonal or diagonal)
      } else {
        return {
          status: 'failed',
          message: `Invalid path: tiles (${currentTile.x}, ${currentTile.y}) and (${nextTile.x}, ${nextTile.y}) are not adjacent`,
          cost: totalCost,
          tilesMoved,
          totalPathLength: path.length - 1
        };
      }

      let stepCost = 0;
      if (currentX !== undefined && currentY !== undefined) {
        // Calculate movement cost for this step if map data is available
        stepCost = 1; // Default cost
        if (mapDefinition) {
          stepCost = calculateMovementCost(
            currentX,
            currentY,
            nextTile.x,
            nextTile.y,
            allCreatures,
            mapDefinition,
            {
              areaDimensions: { w: creature.mapWidth, h: creature.mapHeight },
              mapDimensions: { cols: mapDefinition.tiles[0]?.length || 0, rows: mapDefinition.tiles.length || 0 }
            },
            creature
          );

          // If movement is blocked, stop here
          if (stepCost === Infinity) {
            break;
          }
        }
      }

      // Check if creature has enough movement points for this step
      if (creature.remainingMovement < stepCost) {
        break;
      }

      // Check if we're currently engaged
      const engagingCreatures = getEngagingCreatures(creature, allCreatures, true);
      const currentlyEngaged = engagingCreatures.length > 0;
      if (currentlyEngaged) {
        // We're engaged - check if we can move to the next position
        if (startTile.x !== creature.x || startTile.y !== creature.y) {
          break;
        }
      }

      // Face the direction of movement
      creature.faceTowards(nextTile.x, nextTile.y);

      // Update combat states for all creatures
      updateCombatStates(allCreatures);

      // Move to the next position
      creature.x = nextTile.x;
      creature.y = nextTile.y;

      // Update current position for next iteration
      currentX = nextTile.x;
      currentY = nextTile.y;

      // Apply movement cost
      creature.useMovement(stepCost);
      totalCost += stepCost;
      tilesMoved++;

      // Check if creature has run out of movement points
      if (creature.remainingMovement <= 0) {
        break;
      }
    }
    
    // Determine if movement was complete or partial
    const totalPathLength = path.length - 1; // Exclude starting position
    let status: MovementStatus = 'success';
    let message: string | undefined;
    if (tilesMoved === 0) {
      status = 'failed';
      message = `${creature.name} couldn't move at all along the path (${totalPathLength} tiles)`;
    } else if (tilesMoved < totalPathLength) {
      status = 'partial';
      message = `${creature.name} moved ${tilesMoved} tiles but couldn't complete the full path (${totalPathLength} tiles)`;
    }

    return {
      status,
      message,
      cost: totalCost,
      finalPosition: { x: creature.x!, y: creature.y! },
      intendedDestination: path[path.length - 1],
      tilesMoved,
      totalPathLength
    };
  }
}