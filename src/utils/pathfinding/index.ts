// Import the main systems
import { PathfindingSystem } from './core';
import { LineOfSightSystem } from './lineOfSight';
import { DistanceSystem } from './distance';
import { Creature } from '../../creatures/index';
import { MapDefinition } from '../../maps/types';
import { DistanceOptions, LineOfSightOptions, PathfindingOptions } from './types';

// Main pathfinding system exports
export { PathfindingSystem } from './core';
export { LineOfSightSystem } from './lineOfSight';
export { DistanceSystem } from './distance';

// Type exports
export type {
  PathfindingResult,
  PathfindingOptions,
  LineOfSightOptions,
  DistanceOptions,
  PathfindingNode,
  AreaStats
} from './types';

// Constant exports
export {
  MOVEMENT_DIRECTIONS,
  DEFAULT_BLOCKING_TERRAIN,
  MAX_PATHFINDING_ITERATIONS,
  DEFAULT_MOVEMENT_COST,
  CLIMBING_COST_PENALTY
} from './constants';

// Helper function exports
export {
  getAreaStats,
  isAreaStandable,
  calculateMoveCostInto,
  calculateHeuristic,
  reconstructPath
} from './helpers';

// Utility function exports for backward compatibility
export const calculateDistanceBetween = (fromX: number, fromY: number, toX: number, toY: number, options: DistanceOptions = {}) => 
  DistanceSystem.calculateDistanceBetween(fromX, fromY, toX, toY, options);

export const calculateDistanceToCreature = (fromX: number, fromY: number, target: Creature, options: DistanceOptions = {}) => 
  DistanceSystem.calculateDistanceToCreature(fromX, fromY, target, options);

export const canReachAndAttack = (attacker: Creature, target: Creature, allCreatures: Creature[], mapData?: { tiles: string[][] }, cols?: number, rows?: number, mapDefinition?: MapDefinition) => 
  DistanceSystem.canReachAndAttack(attacker, target, allCreatures, mapData, cols, rows, mapDefinition);

export const canAttackImmediately = (attacker: Creature, target: Creature) => 
  DistanceSystem.canAttackImmediately(attacker, target);

export const calculateDistanceToAttackablePosition = (fromX: number, fromY: number, target: Creature, creature: Creature, allCreatures: Creature[], mapData?: { tiles: string[][] }, cols?: number, rows?: number, mapDefinition?: MapDefinition) => 
  DistanceSystem.calculateDistanceToAttackablePosition(fromX, fromY, target, creature, allCreatures, mapData, cols, rows, mapDefinition);

export const isPositionAccessible = (x: number, y: number, allCreatures: Creature[], mapData: { tiles: string[][] }, mapDefinition?: MapDefinition) => 
  DistanceSystem.isPositionAccessible(x, y, allCreatures, mapData, mapDefinition);

export const isPositionAccessibleWithBounds = (x: number, y: number, allCreatures: Creature[], mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: MapDefinition) => 
  DistanceSystem.isPositionAccessibleWithBounds(x, y, allCreatures, mapData, cols, rows, mapDefinition);

export const isCreatureAtPosition = (x: number, y: number, allCreatures: Creature[]) => 
  DistanceSystem.isCreatureAtPosition(x, y, allCreatures);

export const findCreatureById = (creatures: Creature[], id: string) => 
  DistanceSystem.findCreatureById(creatures, id);

export const isCreatureVisible = (fromX: number, fromY: number, target: Creature, mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: MapDefinition, options?: LineOfSightOptions, fromCreature?: Creature, allCreatures?: Creature[]) => 
  LineOfSightSystem.isCreatureVisible(fromX, fromY, target, mapData, cols, rows, mapDefinition, options, fromCreature, allCreatures);

export const hasLineOfSight = (fromX: number, fromY: number, toX: number, toY: number, mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: MapDefinition, options?: LineOfSightOptions, fromCreature?: Creature, toCreature?: Creature, allCreatures?: Creature[]) => 
  LineOfSightSystem.hasLineOfSight(fromX, fromY, toX, toY, mapData, cols, rows, mapDefinition, options, fromCreature, toCreature, allCreatures);

export const debugLineOfSight = (fromX: number, fromY: number, toX: number, toY: number, mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: MapDefinition) => 
  LineOfSightSystem.debugLineOfSight(fromX, fromY, toX, toY, mapData, cols, rows, mapDefinition);

export const getVisibleCreatures = (fromX: number, fromY: number, allCreatures: Creature[], mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: MapDefinition, options?: LineOfSightOptions, fromCreature?: Creature) => 
  LineOfSightSystem.getVisibleCreatures(fromX, fromY, allCreatures, mapData, cols, rows, mapDefinition, options, fromCreature);

export const getReachableTiles = (creature: Creature, allCreatures: Creature[], mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: MapDefinition, options?: PathfindingOptions) => 
  PathfindingSystem.getReachableTiles(creature, allCreatures, mapData, cols, rows, mapDefinition, options);

export const findPathToTarget = (startX: number, startY: number, targetX: number, targetY: number, allCreatures: Creature[], mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: MapDefinition, creature?: Creature) => 
  PathfindingSystem.findPathToTarget(startX, startY, targetX, targetY, allCreatures, mapData, cols, rows, mapDefinition, creature);

export const calculateStepCost = (fromX: number, fromY: number, toX: number, toY: number, allCreatures: Creature[], mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: MapDefinition, creature?: Creature) => 
  PathfindingSystem.calculateStepCost(fromX, fromY, toX, toY, allCreatures, mapData, cols, rows, mapDefinition, creature);
