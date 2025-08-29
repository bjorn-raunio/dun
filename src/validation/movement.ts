import { Creature } from '../creatures/index';
import { BaseValidationResult } from '../utils/types';

// --- Movement Validation Logic ---

export interface MovementValidationResult extends BaseValidationResult {}

/**
 * Validate if a creature can move to a specific position
 */
export function validateMovement(
  creature: Creature,
  newX: number,
  newY: number,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  stepCost: number,
  mapDefinition?: any
): MovementValidationResult {
  // Check if creature is alive
  if (!creature.isAlive()) {
    return {
      isValid: false,
      reason: `${creature.name} is dead and cannot move.`
    };
  }

  // Check if creature has enough movement points
  if (creature.remainingMovement < stepCost) {
    return {
      isValid: false,
      reason: `${creature.name} doesn't have enough movement points (${creature.remainingMovement}/${stepCost}).`
    };
  }

  // Check if position is within map bounds
  if (!isWithinMapBounds(newX, newY, mapData)) {
    return {
      isValid: false,
      reason: `${creature.name} cannot move outside the map boundaries.`
    };
  }

  // Check if position is standable
  if (!isPositionStandable(creature, newX, newY, allCreatures, mapData, mapDefinition)) {
    return {
      isValid: false,
      reason: `${creature.name} cannot stand at that position.`
    };
  }

  // Check engagement restrictions
  const engagementValidation = validateEngagementMovement(creature, newX, newY, allCreatures);
  if (!engagementValidation.isValid) {
    return engagementValidation;
  }

  return { isValid: true };
}

/**
 * Check if position is within map bounds
 */
export function isWithinMapBounds(x: number, y: number, mapData: { tiles: string[][] }): boolean {
  if (x < 0 || y < 0) return false;
  if (y >= mapData.tiles.length) return false;
  if (x >= mapData.tiles[0].length) return false;
  return true;
}

/**
 * Check if position is standable for a creature
 */
export function isPositionStandable(
  creature: Creature,
  x: number,
  y: number,
  allCreatures: Creature[],
  mapData: { tiles: string[][] },
  mapDefinition?: any
): boolean {
  const dimensions = creature.getDimensions();
  
  // Check if the entire area is within bounds
  if (x < 0 || y < 0 || 
      x + dimensions.w > mapData.tiles[0].length || 
      y + dimensions.h > mapData.tiles.length) {
    return false;
  }

  // Check if any tile in the area is empty, invalid, or has blocking terrain
  for (let dy = 0; dy < dimensions.h; dy++) {
    for (let dx = 0; dx < dimensions.w; dx++) {
      const tileX = x + dx;
      const tileY = y + dy;
      const tile = mapData.tiles[tileY]?.[tileX];
      
      if (!tile || tile === "empty.jpg") {
        return false;
      }
      
      // Check terrain height - terrain with height > 1 blocks movement
      if (mapDefinition) {
        const { terrainHeightAt } = require('../maps/mapRenderer');
        const terrainHeight = terrainHeightAt(tileX, tileY, mapDefinition);
        if (terrainHeight > 1) {
          return false;
        }
      }
    }
  }

  // Check for creature overlap (excluding dead creatures)
  for (const otherCreature of allCreatures) {
    if (otherCreature.id === creature.id) continue;
    if (otherCreature.isDead()) continue; // Dead creatures don't block movement
    
    const otherDimensions = otherCreature.getDimensions();
    if (rectsOverlap(x, y, dimensions.w, dimensions.h, 
                     otherCreature.x, otherCreature.y, otherDimensions.w, otherDimensions.h)) {
      return false;
    }
  }

  return true;
}

/**
 * Validate movement considering engagement rules
 */
export function validateEngagementMovement(
  creature: Creature,
  newX: number,
  newY: number,
  allCreatures: Creature[]
): MovementValidationResult {
  const engagingCreatures = creature.getEngagingCreatures(allCreatures);
  const currentlyEngaged = engagingCreatures.length > 0;

  if (currentlyEngaged) {
    // Check if movement is within zone of control of all engaging creatures
    const withinZoneOfControl = engagingCreatures.every(engager => 
      engager.isInZoneOfControl(newX, newY)
    );
    
    if (!withinZoneOfControl) {
      return {
        isValid: false,
        reason: `${creature.name} is engaged and cannot move outside the zone of control of engaging creatures.`
      };
    }

    // Check if movement is adjacent to current position
    const isAdjacent = Math.abs(newX - creature.x) <= 1 && Math.abs(newY - creature.y) <= 1;
    if (!isAdjacent) {
      return {
        isValid: false,
        reason: `${creature.name} is engaged and can only move to adjacent tiles.`
      };
    }

    // Check if creature has already moved while engaged this turn
    if (creature.hasMovedWhileEngaged) {
      return {
        isValid: false,
        reason: `${creature.name} has already moved while engaged this turn.`
      };
    }
  }

  return { isValid: true };
}

/**
 * Check if two rectangles overlap
 */
export function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/**
 * Validate path to destination doesn't pass through hostile zones of control
 */
export function validatePathThroughZones(
  creature: Creature,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  allCreatures: Creature[]
): MovementValidationResult {
  // Check if the path passes through hostile zones without ending in them
  const hostileCreatures = creature.getHostileCreatures(allCreatures);
  
  for (const hostile of hostileCreatures) {
    if (pathPassesThroughZoneOfControl(fromX, fromY, toX, toY, hostile)) {
      return {
        isValid: false,
        reason: `${creature.name} cannot move through ${hostile.name}'s zone of control.`
      };
    }
  }

  return { isValid: true };
}

/**
 * Check if a path passes through a creature's zone of control
 */
export function pathPassesThroughZoneOfControl(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  creature: Creature
): boolean {
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
