import { Creature } from './base';
import { PathfindingSystem } from '../utils/pathfinding';
import { 
  isInZoneOfControl, 
  getEngagingCreatures,
  canMoveToWhenEngaged
} from '../utils/zoneOfControl';

// Movement and pathfinding logic for creatures
export class CreatureMovement {
  // Calculate reachable tiles for this creature
  static getReachableTiles(
    creature: Creature, 
    allCreatures: Creature[], 
    mapData: { tiles: string[][] }, 
    cols: number, 
    rows: number, 
    mapDefinition?: any
  ): { tiles: Array<{x: number; y: number}>; costMap: Map<string, number> } {
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





  // Move creature to new position (with zone of control checks)
  static moveTo(creature: Creature, x: number, y: number, allCreatures: Creature[] = []): { success: boolean; message?: string } {
    // Check if we're currently engaged
    const engagingCreatures = getEngagingCreatures(creature, allCreatures);
    const currentlyEngaged = engagingCreatures.length > 0;
    
    if (currentlyEngaged) {
      // We're engaged - check if we can move to the new position
      if (!canMoveToWhenEngaged(creature, x, y, engagingCreatures)) {
        return {
          success: false,
          message: `${creature.name} is engaged and cannot move outside the zone of control of engaging creatures.`
        };
      }
      
      // Mark that we've moved while engaged
      creature.hasMovedWhileEngaged = true;
    } else {
      // Check if moving to this position would put us in engagement
      const wouldBeEngaged = allCreatures.some(c => 
        c !== creature && 
        c.isAlive() && 
        creature.isHostileTo(c) && 
        isInZoneOfControl(x, y, c)
      );
      
      if (wouldBeEngaged) {
        // We would become engaged at this position
        // Mark that we've moved while engaged (since we're becoming engaged)
        creature.hasMovedWhileEngaged = true;
      }
    }
    
    // Face the direction of movement
    if (x !== creature.x || y !== creature.y) {
      creature.faceTowards(x, y);
    }
    
    // Update position
    creature.x = x;
    creature.y = y;
    
    return { success: true };
  }
}
