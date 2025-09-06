import { ICreature } from '../creatures/index';
import { AIState, AIBehaviorType } from './types';
// calculateTargetsInRange not used in this file
import { MonsterPreset } from '../creatures/presets/types';
import { QuestMap } from '../maps/types';
import { getVisibleCreatures } from '../utils/pathfinding';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { logAI } from '../utils/logging';
import { AI_BEHAVIORS } from './presets';
import { validateCombat } from '../validation/combat';
import { BaseWeapon } from '../items';

// --- AI Decision Making Logic ---

/**
 * Create a default AI state for a creature
 */
export function createDefaultAIState(behavior: AIBehaviorType = AI_BEHAVIORS.MELEE): AIState {
  return {
    behavior,
  };
}

/**
 * Create AI state based on creature type and preset
 */
export function createAIStateForCreature(creature: ICreature, preset?: MonsterPreset): AIState {
  // Determine behavior based on creature type or preset
  let behavior: AIBehaviorType = AI_BEHAVIORS.MELEE;

  if (preset?.aiBehavior) {
    behavior = preset.aiBehavior;
  }

  const baseState = createDefaultAIState(behavior);

  return {
    ...baseState
  };
}

/**
 * Check if an AI creature should take its turn
 */
export function shouldAITakeTurn(creature: ICreature, allCreatures: ICreature[] = []): boolean {
  return creature.isAlive() &&
    (creature.remainingMovement > 0 ||
      creature.remainingQuickActions > 0 ||
      creature.remainingActions > 0);
}

// --- AI Decision Making Functions ---

/**
 * Get the best target for the AI creature to attack
 */
export function getBestTarget(creature: ICreature, allCreatures: ICreature[], mapDefinition: QuestMap): ICreature | null {
  if (creature.x === undefined || creature.y === undefined) return null;
  const hostileCreatures = allCreatures.filter(c => c.x !== undefined && c.y !== undefined).filter(c => creature.isHostileTo(c));

  if (hostileCreatures.length === 0) return null;

  // Score targets based on distance, health, and threat level
  let bestTarget: ICreature | null = null;
  let bestScore = -Infinity;

  for (const target of hostileCreatures) {
    if (target.x === undefined || target.y === undefined) continue;

    const distance = calculateDistanceBetween(creature.x, creature.y, target.x, target.y);

    const score = -distance;
    if (score > bestScore) {
      bestScore = score;
      bestTarget = target;
    }
  }
  return bestTarget;
}

/**
 * Helper function to validate creature and target positions
 */
function validatePositions(creature: ICreature, target: ICreature): boolean {
  return (creature.x !== undefined && creature.y !== undefined && target.x !== undefined && target.y !== undefined);
}

function inAttackRange(tile: { x: number, y: number }, target: ICreature, weapon: BaseWeapon): boolean {
  if (target.x === undefined || target.y === undefined) {
    return false;
  }
  const attackRange = weapon.getValidRange();

  const distance = calculateDistanceBetween(tile.x, tile.y, target.x, target.y);

  if (distance > attackRange.max || distance < attackRange.min) {
    return false;
  }
  return true;
}

function validateAICombat(creature: ICreature, target: ICreature, allCreatures: ICreature[], mapDefinition: QuestMap, tile: { x: number, y: number }): boolean {
  let weapon = creature.getUnarmedWeapon();
  const mainWeapon = creature.getMainWeapon();
  const offHandWeapon = creature.getOffHandWeapon();
  if (!mainWeapon.isBroken() && inAttackRange(tile, target, mainWeapon)) {
    weapon = mainWeapon;
  }
  if (!offHandWeapon.isBroken() && inAttackRange(tile, target, offHandWeapon)) {
    weapon = offHandWeapon;
  }
  return validateCombat(creature, target, weapon, allCreatures, mapDefinition, tile, true).isValid;
}

/**
 * Helper function to get map dimensions
 */
function getMapDimensions(mapDefinition: QuestMap): { cols: number; rows: number } {
  return {
    cols: mapDefinition.tiles[0].length,
    rows: mapDefinition.tiles.length
  };
}

/**
 * Helper function to check if a position is occupied by another creature
 */
function isPositionOccupied(x: number, y: number, allCreatures: ICreature[], excludeId: string): boolean {
  return allCreatures.some(c => c.x === x && c.y === y && c.id !== excludeId);
}

function calculateScore(creature: ICreature, target: ICreature, allCreatures: ICreature[], mapDefinition: QuestMap, tile: { x: number, y: number }): number {
  let score = 0;
  const keepDistance = creature.getAIState()?.behavior?.keepDistance || false;
  const distance = calculateDistanceBetween(tile.x, tile.y, target.x!, target.y!);
  const canAttack = validateAICombat(creature, target, allCreatures, mapDefinition, tile);
  if (keepDistance && canAttack) {
    score += distance * 10;
  } else {
    score -= distance * 10;
  }
  if (canAttack) {
    score += 1000;
  }
  return score;
}

/**
 * Helper function to find the best position from reachable tiles
 */
function findBestPosition(
  creature: ICreature,
  target: ICreature,
  allCreatures: ICreature[],
  mapDefinition: QuestMap
): { x: number; y: number } | null {
  if (!validatePositions(creature, target)) return null;

  const { cols, rows } = getMapDimensions(mapDefinition);

  // Get reachable tiles
  const reachableResult = creature.getReachableTiles(allCreatures, mapDefinition, cols, rows);

  let bestPosition: { x: number; y: number } = { x: creature.x!, y: creature.y! };
  let bestScore = calculateScore(creature, target, allCreatures, mapDefinition, bestPosition) + 1;
  for (const tile of reachableResult.tiles) {
    // Check if this position is already occupied
    if (isPositionOccupied(tile.x, tile.y, allCreatures, creature.id)) continue;

    let score = calculateScore(creature, target, allCreatures, mapDefinition, tile);

      if (score > bestScore) {
        bestScore = score;
        bestPosition = tile;
      }
  }
  return bestPosition;
}

/**
 * Make an AI decision for the creature's turn
 */
export function makeAIDecision(
  creature: ICreature,
  aiState: AIState,
  allCreatures: ICreature[],
  mapDefinition: QuestMap
): AIDecision {
  const behavior = aiState.behavior;
  logAI(`${creature.name} (${behavior.name}) making AI decision - Actions: ${creature.remainingActions}, Movement: ${creature.remainingMovement}`);

  // Get the best target
  const target = getBestTarget(creature, allCreatures, mapDefinition);

  if (!target) {
    logAI(`${creature.name} (${behavior.name}) has no visible targets`);
    return { type: 'wait' };
  }

  logAI(`${creature.name} (${behavior.name}) targeting ${target.name}`);

  // Check if we can attack the target from current position using comprehensive validation
  if (validatePositions(creature, target) && creature.remainingActions > 0) {
    const weapon = creature.getMainWeapon();
    const validation = validateCombat(creature, target, weapon, allCreatures, mapDefinition);

    if (validation.isValid) {
      logAI(`${creature.name} can attack ${target.name} from current position`);
      return { type: 'attack', target };
    } else {
      logAI(`${creature.name} cannot attack ${target.name} from current position: ${validation.reason}`);
    }
  }

  const bestPosition = findBestPosition(
    creature,
    target,
    allCreatures,
    mapDefinition
  );
  if (bestPosition && creature.remainingMovement > 0 && (creature.x !== bestPosition.x || creature.y !== bestPosition.y)) {
    logAI(`${creature.name} moving to position (${bestPosition.x}, ${bestPosition.y})`);
    return { type: 'move', position: bestPosition, reason: 'attack' };
  }

  logAI(`${creature.name} cannot move or attack, waiting`);
  return { type: 'wait' };
}

// --- AI Decision Types ---

export interface AIDecision {
  type: 'attack' | 'move' | 'wait';
  target?: ICreature;
  position?: { x: number; y: number };
  reason?: string;
}