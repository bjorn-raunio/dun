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

// Legacy compatibility - re-export commonly used functions
export { PathfindingSystem as Pathfinding } from './core';
export { LineOfSightSystem as LineOfSight } from './lineOfSight';
export { DistanceSystem as Distance } from './distance';

// Utility function exports for backward compatibility
export const calculateDistanceBetween = (fromX: number, fromY: number, toX: number, toY: number, options: any = {}) => 
  DistanceSystem.calculateDistanceBetween(fromX, fromY, toX, toY, options);

export const calculateDistanceToCreature = (fromX: number, fromY: number, target: any, options: any = {}) => 
  DistanceSystem.calculateDistanceToCreature(fromX, fromY, target, options);

export const canReachAndAttack = (attacker: any, target: any, allCreatures: any[], mapData?: any, cols?: number, rows?: number, mapDefinition?: any) => 
  DistanceSystem.canReachAndAttack(attacker, target, allCreatures, mapData, cols, rows, mapDefinition);

export const canAttackImmediately = (attacker: any, target: any) => 
  DistanceSystem.canAttackImmediately(attacker, target);

export const calculateDistanceToAttackablePosition = (fromX: number, fromY: number, target: any, creature: any, allCreatures: any[], mapData?: any, cols?: number, rows?: number, mapDefinition?: any) => 
  DistanceSystem.calculateDistanceToAttackablePosition(fromX, fromY, target, creature, allCreatures, mapData, cols, rows, mapDefinition);

export const isPositionAccessible = (x: number, y: number, allCreatures: any[], mapData: any, mapDefinition?: any) => 
  DistanceSystem.isPositionAccessible(x, y, allCreatures, mapData, mapDefinition);

export const isPositionAccessibleWithBounds = (x: number, y: number, allCreatures: any[], mapData: any, cols: number, rows: number, mapDefinition?: any) => 
  DistanceSystem.isPositionAccessibleWithBounds(x, y, allCreatures, mapData, cols, rows, mapDefinition);

export const isCreatureAtPosition = (x: number, y: number, allCreatures: any[]) => 
  DistanceSystem.isCreatureAtPosition(x, y, allCreatures);

export const findCreatureById = (creatures: any[], id: string) => 
  DistanceSystem.findCreatureById(creatures, id);

export const isCreatureVisible = (fromX: number, fromY: number, target: any, mapData: any, cols: number, rows: number, mapDefinition?: any, options?: any, fromCreature?: any, allCreatures?: any[]) => 
  LineOfSightSystem.isCreatureVisible(fromX, fromY, target, mapData, cols, rows, mapDefinition, options, fromCreature, allCreatures);

export const hasLineOfSight = (fromX: number, fromY: number, toX: number, toY: number, mapData: any, cols: number, rows: number, mapDefinition?: any, options?: any, fromCreature?: any, toCreature?: any, allCreatures?: any[]) => 
  LineOfSightSystem.hasLineOfSight(fromX, fromY, toX, toY, mapData, cols, rows, mapDefinition, options, fromCreature, toCreature, allCreatures);

export const debugLineOfSight = (fromX: number, fromY: number, toX: number, toY: number, mapData: any, cols: number, rows: number, mapDefinition?: any) => 
  LineOfSightSystem.debugLineOfSight(fromX, fromY, toX, toY, mapData, cols, rows, mapDefinition);

export const getVisibleCreatures = (fromX: number, fromY: number, allCreatures: any[], mapData: any, cols: number, rows: number, mapDefinition?: any, options?: any, fromCreature?: any) => 
  LineOfSightSystem.getVisibleCreatures(fromX, fromY, allCreatures, mapData, cols, rows, mapDefinition, options, fromCreature);

export const getReachableTiles = (creature: any, allCreatures: any[], mapData: any, cols: number, rows: number, mapDefinition?: any, options?: any) => 
  PathfindingSystem.getReachableTiles(creature, allCreatures, mapData, cols, rows, mapDefinition, options);

export const findPathToTarget = (startX: number, startY: number, targetX: number, targetY: number, allCreatures: any[], mapData: any, cols: number, rows: number, mapDefinition?: any, creature?: any) => 
  PathfindingSystem.findPathToTarget(startX, startY, targetX, targetY, allCreatures, mapData, cols, rows, mapDefinition, creature);

export const calculateStepCost = (fromX: number, fromY: number, toX: number, toY: number, allCreatures: any[], mapData: any, cols: number, rows: number, mapDefinition?: any, creature?: any) => 
  PathfindingSystem.calculateStepCost(fromX, fromY, toX, toY, allCreatures, mapData, cols, rows, mapDefinition, creature);
