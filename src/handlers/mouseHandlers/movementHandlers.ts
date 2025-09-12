import { ICreature } from '../../creatures/index';
import { GameActions, GameRefs } from '../../game/types';
import { QuestMap } from '../../maps/types';
import { findCreatureById } from '../../utils/pathfinding';
import { executeMovement } from '../../utils/movement';
import { logMovement, logGame } from '../../utils/logging';
import { animationManager } from '../../animations';

// Simplified interfaces for better readability
interface ReachableData {
  tiles: Array<{ x: number; y: number }>;
  costMap: Map<string, number>;
  pathMap: Map<string, Array<{ x: number; y: number }>>;
}

interface MovementParams {
  selectedCreatureId: string;
  targetX: number;
  targetY: number;
  creatures: ICreature[];
  reachable: ReachableData;
  mapDefinition: QuestMap;
}

export interface MovementHandlers {
  handleMovement: (params: MovementParams) => Promise<boolean>;
}

export function createMovementHandlers(
  gameActions: GameActions,
  gameRefs: GameRefs
): MovementHandlers {
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
    mapDefinition: QuestMap
  ): Array<{ x: number; y: number }> | undefined {
    const destKey = `${targetX},${targetY}`;
    let path = reachable.pathMap.get(destKey);

    if (!path) {
      console.error(`No path found for destination (${targetX}, ${targetY})`);
      return undefined;
    }

    // Check if path is stale and recalculate if needed
    if (path.length > 0 && creature.x !== undefined && creature.y !== undefined && (path[0].x !== creature.x || path[0].y !== creature.y)) {
      console.warn(`Path is stale - recalculating from (${creature.x}, ${creature.y})`);
      
      const freshReachable = creature.getReachableTiles(
        [], // We'll get creatures from the current state
        mapDefinition,
        mapDefinition.tiles[0].length,
        mapDefinition.tiles.length
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
    return Math.max(0, destCost - currentCost);
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

  async function handleMovement(params: MovementParams): Promise<boolean> {
    const { selectedCreatureId, targetX, targetY, creatures, reachable, mapDefinition } = params;

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
    const path = getValidPath(selected, reachable, targetX, targetY, mapDefinition);
    if (!path) {
      return false;
    }

    // Calculate movement cost
    const stepCost = calculateMovementCost(selected, reachable, targetX, targetY);

    // Log movement details
    const positionText = selected.x !== undefined && selected.y !== undefined 
      ? `(${selected.x},${selected.y})` 
      : '(undefined, undefined)';
    logMovement(`Hero at ${positionText} moving to (${targetX},${targetY})`, {
      path,
      stepCost,
      remainingMovement: selected.remainingMovement
    });

    // Check for duplicate movement
    if (isDuplicateMovement(selectedCreatureId, targetX, targetY)) {
      logMovement(`Skipping duplicate movement to (${targetX},${targetY})`);
      return false;
    }

    // Store the original position before movement
    const originalPosition = { x: selected.x!, y: selected.y! };

    let moveResult: any = null;
    let targetCreature: ICreature | null = null;

    setCreatures(prev => {
      targetCreature = findCreatureById(prev, selectedCreatureId);
      if (!targetCreature) return prev;

      // Execute movement
      moveResult = executeMovement(targetCreature, path, prev, stepCost, mapDefinition);
      
      if (moveResult.status === 'success' || moveResult.status === 'partial') {
        const statusText = moveResult.status === 'partial' ? 'partial' : 'complete';
        logMovement(`${statusText} movement: cost ${moveResult.cost}, moved ${moveResult.tilesMoved}/${moveResult.totalPathLength} tiles, remaining: ${targetCreature.remainingMovement}`);

        // Update last movement reference
        updateLastMovement(selectedCreatureId, targetX, targetY);

      } else {
        logMovement(`Movement failed: ${moveResult.message || 'Cannot move there'}`);
      }
      return prev;
    });

    // If movement was successful, animate it
    if (moveResult && (moveResult.status === 'success' || moveResult.status === 'partial') && targetCreature) {
      // Animate the movement through each step, updating game state as we go
      await animateMovementPathWithStateUpdate(selectedCreatureId, path);
    }

    // Force recalculation
    forceRecalculation();

    return true;
  }

  // Helper function to animate movement through each step of the path
  async function animateMovementPath(creatureId: string, path: Array<{ x: number; y: number }>): Promise<void> {
    if (path.length <= 1) return;

    // Animate through each step of the path
    for (let i = 1; i < path.length; i++) {
      const currentTile = path[i - 1];
      const nextTile = path[i];

      // Add movement animation for this step
      const animationId = animationManager.addMovementAnimation(
        creatureId,
        { x: currentTile.x, y: currentTile.y },
        { x: nextTile.x, y: nextTile.y }
      );

      // Wait for animation to complete before moving to next step
      await waitForAnimation(animationId);
    }
  }

  // Helper function to animate movement and update game state as each step completes
  async function animateMovementPathWithStateUpdate(creatureId: string, path: Array<{ x: number; y: number }>): Promise<void> {
    if (path.length <= 1) return;

    // Animate through each step of the path
    for (let i = 1; i < path.length; i++) {
      const currentTile = path[i - 1];
      const nextTile = path[i];

      // Add movement animation for this step
      const animationId = animationManager.addMovementAnimation(
        creatureId,
        { x: currentTile.x, y: currentTile.y },
        { x: nextTile.x, y: nextTile.y }
      );

      // Wait for animation to complete
      await waitForAnimation(animationId);

      // Update creature position in game state after each step
      setCreatures(prev => {
        const creature = findCreatureById(prev, creatureId);
        if (creature) {
          creature.x = nextTile.x;
          creature.y = nextTile.y;
        }
        return prev;
      });
    }
  }

  // Helper function to wait for animation completion
  function waitForAnimation(animationId: string): Promise<void> {
    return new Promise((resolve) => {
      const checkAnimation = () => {
        if (animationManager.isAnimationComplete(animationId)) {
          resolve();
        } else {
          requestAnimationFrame(checkAnimation);
        }
      };
      checkAnimation();
    });
  }

  return {
    handleMovement,
  };
}
