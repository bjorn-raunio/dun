import { ICreature } from '../creatures/interfaces';
import { calculateDistanceBetween } from './pathfinding';

// --- Zone of Control Utilities ---

/**
 * Helper function to check if a creature is in a valid state for zone of control calculations
 */
function isValidCreatureForZoneCheck(creature: ICreature): boolean {
  return creature.x !== undefined && creature.y !== undefined && !creature.isDead();
}

/**
 * Helper function to check if a position is within a given range of a creature
 */
function isPositionInRange(x: number, y: number, creature: ICreature, range: number): boolean {
  if (!isValidCreatureForZoneCheck(creature)) {
    return false;
  }
  const distance = calculateDistanceBetween(creature.x!, creature.y!, x, y);
  return distance <= range;
}

/**
 * Check if a position is within a creature's zone of control
 * @param x X coordinate to check
 * @param y Y coordinate to check
 * @param creature The creature whose zone of control to check
 * @param customRange Optional custom range to use instead of creature's default zone range
 */
export function isInZoneOfControl(
  x: number, 
  y: number, 
  creature: ICreature, 
  customRange?: number
): boolean {
  const range = customRange ?? creature.getZoneOfControlRange();
  return isPositionInRange(x, y, creature, range);
}

/**
 * Check if a path passes through a creature's zone of control
 * This is used to validate movement paths that shouldn't pass through hostile zones
 */
export function pathPassesThroughZoneOfControl(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  creature: ICreature
): boolean {
  const zoneRange = creature.getZoneOfControlRange();
  
  // Check if start or end point is in the zone
  const startInZone = isInZoneOfControl(fromX, fromY, creature, zoneRange);
  const endInZone = isInZoneOfControl(toX, toY, creature, zoneRange);
  
  // If the destination is in the zone, allow the movement (this will trigger engagement)
  if (endInZone) {
    return false; // Allow movement into the zone
  }
  
  // If the start is in the zone, this is movement within engagement - allow it
  if (startInZone) {
    return false; // Allow movement within the zone
  }
  
  // Check if the path passes through the zone without ending in it
  const steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const checkX = Math.floor(fromX + (toX - fromX) * t);
    const checkY = Math.floor(fromY + (toY - fromY) * t);
    
    const pointInZone = isInZoneOfControl(checkX, checkY, creature, zoneRange);
    if (pointInZone) {
      return true; // Path passes through zone
    }
  }
  
  return false; // Path does not pass through zone
}

/**
 * Check if a path passes through any hostile creature's zone of control
 */
export function pathPassesThroughHostileZones(
  creature: ICreature,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  allCreatures: ICreature[]
): { blocked: boolean; blocker?: ICreature } {
  const hostileCreatures = creature.getHostileCreatures(allCreatures);
  
  for (const hostile of hostileCreatures) {
    if (pathPassesThroughZoneOfControl(fromX, fromY, toX, toY, hostile)) {
      return { blocked: true, blocker: hostile };
    }
  }
  
  return { blocked: false };
}

/**
 * Get all creatures that are engaging a given creature
 */
export function getEngagingCreatures(creature: ICreature, allCreatures: ICreature[], ignoreEngaged: boolean = false): ICreature[] {
  // Return empty array if creature is not on the map (undefined position)
  if (!isValidCreatureForZoneCheck(creature)) {
    return [];
  }
  
  return getEngagingCreaturesAtPosition(creature, allCreatures, creature.x!, creature.y!, ignoreEngaged);
}

export function getEngagingCreaturesAtPosition(creature: ICreature, allCreatures: ICreature[], x: number, y: number, ignoreEngaged: boolean = false): ICreature[] {
  return allCreatures.filter(other => 
    other !== creature && 
    other.isAlive() && 
    creature.isHostileTo(other) && // Must be hostile
    isInZoneOfControl(x, y, other) && // They are in our zone
    (!ignoreEngaged || getEngagingCreatures(other, allCreatures.filter(c => c !== creature), false).length === 0)
  );
}

/**
 * Check if a creature is engaged by any hostile creatures
 */
export function isEngaged(creature: ICreature, allCreatures: ICreature[]): boolean {
  return getEngagingCreatures(creature, allCreatures).length > 0;
}

/**
 * Check if a position is adjacent to a creature
 */
export function isAdjacentToCreature(x: number, y: number, creature: ICreature): boolean {
  return isPositionInRange(x, y, creature, 1);
}
