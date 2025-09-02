import { Creature, ICreature } from '../creatures/index';
import { BaseValidationResult } from '../utils/types';
import { isWithinMapBounds } from '../utils/geometry';
import { VALIDATION_MESSAGES } from './messages';
import { validateCondition } from './core';
import { validateCreatureAlive, validateMovementPoints } from './creature';
import { validatePositionStandable } from './map';
import { 
  isInZoneOfControl, 
  pathPassesThroughHostileZones,
  isAdjacentToCreature,
  getEngagingCreatures
} from '../utils/zoneOfControl';
import { QuestMap } from '../maps/types';

// --- Movement Validation Logic ---

export interface MovementValidationResult extends BaseValidationResult {}

/**
 * Validate if a creature can move to a specific position
 */
export function validateMovement(
  creature: ICreature,
  newX: number,
  newY: number,
  allCreatures: ICreature[],
  mapData: { tiles: string[][] },
  stepCost: number,
  mapDefinition?: QuestMap
): MovementValidationResult {
  // Use centralized validation for basic creature state
  const aliveCheck = validateCreatureAlive(creature, 'move');
  if (!aliveCheck.isValid) return aliveCheck;
  
  const movementCheck = validateMovementPoints(creature, stepCost);
  if (!movementCheck.isValid) return movementCheck;

  // Check if position is within map bounds
  const boundsCheck = validateCondition(
    isWithinMapBounds(newX, newY, mapData),
    creature.name,
    'position within map bounds'
  );
  if (!boundsCheck.isValid) return boundsCheck;

  // Check if position is standable
  const standableCheck = validateCondition(
    isPositionStandable(creature, newX, newY, allCreatures, mapData, mapDefinition),
    creature.name,
    'position is standable'
  );
  if (!standableCheck.isValid) return standableCheck;

  // Check engagement restrictions
  const engagementValidation = validateEngagementMovement(creature, newX, newY, allCreatures);
  if (!engagementValidation.isValid) {
    return engagementValidation;
  }

  return { isValid: true };
}



/**
 * Check if position is standable for a creature
 */
export function isPositionStandable(
  creature: ICreature,
  x: number,
  y: number,
  allCreatures: ICreature[],
  mapData: { tiles: string[][] },
  mapDefinition?: QuestMap
): boolean {
  const dimensions = creature.getDimensions();
  const result = validatePositionStandable(x, y, dimensions, allCreatures, mapData, mapDefinition, true, creature.id);
  return result.isValid;
}

/**
 * Validate movement considering engagement rules
 */
export function validateEngagementMovement(
  creature: ICreature,
  newX: number,
  newY: number,
  allCreatures: ICreature[]
): MovementValidationResult {
  const engagingCreatures = getEngagingCreatures(creature, allCreatures, true);
  const currentlyEngaged = engagingCreatures.length > 0;

  if (currentlyEngaged) {
    // Check if movement is within zone of control of all engaging creatures
    const withinZoneOfControl = engagingCreatures.every(engager => 
      isInZoneOfControl(newX, newY, engager)
    );
    
    if (!withinZoneOfControl) {
      return {
        isValid: false,
        reason: VALIDATION_MESSAGES.ENGAGED_MOVEMENT_RESTRICTION(creature.name)
      };
    }

    // Check if movement is adjacent to current position
    const isAdjacent = isAdjacentToCreature(newX, newY, creature);
    if (!isAdjacent) {
      return {
        isValid: false,
        reason: VALIDATION_MESSAGES.ENGAGED_ADJACENT_ONLY(creature.name)
      };
    }

    // Check if creature has already moved while engaged this turn
    if (creature.hasMovedWhileEngaged) {
      return {
        isValid: false,
        reason: VALIDATION_MESSAGES.ALREADY_MOVED_WHILE_ENGAGED(creature.name)
      };
    }
  }

  return { isValid: true };
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
  const result = pathPassesThroughHostileZones(creature, fromX, fromY, toX, toY, allCreatures);
  
  if (result.blocked && result.blocker) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.ZONE_OF_CONTROL_BLOCKED(creature.name)
    };
  }

  return { isValid: true };
}
