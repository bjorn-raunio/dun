import { Creature } from '../../creatures/index';

// Core pathfinding types
export interface PathfindingResult {
  tiles: Array<{ x: number; y: number }>;
  costMap: Map<string, number>;
  pathMap: Map<string, Array<{ x: number; y: number }>>;
}

export interface PathfindingOptions {
  maxBudget?: number;
  considerEngagement?: boolean;
  includeStartPosition?: boolean;
}

// Line of sight types
export interface LineOfSightOptions {
  maxRange?: number;
  ignoreCreatures?: boolean;
  includeCreatures?: boolean;
  /** Algorithm to use for line-of-sight calculations */
  algorithm?: 'dda' | 'raybox' | 'bresenham';
}

// Distance calculation types
export interface DistanceOptions {
  /** Use pathfinding for accurate distance calculation */
  usePathfinding?: boolean;
  /** Map data for pathfinding calculations */
  mapData?: { tiles: string[][] };
  /** Map dimensions for bounds checking */
  cols?: number;
  rows?: number;
  /** Map definition for terrain costs */
  mapDefinition?: any;
  /** All creatures for obstacle checking */
  allCreatures?: Creature[];
  /** Cost map for path-based distance calculation */
  costMap?: Map<string, number>;
  /** Distance metric to use for simple calculations */
  metric?: 'chebyshev' | 'manhattan' | 'euclidean';
}

// Internal pathfinding node type
export interface PathfindingNode {
  x: number;
  y: number;
  cost: number;
  path: Array<{ x: number; y: number }>;
}

// Area statistics type
export interface AreaStats {
  maxH: number;
  hasEmpty: boolean;
}
