// Export all utility functions
export * from './geometry';
export * from './constants';
export * from './dice';
export * from './combat';
export * from './messageUtils';
export * from './zoneOfControl';
export * from './idGeneration';
export * from './logging';
export * from './loggingConfig';
export * from './movement';
export * from '../statusEffects';

// Export pathfinding functions with explicit naming to avoid conflicts
export {
  PathfindingSystem,
  LineOfSightSystem,
  DistanceSystem,
  calculateDistanceBetween,
  calculateDistanceToCreature,
  canReachAndAttack,
  canAttackImmediately,
  calculateDistanceToAttackablePosition,
  isCreatureAtPosition,
  findCreatureById,
  isCreatureVisible,
  hasLineOfSight,
  debugLineOfSight,
  getVisibleCreatures,
  getReachableTiles,
  findPathToTarget,
  calculateStepCost
} from './pathfinding';
