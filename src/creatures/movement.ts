import { Creature } from './base';
import { ICreatureMovement } from './interfaces';
import { PathfindingSystem } from '../utils/pathfinding';
import { 
  isInZoneOfControl, 
  getEngagingCreatures,
  canMoveToWhenEngaged
} from '../utils/zoneOfControl';
import { updateCombatStates } from '../utils/combatStateUtils';

// Movement and pathfinding logic for creatures
export class CreatureMovement implements ICreatureMovement {
  // Calculate reachable tiles for this creature
  getReachableTiles(
    creature: Creature, 
    allCreatures: Creature[], 
    mapData: { tiles: string[][] }, 
    cols: number, 
    rows: number, 
    mapDefinition?: any
  ): { tiles: Array<{x: number; y: number}>; costMap: Map<string, number>; pathMap: Map<string, Array<{x: number; y: number}>> } {
    return PathfindingSystem.getReachableTiles(
      creature,
      allCreatures,
      mapData,
      cols,
      rows,
      mapDefinition,
      { considerEngagement: true }
    );
  }

  // Move creature through a sequence of adjacent tiles (prevents teleporting)
  moveTo(creature: Creature, path: Array<{x: number; y: number}>, allCreatures: Creature[] = []): { success: boolean; message?: string } {
    if (path.length === 0) {
      return { success: false, message: "No path provided for movement." };
    }

    // Validate that the path starts from the creature's current position
    const startTile = path[0];
    if (startTile.x !== creature.x || startTile.y !== creature.y) {
      return { 
        success: false, 
        message: `Path must start from creature's current position (${creature.x}, ${creature.y}), but starts at (${startTile.x}, ${startTile.y})` 
      };
    }

    // Move through each tile in the path sequentially
    for (let i = 1; i < path.length; i++) {
      const currentTile = path[i - 1];
      const nextTile = path[i];
      
      // Validate that tiles are adjacent (including diagonal)
      const dx = Math.abs(nextTile.x - currentTile.x);
      const dy = Math.abs(nextTile.y - currentTile.y);
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1)) {
        // Valid adjacent movement (orthogonal or diagonal)
      } else {
        return { 
          success: false, 
          message: `Invalid path: tiles (${currentTile.x}, ${currentTile.y}) and (${nextTile.x}, ${nextTile.y}) are not adjacent` 
        };
      }

      // Check if we're currently engaged
      const engagingCreatures = getEngagingCreatures(creature, allCreatures);
      const currentlyEngaged = engagingCreatures.length > 0;
      
      if (currentlyEngaged) {
        // We're engaged - check if we can move to the next position
        if (!canMoveToWhenEngaged(creature, nextTile.x, nextTile.y, engagingCreatures)) {
          return {
            success: false,
            message: `${creature.name} is engaged and cannot move outside the zone of control of engaging creatures.`
          };
        }
        
        // Mark that we've moved while engaged
        creature.setMovedWhileEngaged(true);
      } else {
        // Check if moving to this position would put us in engagement
        const wouldBeEngaged = allCreatures.some(c => 
          c !== creature && 
          c.isAlive() && 
          creature.isHostileTo(c) && 
          isInZoneOfControl(nextTile.x, nextTile.y, c)
        );
        
        if (wouldBeEngaged) {
          // We would become engaged at this position
          // Mark that we've moved while engaged (since we're becoming engaged)
          creature.setMovedWhileEngaged(true);
        }
      }
      
      // Face the direction of movement
      creature.faceTowards(nextTile.x, nextTile.y);
      
      // Update combat states for all creatures
      updateCombatStates(allCreatures);
      
      // Move to the next position
      creature.x = nextTile.x;
      creature.y = nextTile.y;
    }
    
    return { success: true };
  }
}

// --- Static Methods for Backward Compatibility ---
// These are kept for existing code that uses the static methods

export const getReachableTiles = (creature: Creature, allCreatures: Creature[], mapData: any, cols: number, rows: number, mapDefinition?: any) => {
  const movement = new CreatureMovement();
  return movement.getReachableTiles(creature, allCreatures, mapData, cols, rows, mapDefinition);
};

export const moveTo = (creature: Creature, path: Array<{x: number; y: number}>, allCreatures: Creature[] = []) => {
  const movement = new CreatureMovement();
  return movement.moveTo(creature, path, allCreatures);
};
