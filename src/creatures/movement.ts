import { Creature } from './base';

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
    const maxBudget = creature.remainingMovement ?? creature.movement;
    const dist = new Map<string, number>();
    const result: Array<{x: number; y: number}> = [];
    const cmp = (a: {x:number;y:number;cost:number;path:Array<{x:number;y:number}>}, b: {x:number;y:number;cost:number;path:Array<{x:number;y:number}>}) => a.cost - b.cost;
    const pq: Array<{x:number;y:number;cost:number;path:Array<{x:number;y:number}>}> = [{ 
      x: creature.x, 
      y: creature.y, 
      cost: 0, 
      path: [{x: creature.x, y: creature.y}]
    }];
    dist.set(`${creature.x},${creature.y}`, 0);

    const directions = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1],
    ];

    const selectedDims = (creature.size >= 3) ? { w: 2, h: 2 } : { w: 1, h: 1 };

    while (pq.length) {
      // Pop min-cost
      pq.sort(cmp);
      const current = pq.shift()!;
      if (current.cost > maxBudget) continue;
      // Don't add start position to result
      if (!(current.x === creature.x && current.y === creature.y)) {
        result.push({ x: current.x, y: current.y });
      }
      
      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        // Corner rule for diagonal movement
        if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
          // Check if diagonal movement should be blocked by terrain
          const sideA = this.areaStats(current.x + dx, current.y, selectedDims, mapData, cols, rows, mapDefinition);
          const sideB = this.areaStats(current.x, current.y + dy, selectedDims, mapData, cols, rows, mapDefinition);
          const destStats = this.areaStats(nx, ny, selectedDims, mapData, cols, rows, mapDefinition);
          const currentStats = this.areaStats(current.x, current.y, selectedDims, mapData, cols, rows, mapDefinition);
          
          // Allow diagonal movement if:
          // 1. Moving into terrain (destination has terrain)
          // 2. Standing on terrain of equal or greater height than the blocking terrain
          const movingIntoTerrain = destStats.maxH >= 1;
          const standingOnEqualOrHigherTerrain = currentStats.maxH >= Math.max(sideA.maxH, sideB.maxH);
          
          // Block diagonal movement if either side has terrain AND we're not moving into terrain AND we're not standing on equal/higher terrain
          const sideABlocks = sideA.maxH >= 1;
          const sideBBlocks = sideB.maxH >= 1;
          if ((sideABlocks || sideBBlocks) && !movingIntoTerrain && !standingOnEqualOrHigherTerrain) continue;
        }

        // Cost and passability (including not overlapping other creatures)
        const stepCost = this.moveCostInto(nx, ny, selectedDims, mapData, cols, rows, mapDefinition);
        if (!isFinite(stepCost)) continue;
        if (!this.areaStandable(nx, ny, selectedDims, true, allCreatures, cols, rows, mapData, mapDefinition)) continue;
        
        // Check engagement restrictions
        const engagingCreatures = creature.getEngagingCreatures(allCreatures);
        const wouldBecomeEngaged = allCreatures.some(c => 
          c !== creature && 
          c.isAlive() && 
          creature.isHostileTo(c) && 
          c.isInZoneOfControl(nx, ny)
        );
        
        if (engagingCreatures.length > 0 || wouldBecomeEngaged) {
          // If currently engaged, we can only move within the zone of control of ALL currently engaging creatures
          if (engagingCreatures.length > 0) {
            // Check if the destination is within the zone of control of ALL currently engaging creatures
            const canMoveToWhenEngaged = engagingCreatures.every(engager => 
              engager.isInZoneOfControl(nx, ny)
            );
            if (!canMoveToWhenEngaged) continue;
            
            // When engaged, can only move to adjacent tiles
            const isAdjacent = Math.abs(nx - current.x) <= 1 && Math.abs(ny - current.y) <= 1;
            if (!isAdjacent) continue;
            
            // If engaged, can only move one tile per round
            if (creature.hasMovedWhileEngaged) continue;
            
            // When engaged, limit movement to only one step from current position
            if (current.cost > 0) continue;
          } else if (wouldBecomeEngaged) {
            // We're not currently engaged, but would become engaged at this destination
            // This is allowed - we can move into engagement
            const isAdjacent = Math.abs(nx - current.x) <= 1 && Math.abs(ny - current.y) <= 1;
            if (!isAdjacent) continue;
          }
        }
        
        // Check if the complete path to this tile passes through hostile zones of control
        const newPath = [...current.path, {x: nx, y: ny}];
        
        // Check if any step in the path would put us in engagement
        let wouldBecomeEngagedDuringPath = false;
        for (let i = 1; i < newPath.length; i++) {
          const pathStep = newPath[i];
          const wouldBeEngagedAtStep = allCreatures.some(c => 
            c !== creature && 
            c.isAlive() && 
            creature.isHostileTo(c) && 
            c.isInZoneOfControl(pathStep.x, pathStep.y)
          );
          if (wouldBeEngagedAtStep) {
            wouldBecomeEngagedDuringPath = true;
            break;
          }
        }
        
        // If we would become engaged during the path, check if we can move through hostile zones
        if (wouldBecomeEngagedDuringPath) {
          // Check if the path passes through hostile zones without ending in them
          const pathBlockedByHostileZOC = allCreatures.some(c => 
            c !== creature && 
            c.isAlive() && 
            creature.isHostileTo(c) && 
            // Check if the complete path passes through this creature's zone
            this.pathPassesThroughZoneOfControl(current.x, current.y, nx, ny, c)
          );
          
          if (pathBlockedByHostileZOC) {
            continue; // Path is blocked by hostile zone of control
          }
        }
        
        const newCost = current.cost + stepCost;
        if (newCost > maxBudget) continue;
        const key = `${nx},${ny}`;
        if (newCost < (dist.get(key) ?? Infinity)) {
          dist.set(key, newCost);
          pq.push({ x: nx, y: ny, cost: newCost, path: newPath });
        }
      }
    }

    return { tiles: result, costMap: dist };
  }

  // Helper method to check if a path passes through a creature's zone of control
  private static pathPassesThroughZoneOfControl(fromX: number, fromY: number, toX: number, toY: number, creature: Creature): boolean {
    // Get the creature's zone of control range
    const zoneRange = creature.getZoneOfControlRange();
    
    // Check if start or end point is in the zone
    const startInZone = Math.abs(fromX - creature.x) <= zoneRange && Math.abs(fromY - creature.y) <= zoneRange;
    const endInZone = Math.abs(toX - creature.x) <= zoneRange && Math.abs(toY - creature.y) <= zoneRange;
    
    // If the destination is in the zone, allow the movement (this will trigger engagement)
    if (endInZone) {
      return false; // Allow movement into the zone
    }
    
    // If the start is in the zone, this is movement within engagement - allow it
    if (startInZone) {
      return false; // Allow movement within the zone
    }
    
    // Check if the path passes through the zone without ending in it
    // We'll check multiple points along the path to ensure we catch all intersections
    const steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const checkX = Math.floor(fromX + (toX - fromX) * t);
      const checkY = Math.floor(fromY + (toY - fromY) * t);
      
      const pointInZone = Math.abs(checkX - creature.x) <= zoneRange && Math.abs(checkY - creature.y) <= zoneRange;
      if (pointInZone) {
        return true; // Path passes through zone
      }
    }
    
    return false; // Path does not pass through zone
  }

  // Helper method to get area stats
  private static areaStats(tx: number, ty: number, dims: {w: number; h: number}, mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: any) {
    let maxH = 0;
    let hasEmpty = false;
    if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) return { maxH: Infinity, hasEmpty: true };
    for (let oy = 0; oy < dims.h; oy++) {
      for (let ox = 0; ox < dims.w; ox++) {
        const cx = tx + ox;
        const cy = ty + oy;
        const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
        if (!nonEmpty) hasEmpty = true;
        const th = this.terrainHeightAt(cx, cy, mapData, mapDefinition);
        if (th > maxH) maxH = th;
      }
    }
    return { maxH, hasEmpty };
  }

  // Helper method to check if area is standable
  private static areaStandable(tx: number, ty: number, dims: {w: number; h: number}, considerCreatures: boolean, allCreatures: Creature[], cols: number, rows: number, mapData?: { tiles: string[][] }, mapDefinition?: any): boolean {
    if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) return false;
    let hasStandTile = false;
    for (let oy = 0; oy < dims.h; oy++) {
      for (let ox = 0; ox < dims.w; ox++) {
        const cx = tx + ox;
        const cy = ty + oy;
        const nonEmpty = mapData ? (mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg") : true;
        const th = this.terrainHeightAt(cx, cy, mapData || { tiles: [] }, mapDefinition);
        if (th > 1) return false; // Terrain with height > 1 blocks movement
        if (nonEmpty && th <= 1) {
          hasStandTile = true;
        }
      }
    }
    if (!hasStandTile) return false;
    if (considerCreatures) {
      for (const c of allCreatures) {
        if (c.isDead()) continue; // Skip dead creatures
        const cdims = (c.size >= 3) ? { w: 2, h: 2 } : { w: 1, h: 1 };
        if (this.rectsOverlap(tx, ty, dims.w, dims.h, c.x, c.y, cdims.w, cdims.h)) return false;
      }
    }
    return true;
  }

  // Helper method to calculate movement cost
  private static moveCostInto(tx: number, ty: number, dims: {w: number; h: number}, mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: any): number {
    if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) return Infinity;
    let hasStandTile = false;
    let extra = 0;
    for (let oy = 0; oy < dims.h; oy++) {
      for (let ox = 0; ox < dims.w; ox++) {
        const cx = tx + ox;
        const cy = ty + oy;
        const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
        const th = this.terrainHeightAt(cx, cy, mapData, mapDefinition);
        if (th > 1) return Infinity; // Terrain with height > 1 blocks movement
        if (nonEmpty) hasStandTile = true;
        if (th === 1) extra = 1; // If any tile is height 1, costs +1
      }
    }
    if (!hasStandTile) return Infinity;
    return 1 + extra;
  }

  // Helper method to get terrain height
  private static terrainHeightAt(cx: number, cy: number, mapData: { tiles: string[][] }, mapDefinition?: any): number {
    // Use the proper terrain height calculation if mapDefinition is available
    if (mapDefinition) {
      const { terrainHeightAt } = require('../maps/mapRenderer');
      return terrainHeightAt(cx, cy, mapDefinition);
    }
    
    // Fallback to simplified calculation
    if (cx < 0 || cy < 0 || cx >= mapData.tiles[0]?.length || cy >= mapData.tiles.length) return 0;
    const tile = mapData.tiles[cy]?.[cx];
    if (!tile || tile === "empty.jpg") return 0;
    
    // For now, return 0 for ground level
    // In a full implementation, this would check room heights and terrain features
    return 0;
  }

  // Helper method to check rectangle overlap
  private static rectsOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // Move creature to new position (with zone of control checks)
  static moveTo(creature: Creature, x: number, y: number, allCreatures: Creature[] = []): { success: boolean; message?: string } {
    // Check if we're currently engaged
    const currentlyEngaged = creature.getEngagingCreatures(allCreatures).length > 0;
    
    if (currentlyEngaged) {
      // We're engaged - check if we can move to the new position
      const engagingCreatures = creature.getEngagingCreatures(allCreatures);
      if (!creature.canMoveToWhenEngaged(x, y, engagingCreatures)) {
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
        c.isInZoneOfControl(x, y)
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
