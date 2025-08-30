// Import the main systems
import { PathfindingSystem } from './core';
import { LineOfSightSystem } from './lineOfSight';
import { DistanceSystem } from './distance';

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
  DIRECTIONS,
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
  getTerrainHeightAt,
  calculateHeuristic,
  reconstructPath
} from './helpers';

// Legacy compatibility - re-export commonly used functions
export { PathfindingSystem as Pathfinding } from './core';
export { LineOfSightSystem as LineOfSight } from './lineOfSight';
export { DistanceSystem as Distance } from './distance';

// Utility function exports for backward compatibility
export const calculateDistanceBetween = DistanceSystem.calculateDistanceBetween;
export const calculateDistanceToCreature = DistanceSystem.calculateDistanceToCreature;
export const canReachAndAttack = DistanceSystem.canReachAndAttack;
export const canAttackImmediately = DistanceSystem.canAttackImmediately;
export const calculateDistanceToAttackablePosition = DistanceSystem.calculateDistanceToAttackablePosition;
export const isPositionAccessible = DistanceSystem.isPositionAccessible;
export const isPositionAccessibleWithBounds = DistanceSystem.isPositionAccessibleWithBounds;
export const isCreatureAtPosition = DistanceSystem.isCreatureAtPosition;
export const findCreatureById = DistanceSystem.findCreatureById;

export const isCreatureVisible = LineOfSightSystem.isCreatureVisible;
export const hasLineOfSight = LineOfSightSystem.hasLineOfSight;
export const debugLineOfSight = LineOfSightSystem.debugLineOfSight;
export const getVisibleCreatures = LineOfSightSystem.getVisibleCreatures;

export const getReachableTiles = PathfindingSystem.getReachableTiles;
export const findPathToTarget = PathfindingSystem.findPathToTarget;
export const calculateStepCost = PathfindingSystem.calculateStepCost;
