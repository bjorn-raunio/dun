// Import the main systems
import { PathfindingSystem } from './core';
import { LineOfSightSystem } from './lineOfSight';
import { DistanceSystem } from './distance';
import { Creature, ICreature } from '../../creatures/index';
import { QuestMap } from '../../maps/types';
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
  MAX_PATHFINDING_ITERATIONS
} from './constants';

// Helper function exports
export {
  getAreaStats,
  isAreaStandable,
  calculateHeuristic,
  reconstructPath,
} from './helpers';

// Utility function exports for backward compatibility
export const calculateDistanceBetween = (fromX: number, fromY: number, toX: number, toY: number, options: DistanceOptions = {}) => 
  DistanceSystem.calculateDistanceBetween(fromX, fromY, toX, toY, options);

export const calculateDistanceToCreature = (fromX: number, fromY: number, target: ICreature, options: DistanceOptions = {}) => 
  DistanceSystem.calculateDistanceToCreature(fromX, fromY, target, options);

export const canReachAndAttack = (attacker: ICreature, target: ICreature, allCreatures: ICreature[], cols: number, rows: number, mapDefinition: QuestMap) => 
  DistanceSystem.canReachAndAttack(attacker, target, allCreatures, cols, rows, mapDefinition);

export const canAttackImmediately = (attacker: ICreature, target: ICreature) => 
  DistanceSystem.canAttackImmediately(attacker, target);

export const calculateDistanceToAttackablePosition = (fromX: number, fromY: number, target: ICreature, creature: ICreature, allCreatures: ICreature[], cols: number, rows: number, mapDefinition: QuestMap) => 
  DistanceSystem.calculateDistanceToAttackablePosition(fromX, fromY, target, creature, allCreatures, cols, rows, mapDefinition);

export const isCreatureAtPosition = (x: number, y: number, allCreatures: ICreature[]) => 
  DistanceSystem.isCreatureAtPosition(x, y, allCreatures);

export const findCreatureById = (creatures: ICreature[], id: string) => 
  DistanceSystem.findCreatureById(creatures, id);

export const isCreatureVisible = (fromX: number, fromY: number, target: ICreature, cols: number, rows: number, mapDefinition: QuestMap, options?: LineOfSightOptions, fromCreature?: ICreature, allCreatures?: ICreature[]) => 
  LineOfSightSystem.isCreatureVisible(fromX, fromY, target, cols, rows, mapDefinition, options, fromCreature, allCreatures);

export const hasLineOfSight = (fromX: number, fromY: number, toX: number, toY: number, cols: number, rows: number, mapDefinition: QuestMap, options?: LineOfSightOptions, fromCreature?: ICreature, toCreature?: ICreature, allCreatures?: ICreature[]) => 
  LineOfSightSystem.hasLineOfSight(fromX, fromY, toX, toY, cols, rows, mapDefinition, options, fromCreature, toCreature, allCreatures);

export const debugLineOfSight = (fromX: number, fromY: number, toX: number, toY: number, cols: number, rows: number, mapDefinition: QuestMap) => 
  LineOfSightSystem.debugLineOfSight(fromX, fromY, toX, toY, cols, rows, mapDefinition);

export const getVisibleCreatures = (fromX: number, fromY: number, allCreatures: ICreature[], cols: number, rows: number, mapDefinition: QuestMap, options?: LineOfSightOptions, fromCreature?: ICreature) => 
  LineOfSightSystem.getVisibleCreatures(fromX, fromY, allCreatures, cols, rows, mapDefinition, options, fromCreature);

export const getReachableTiles = (creature: ICreature, allCreatures: ICreature[], cols: number, rows: number, mapDefinition: QuestMap, options?: PathfindingOptions) => 
  PathfindingSystem.getReachableTiles(creature, allCreatures, cols, rows, mapDefinition, options);

export const findPathToTarget = (startX: number, startY: number, targetX: number, targetY: number, allCreatures: ICreature[], cols: number, rows: number, mapDefinition: QuestMap, creature?: ICreature) => 
  PathfindingSystem.findPathToTarget(startX, startY, targetX, targetY, allCreatures, cols, rows, mapDefinition, creature);