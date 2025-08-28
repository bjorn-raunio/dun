import { Item, Weapon, RangedWeapon, Armor, Shield, createWeapon, createRangedWeapon, createArmor, createShield } from './items';

// --- Base Creature Class ---
export abstract class Creature {
  id: string;
  name: string;
  x: number;
  y: number;
  image?: string;
  movement: number;
  remainingMovement: number;
  actions: number;
  remainingActions: number;
  mapWidth: number;
  mapHeight: number;
  size: number; // 1=small, 2=medium, 3=large, 4=huge
  facing: number; // 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
  inventory: Item[];
  equipment: {
    mainHand?: Weapon | RangedWeapon;
    offHand?: Weapon | RangedWeapon | Shield;
    armor?: Armor;
  };
  combat: number;
  ranged: number;
  strength: number;
  agility: number;
  vitality: number;
  naturalArmor: number;
  hasMovedWhileEngaged: boolean; // Track if creature has moved while engaged this turn

  constructor(params: {
    id: string;
    name: string;
    x: number;
    y: number;
    image?: string;
    movement: number;
    actions: number;
    mapWidth?: number;
    mapHeight?: number;
    size: number; // 1=small, 2=medium, 3=large, 4=huge
    facing?: number; // 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
    inventory?: Item[];
    equipment?: {
      mainHand?: Weapon | RangedWeapon;
      offHand?: Weapon | RangedWeapon | Shield;
      armor?: Armor;
    };
    combat: number;
    ranged: number;
    strength: number;
    agility: number;
    vitality: number;
    naturalArmor?: number;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.x = params.x;
    this.y = params.y;
    this.image = params.image;
    this.movement = params.movement;
    this.remainingMovement = params.movement;
    this.actions = params.actions;
    this.remainingActions = params.actions;
    this.mapWidth = params.mapWidth ?? 1;
    this.mapHeight = params.mapHeight ?? 1;
    this.size = params.size;
    this.facing = params.facing ?? 0; // Default facing North
    this.inventory = params.inventory ?? [];
    this.equipment = params.equipment ?? {};
    this.combat = params.combat;
    this.ranged = params.ranged;
    this.strength = params.strength;
    this.agility = params.agility;
    this.vitality = params.vitality;
    this.naturalArmor = params.naturalArmor ?? 3;
    this.hasMovedWhileEngaged = false;
  }

  // Get the creature's kind (implemented by subclasses)
  abstract get kind(): "hero" | "monster";

  // Check if creature is alive
  isAlive(): boolean {
    return this.vitality > 0;
  }

  // Check if creature is dead
  isDead(): boolean {
    return this.vitality <= 0;
  }

  // Check if creature has moved this turn
  hasMoved(): boolean {
    return this.remainingMovement !== this.movement;
  }

  // Check if creature has actions remaining
  hasActionsRemaining(): boolean {
    return this.remainingActions > 0;
  }

  // Calculate reachable tiles for this creature
  getReachableTiles(allCreatures: Creature[], mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: any): { tiles: Array<{x: number; y: number}>; costMap: Map<string, number> } {
    const maxBudget = this.remainingMovement ?? this.movement;
    const dist = new Map<string, number>();
    const result: Array<{x: number; y: number}> = [];
    const cmp = (a: {x:number;y:number;cost:number;path:Array<{x:number;y:number}>}, b: {x:number;y:number;cost:number;path:Array<{x:number;y:number}>}) => a.cost - b.cost;
    const pq: Array<{x:number;y:number;cost:number;path:Array<{x:number;y:number}>}> = [{ 
      x: this.x, 
      y: this.y, 
      cost: 0, 
      path: [{x: this.x, y: this.y}]
    }];
    dist.set(`${this.x},${this.y}`, 0);

    const directions = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1],
    ];

    const selectedDims = (this.size >= 3) ? { w: 2, h: 2 } : { w: 1, h: 1 };

    while (pq.length) {
      // Pop min-cost
      pq.sort(cmp);
      const current = pq.shift()!;
      if (current.cost > maxBudget) continue;
      // Don't add start position to result
      if (!(current.x === this.x && current.y === this.y)) {
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
        const engagingCreatures = this.getEngagingCreatures(allCreatures);
        const wouldBecomeEngaged = allCreatures.some(creature => 
          creature !== this && 
          creature.isAlive() && 
          creature.kind !== this.kind && 
          creature.isInZoneOfControl(nx, ny)
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
            if (this.hasMovedWhileEngaged) continue;
            
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
          const wouldBeEngagedAtStep = allCreatures.some(creature => 
            creature !== this && 
            creature.isAlive() && 
            creature.kind !== this.kind && 
            creature.isInZoneOfControl(pathStep.x, pathStep.y)
          );
          if (wouldBeEngagedAtStep) {
            wouldBecomeEngagedDuringPath = true;
            break;
          }
        }
        
        // If we would become engaged during the path, check if we can move through hostile zones
        if (wouldBecomeEngagedDuringPath) {
          // Check if the path passes through hostile zones without ending in them
          const pathBlockedByHostileZOC = allCreatures.some(creature => 
            creature !== this && 
            creature.isAlive() && 
            creature.kind !== this.kind && 
            // Check if the complete path passes through this creature's zone
            this.pathPassesThroughZoneOfControl(current.x, current.y, nx, ny, creature)
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
  private pathPassesThroughZoneOfControl(fromX: number, fromY: number, toX: number, toY: number, creature: Creature): boolean {
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
  private areaStats(tx: number, ty: number, dims: {w: number; h: number}, mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: any) {
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
  private areaStandable(tx: number, ty: number, dims: {w: number; h: number}, considerCreatures: boolean, allCreatures: Creature[], cols: number, rows: number, mapData?: { tiles: string[][] }, mapDefinition?: any): boolean {
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
        if (c.id === this.id) continue;
        if (c.vitality <= 0) continue; // Skip dead creatures
        const cdims = (c.size >= 3) ? { w: 2, h: 2 } : { w: 1, h: 1 };
        if (this.rectsOverlap(tx, ty, dims.w, dims.h, c.x, c.y, cdims.w, cdims.h)) return false;
      }
    }
    return true;
  }

  // Helper method to calculate movement cost
  private moveCostInto(tx: number, ty: number, dims: {w: number; h: number}, mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: any): number {
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
  private terrainHeightAt(cx: number, cy: number, mapData: { tiles: string[][] }, mapDefinition?: any): number {
    // Use the proper terrain height calculation if mapDefinition is available
    if (mapDefinition) {
      const { terrainHeightAt } = require('./maps/mapRenderer');
      return terrainHeightAt(cx, cy, mapDefinition);
    }
    
    // Fallback to simplified calculation
    if (cx < 0 || cy < 0 || cx >= this.mapWidth || cy >= this.mapHeight) return 0;
    const tile = mapData.tiles[cy]?.[cx];
    if (!tile || tile === "empty.jpg") return 0;
    
    // For now, return 0 for ground level
    // In a full implementation, this would check room heights and terrain features
    return 0;
  }

  // Helper method to check rectangle overlap
  private rectsOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // Get current armor value (equipped armor or natural armor)
  getArmorValue(): number {
    const { getEffectiveArmor } = require('./utils/equipment');
    return getEffectiveArmor(this);
  }

  // Get main weapon (prioritizes main hand, then off hand)
  getMainWeapon(): Weapon | RangedWeapon | undefined {
    const { getMainWeapon } = require('./utils/equipment');
    return getMainWeapon(this);
  }

  // Check if creature has a ranged weapon equipped
  hasRangedWeapon(): boolean {
    const { hasRangedWeapon } = require('./utils/equipment');
    return hasRangedWeapon(this);
  }

  // Check if creature has a shield equipped
  hasShield(): boolean {
    const { hasShield } = require('./utils/equipment');
    return hasShield(this);
  }

  // Get attack bonus based on weapon type
  getAttackBonus(): number {
    const { getAttackBonus } = require('./utils/equipment');
    return getAttackBonus(this);
  }

  // Get weapon damage
  getWeaponDamage(): number {
    const { getWeaponDamage } = require('./utils/equipment');
    return getWeaponDamage(this);
  }

  // Get attack range
  getAttackRange(): number {
    const { getAttackRange } = require('./utils/equipment');
    return getAttackRange(this);
  }

  // Get zone of control range (default is 1 tile around the creature)
  getZoneOfControlRange(): number {
    return 1; // Can be overridden by subclasses for different creature types
  }

  // Check if a position is within this creature's zone of control
  isInZoneOfControl(x: number, y: number): boolean {
    const distance = Math.max(Math.abs(x - this.x), Math.abs(y - this.y));
    return distance <= this.getZoneOfControlRange();
  }

  // Get hostile creatures (opposite kind)
  getHostileCreatures(allCreatures: Creature[]): Creature[] {
    return allCreatures.filter(creature => 
      creature !== this && 
      creature.isAlive() && 
      creature.kind !== this.kind
    );
  }

  // Check if this creature is engaged by any hostile creatures
  isEngaged(hostileCreatures: Creature[]): boolean {
    return this.getEngagingCreatures(hostileCreatures).length > 0;
  }



  // Get all creatures that are engaging this creature
  getEngagingCreatures(allCreatures: Creature[]): Creature[] {
    // Find all hostile creatures in our zone of control
    const hostileInZone = allCreatures.filter(creature => 
      creature !== this && 
      creature.isAlive() && 
      creature.kind !== this.kind && // Must be hostile
      creature.isInZoneOfControl(this.x, this.y) // They are in our zone
    );
    
    // All hostile creatures in our zone of control engage us
    return hostileInZone;
  }

  // Check if a movement is allowed for an engaged creature
  canMoveToWhenEngaged(newX: number, newY: number, engagingCreatures: Creature[]): boolean {
    // If not engaged, movement is unrestricted
    if (engagingCreatures.length === 0) {
      return true;
    }

    // If engaged, can only move within the zone of control of engaging creatures
    const withinZoneOfControl = engagingCreatures.every(engager => 
      engager.isInZoneOfControl(newX, newY)
    );
    
    if (!withinZoneOfControl) {
      return false;
    }
    
    // If engaged, can only move one tile per round
    return !this.hasMovedWhileEngaged;
  }

  // Convenience method to check engagement status with all creatures
  isEngagedWithAll(allCreatures: Creature[]): boolean {
    const hostileCreatures = this.getHostileCreatures(allCreatures);
    return this.isEngaged(hostileCreatures);
  }

  // Get engaging creatures from all creatures
  getEngagingCreaturesFromAll(allCreatures: Creature[]): Creature[] {
    return this.getEngagingCreatures(allCreatures);
  }

  // Take damage and return new vitality
  takeDamage(damage: number): number {
    this.vitality = Math.max(0, this.vitality - damage);
    return this.vitality;
  }

  // Reset movement and actions for new turn
  resetTurn(): void {
    this.remainingMovement = this.movement;
    this.remainingActions = this.actions;
    this.hasMovedWhileEngaged = false;
  }

  // Move to new position (with zone of control checks)
  moveTo(x: number, y: number, allCreatures: Creature[] = []): { success: boolean; message?: string } {
    // Check if we're currently engaged
    const currentlyEngaged = this.getEngagingCreatures(allCreatures).length > 0;
    
    if (currentlyEngaged) {
      // We're engaged - check if we can move to the new position
      const engagingCreatures = this.getEngagingCreatures(allCreatures);
      if (!this.canMoveToWhenEngaged(x, y, engagingCreatures)) {
        return {
          success: false,
          message: `${this.name} is engaged and cannot move outside the zone of control of engaging creatures.`
        };
      }
      
      // Mark that we've moved while engaged
      this.hasMovedWhileEngaged = true;
    } else {
      // Check if moving to this position would put us in engagement
      const wouldBeEngaged = allCreatures.some(creature => 
        creature !== this && 
        creature.isAlive() && 
        creature.kind !== this.kind && 
        creature.isInZoneOfControl(x, y)
      );
      
             if (wouldBeEngaged) {
         // We would become engaged at this position
         // Mark that we've moved while engaged (since we're becoming engaged)
         this.hasMovedWhileEngaged = true;
       }
    }
    
    // Face the direction of movement
    if (x !== this.x || y !== this.y) {
      this.faceTowards(x, y);
    }
    
    // Update position
    this.x = x;
    this.y = y;
    
    return { success: true };
  }

  // Use movement points
  useMovement(points: number): void {
    this.remainingMovement = Math.max(0, this.remainingMovement - points);
  }

  // Use action
  useAction(): void {
    if (this.remainingActions > 0) {
      this.remainingActions--;
    }
  }

  // Roll 2d6 for combat
  private roll2d6(): number {
    return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  }

  // Roll Xd6 for damage calculation
  private rollXd6(count: number): number[] {
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * 6) + 1);
    }
    return results;
  }

  // Calculate melee damage using Xd6 system
  private calculateMeleeDamage(attackerStrength: number, weaponDamage: number, defenderArmor: number): { damage: number; rolls: number[]; hits: number } {
    const totalDice = attackerStrength + weaponDamage;
    const rolls = this.rollXd6(totalDice);
    const hits = rolls.filter(roll => roll >= defenderArmor).length;
    return { damage: hits, rolls, hits };
  }



  // Perform an attack against a target creature
  attack(target: Creature, allCreatures: Creature[] = []): { hit: boolean; damage: number; message: string; targetDefeated: boolean; toHitMessage?: string; damageMessage?: string } {
    // Face the target when attacking
    this.faceTowards(target.x, target.y);
    
    // Import combat logic dynamically to avoid circular dependencies
    const { executeCombat } = require('./gameLogic/combat');
    
    // Execute combat using extracted logic
    const result = executeCombat(this, target, allCreatures);
    
    return {
      hit: result.success,
      damage: result.damage,
      message: result.message,
      targetDefeated: result.targetDefeated,
      toHitMessage: result.toHitMessage,
      damageMessage: result.damageMessage
    };
  }

  // Get creature dimensions
  getDimensions(): { w: number; h: number } {
    if (this.size >= 3) { // large (3) or huge (4)
      return { w: 2, h: 2 };
    }
    return { w: 1, h: 1 };
  }

  // Get facing direction as degrees (for CSS transform)
  getFacingDegrees(): number {
    return this.facing * 45; // 0=0°, 1=45°, 2=90°, etc.
  }

  // Get facing direction as arrow character
  getFacingArrow(): string {
    const { DIRECTION_ARROWS } = require('./utils/constants');
    return DIRECTION_ARROWS[this.facing];
  }

  // Get facing direction as name
  getFacingName(): string {
    const { DIRECTION_NAMES } = require('./utils/constants');
    return DIRECTION_NAMES[this.facing];
  }

  // Get facing direction as short name
  getFacingShortName(): string {
    const { DIRECTION_SHORT_NAMES } = require('./utils/constants');
    return DIRECTION_SHORT_NAMES[this.facing];
  }

  // Change facing direction
  faceDirection(direction: number): void {
    this.facing = ((direction % 8) + 8) % 8; // Ensure 0-7 range
  }

  // Face towards a specific point
  faceTowards(targetX: number, targetY: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    
    if (dx === 0 && dy === 0) return; // Already at target
    
    // Calculate angle and convert to 8-direction facing
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const direction = Math.round((angle + 90) / 45) % 8; // +90 to align North=0
    this.faceDirection(direction);
  }

  // Clone creature (useful for creating variations)
  clone(overrides?: Partial<Creature>): Creature {
    const params = {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      image: this.image,
      movement: this.movement,
      actions: this.actions,
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      size: this.size,
      facing: this.facing,
      inventory: [...this.inventory],
      equipment: { ...this.equipment },
      combat: this.combat,
      ranged: this.ranged,
      strength: this.strength,
      agility: this.agility,
      vitality: this.vitality,
      naturalArmor: this.naturalArmor,
      hasMovedWhileEngaged: this.hasMovedWhileEngaged,
      ...overrides
    };

    if (this instanceof Hero) {
      return new Hero(params);
    } else if (this instanceof Monster) {
      return new Monster(params);
    }
    
    throw new Error("Unknown creature type");
  }
}

// --- Hero Class ---
export class Hero extends Creature {
  get kind(): "hero" {
    return "hero";
  }

  constructor(params: {
    id: string;
    name: string;
    x: number;
    y: number;
    image?: string;
    movement: number;
    actions: number;
    mapWidth?: number;
    mapHeight?: number;
    size: number; // 1=small, 2=medium, 3=large, 4=huge
    facing?: number; // 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
    inventory?: Item[];
    equipment?: {
      mainHand?: Weapon | RangedWeapon;
      offHand?: Weapon | RangedWeapon | Shield;
      armor?: Armor;
    };
    combat: number;
    ranged: number;
    strength: number;
    agility: number;
    vitality: number;
    naturalArmor?: number;
  }) {
    super(params);
  }

  // Hero-specific methods can be added here
  // For example: special abilities, experience, leveling, etc.
}

// --- Monster Class ---
export class Monster extends Creature {
  get kind(): "monster" {
    return "monster";
  }

  constructor(params: {
    id: string;
    name: string;
    x: number;
    y: number;
    image?: string;
    movement: number;
    actions: number;
    mapWidth?: number;
    mapHeight?: number;
    size: number; // 1=small, 2=medium, 3=large, 4=huge
    facing?: number; // 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
    inventory?: Item[];
    equipment?: {
      mainHand?: Weapon | RangedWeapon;
      offHand?: Weapon | RangedWeapon | Shield;
      armor?: Armor;
    };
    combat: number;
    ranged: number;
    strength: number;
    agility: number;
    vitality: number;
    naturalArmor?: number;
  }) {
    super(params);
  }

  // Monster-specific methods can be added here
  // For example: AI behavior, special abilities, etc.
  // Note: AI logic has been extracted to src/ai/ module
  // Use createAIStateForCreature() from ai/decisionMaking to create AI state
}

// --- Monster Presets and Factory Functions ---
export type MonsterPreset = {
  name: string;
  image: string;
  movement: number;
  actions: number;
  mapWidth?: number;
  mapHeight?: number;
  size: number; // 1=small, 2=medium, 3=large, 4=huge
  facing?: number; // 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
  inventory?: Array<{ type: "weapon" | "ranged_weapon" | "armor" | "shield"; preset: string; id?: string }>;
  equipment?: {
    mainHand?: { type: "weapon" | "ranged_weapon"; preset: string; id?: string };
    offHand?: { type: "weapon" | "ranged_weapon" | "shield"; preset: string; id?: string };
    armor?: { type: "armor"; preset: string; id?: string };
  };
  combat: number;
  ranged: number;
  strength: number;
  agility: number;
  vitality: number;
  naturalArmor?: number;
  aiBehavior?: string; // AI behavior type (aggressive, defensive, cautious, etc.)
};

export const monsterPresets: Record<string, MonsterPreset> = {
  bandit: {
    name: "Bandit",
    image: "creature_bandit.png",
    movement: 6,
    actions: 1,
    size: 2, // medium
    facing: 0, // North
    inventory: [
      { type: "weapon", preset: "scimitar" },
      { type: "armor", preset: "leather" }
    ],
    equipment: {
      mainHand: { type: "weapon", preset: "dagger" },
      armor: { type: "armor", preset: "leather" }
    },
    combat: 3,
    ranged: 1,
    strength: 2,
    agility: 3,
    vitality: 4,
    naturalArmor: 3,
    aiBehavior: "aggressive",
  },
  goblin: {
    name: "Goblin",
    image: "creature_bandit.png", // Using bandit image as placeholder
    movement: 7,
    actions: 1,
    size: 1, // small
    facing: 0, // North
    inventory: [
      { type: "weapon", preset: "dagger" }
    ],
    equipment: {
      mainHand: { type: "weapon", preset: "dagger" }
    },
    combat: 2,
    ranged: 1,
    strength: 1,
    agility: 4,
    vitality: 3,
    naturalArmor: 2,
    aiBehavior: "cautious",
  },
  orc: {
    name: "Orc",
    image: "creature_knight.png", // Using knight image as placeholder
    movement: 6,
    actions: 1,
    size: 2, // medium
    facing: 0, // North
    inventory: [
      { type: "weapon", preset: "broadsword" },
      { type: "armor", preset: "leather" }
    ],
    equipment: {
      mainHand: { type: "weapon", preset: "broadsword" },
      armor: { type: "armor", preset: "leather" }
    },
    combat: 4,
    ranged: 1,
    strength: 3,
    agility: 2,
    vitality: 5,
    naturalArmor: 3,
    aiBehavior: "berserker",
  },
};

export function createMonster(presetId: string, overrides?: Partial<Monster> & { id: string; x: number; y: number }): Monster {
  const p = monsterPresets[presetId];
  if (!p) {
    throw new Error(`Monster preset "${presetId}" not found`);
  }

  // Create inventory items
  const inventory: Item[] = [];
  if (p.inventory) {
    for (const itemDef of p.inventory) {
      const itemId = itemDef.id ?? `${itemDef.type}-${Math.random().toString(36).slice(2, 8)}`;
      switch (itemDef.type) {
        case "weapon":
          inventory.push(createWeapon(itemDef.preset, { id: itemId }));
          break;
        case "ranged_weapon":
          inventory.push(createRangedWeapon(itemDef.preset, { id: itemId }));
          break;
        case "armor":
          inventory.push(createArmor(itemDef.preset, { id: itemId }));
          break;
        case "shield":
          inventory.push(createShield(itemDef.preset, { id: itemId }));
          break;
      }
    }
  }

  // Create equipment
  const equipment: Monster["equipment"] = {};
  if (p.equipment) {
    if (p.equipment.mainHand) {
      const itemId = p.equipment.mainHand.id ?? `${p.equipment.mainHand.type}-${Math.random().toString(36).slice(2, 8)}`;
      if (p.equipment.mainHand.type === "weapon") {
        equipment.mainHand = createWeapon(p.equipment.mainHand.preset, { id: itemId });
      } else if (p.equipment.mainHand.type === "ranged_weapon") {
        equipment.mainHand = createRangedWeapon(p.equipment.mainHand.preset, { id: itemId });
      }
    }
    if (p.equipment.offHand) {
      const itemId = p.equipment.offHand.id ?? `${p.equipment.offHand.type}-${Math.random().toString(36).slice(2, 8)}`;
      if (p.equipment.offHand.type === "weapon") {
        equipment.offHand = createWeapon(p.equipment.offHand.preset, { id: itemId });
      } else if (p.equipment.offHand.type === "ranged_weapon") {
        equipment.offHand = createRangedWeapon(p.equipment.offHand.preset, { id: itemId });
      } else if (p.equipment.offHand.type === "shield") {
        equipment.offHand = createShield(p.equipment.offHand.preset, { id: itemId });
      }
    }
    if (p.equipment.armor) {
      const itemId = p.equipment.armor.id ?? `armor-${Math.random().toString(36).slice(2, 8)}`;
      equipment.armor = createArmor(p.equipment.armor.preset, { id: itemId });
    }
  }

  return new Monster({
    id: overrides?.id ?? `${presetId}-${Math.random().toString(36).slice(2, 8)}`,
    name: overrides?.name ?? p.name,
    x: overrides?.x ?? 0,
    y: overrides?.y ?? 0,
    image: overrides?.image ?? p.image,
    movement: overrides?.movement ?? p.movement,
    actions: overrides?.actions ?? p.actions,
    mapWidth: overrides?.mapWidth ?? p.mapWidth ?? 1,
    mapHeight: overrides?.mapHeight ?? p.mapHeight ?? 1,
    size: overrides?.size ?? p.size,
    facing: overrides?.facing ?? p.facing ?? 0,
    inventory: overrides?.inventory ?? inventory,
    equipment: overrides?.equipment ?? equipment,
    combat: overrides?.combat ?? p.combat,
    ranged: overrides?.ranged ?? p.ranged,
    strength: overrides?.strength ?? p.strength,
    agility: overrides?.agility ?? p.agility,
    vitality: overrides?.vitality ?? p.vitality,
    naturalArmor: overrides?.naturalArmor ?? p.naturalArmor ?? 3,
  });
}

// Type alias for union type
export type CreatureInstance = Hero | Monster;
