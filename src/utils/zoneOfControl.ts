import { ICreature } from '../creatures/interfaces';
import { calculateDistanceBetween } from './pathfinding';

// --- Zone of Control Utilities ---

/**
 * Check if a position is within a creature's zone of control
 */
export function isInZoneOfControl(x: number, y: number, creature: ICreature): boolean {
  const distance = calculateDistanceBetween(creature.x, creature.y, x, y);
  return distance <= creature.getZoneOfControlRange();
}

/**
 * Check if a position is within a creature's zone of control using a custom range
 */
export function isInZoneOfControlWithRange(x: number, y: number, creature: ICreature, zoneRange: number): boolean {
  const distance = calculateDistanceBetween(creature.x, creature.y, x, y);
  return distance <= zoneRange;
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
  const startInZone = isInZoneOfControlWithRange(fromX, fromY, creature, zoneRange);
  const endInZone = isInZoneOfControlWithRange(toX, toY, creature, zoneRange);
  
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
    
    const pointInZone = isInZoneOfControlWithRange(checkX, checkY, creature, zoneRange);
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
export function getEngagingCreatures(creature: ICreature, allCreatures: ICreature[]): ICreature[] {
  return getEngagingCreaturesAtPosition(creature, allCreatures, creature.x, creature.y);
}

export function getEngagingCreaturesAtPosition(creature: ICreature, allCreatures: ICreature[], x: number, y: number): ICreature[] {
  return allCreatures.filter(other => 
    other !== creature && 
    other.isAlive() && 
    creature.isHostileTo(other) && // Must be hostile
    isInZoneOfControl(x, y, other) // They are in our zone
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
  return calculateDistanceBetween(x, y, creature.x, creature.y) <= 1;
}

/**
 * Get the zone of control range for a creature
 */
export function getZoneOfControlRange(creature: ICreature): number {
  return creature.getZoneOfControlRange();
}
