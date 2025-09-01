import { ICreature } from '../../creatures/index';
import { GameActions, GameRefs } from '../../game/types';
import { MapDefinition } from '../../maps/types';
import { findCreatureById } from '../../utils/pathfinding';
import { executeMovement } from '../../game/movement';
import { calculateCostDifference } from '../../utils/movementCost';
import { logMovement, logGame } from '../../utils/logging';

// Simplified interfaces for better readability
interface ReachableData {
  tiles: Array<{ x: number; y: number }>;
  costMap: Map<string, number>;
  pathMap: Map<string, Array<{ x: number; y: number }>>;
}

interface MapData {
  tiles: string[][];
}

interface MovementParams {
  selectedCreatureId: string;
  targetX: number;
  targetY: number;
  creatures: ICreature[];
  reachable: ReachableData;
  mapData: MapData;
  mapDefinition?: MapDefinition;
}

export interface MovementHandlers {
  handleMovement: (params: MovementParams) => boolean;
}

export function createMovementHandlers(gameActions: GameActions, gameRefs: GameRefs): MovementHandlers {
  const { setCreatures, setReachableKey, setTargetsInRangeKey } = gameActions;
  const { lastMovement } = gameRefs;

  // Helper function to check if movement is reachable
  function isDestinationReachable(reachable: ReachableData, targetX: number, targetY: number): boolean {
    const reachableKeySet = new Set(reachable.tiles.map(t => `${t.x},${t.y}`));
    return reachableKeySet.has(`${targetX},${targetY}`);
  }

  // Helper function to validate and get fresh path if needed
  function getValidPath(
    creature: ICreature,
    reachable: ReachableData,
    targetX: number,
    targetY: number,
    mapData: MapData,
    mapDefinition?: MapDefinition
  ): Array<{ x: number; y: number }> | undefined {
    const destKey = `${targetX},${targetY}`;
    let path = reachable.pathMap.get(destKey);

    if (!path) {
      console.error(`No path found for destination (${targetX}, ${targetY})`);
      return undefined;
    }

    // Check if path is stale and recalculate if needed
    if (path.length > 0 && (path[0].x !== creature.x || path[0].y !== creature.y)) {
      console.warn(`Path is stale - recalculating from (${creature.x}, ${creature.y})`);
      
      const freshReachable = creature.getReachableTiles(
        [], // We'll get creatures from the current state
        mapData,
        mapData.tiles[0].length,
        mapData.tiles.length,
        mapDefinition
      );
      
      path = freshReachable.pathMap.get(destKey);
      if (!path) {
        console.error(`No fresh path found for destination (${targetX}, ${targetY})`);
        return undefined;
      }
    }

    return path;
  }

  // Helper function to calculate movement cost
  function calculateMovementCost(
    creature: ICreature,
    reachable: ReachableData,
    targetX: number,
    targetY: number
  ): number {
    const currentCost = reachable.costMap.get(`${creature.x},${creature.y}`) ?? 0;
    const destCost = reachable.costMap.get(`${targetX},${targetY}`) ?? 0;
    return calculateCostDifference(currentCost, destCost);
  }

  // Helper function to check for duplicate movement
  function isDuplicateMovement(
    creatureId: string,
    targetX: number,
    targetY: number
  ): boolean {
    return !!(lastMovement.current &&
      lastMovement.current.creatureId === creatureId &&
      lastMovement.current.x === targetX &&
      lastMovement.current.y === targetY);
  }

  // Helper function to update last movement reference
  function updateLastMovement(creatureId: string, targetX: number, targetY: number): void {
    lastMovement.current = { creatureId, x: targetX, y: targetY };
  }

  // Helper function to force recalculation of game state
  function forceRecalculation(): void {
    setReachableKey(prev => prev + 1);
    setTargetsInRangeKey(prev => prev + 1);
  }

  function handleMovement(params: MovementParams): boolean {
    const { selectedCreatureId, targetX, targetY, creatures, reachable, mapData, mapDefinition } = params;

    // Find selected creature once
    const selected = findCreatureById(creatures, selectedCreatureId);
    if (!selected || !selected.isPlayerControlled()) {
      return false;
    }

    // Check if destination is reachable
    if (!isDestinationReachable(reachable, targetX, targetY)) {
      return false;
    }

    // Get valid path
    const path = getValidPath(selected, reachable, targetX, targetY, mapData, mapDefinition);
    if (!path) {
      return false;
    }

    // Calculate movement cost
    const stepCost = calculateMovementCost(selected, reachable, targetX, targetY);

    // Log movement details
    logMovement(`Hero at (${selected.x},${selected.y}) moving to (${targetX},${targetY})`, {
      path,
      stepCost,
      remainingMovement: selected.remainingMovement
    });

    setCreatures(prev => {
      // Check for duplicate movement
      if (isDuplicateMovement(selectedCreatureId, targetX, targetY)) {
        logMovement(`Skipping duplicate movement to (${targetX},${targetY})`);
        return prev;
      }

      const targetCreature = findCreatureById(prev, selectedCreatureId);
      if (!targetCreature) return prev;

      // Execute movement
      const moveResult = executeMovement(targetCreature, path, prev, stepCost, mapData, mapDefinition);
      
      if (moveResult.status === 'success' || moveResult.status === 'partial') {
        const statusText = moveResult.status === 'partial' ? 'partial' : 'complete';
        logMovement(`${statusText} movement: cost ${moveResult.cost}, moved ${moveResult.tilesMoved}/${moveResult.totalPathLength} tiles, remaining: ${targetCreature.remainingMovement}`);

        // Update last movement reference
        updateLastMovement(selectedCreatureId, targetX, targetY);

        // Check engagement status
        const isEngaged = targetCreature.isEngagedWithAll(prev);
        if (isEngaged) {
          logGame(`${targetCreature.name} is now engaged`);
        }

      } else {
        logMovement(`Movement failed: ${moveResult.message || 'Cannot move there'}`);
      }
      return prev;
    });

    // Force recalculation
    forceRecalculation();

    return true;
  }

  return {
    handleMovement,
  };
}
