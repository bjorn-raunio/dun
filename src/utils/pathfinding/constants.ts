// Direction constants for movement (including diagonal with corner rule)
export const MOVEMENT_DIRECTIONS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],  // Cardinal directions
  [1, 1], [1, -1], [-1, 1], [-1, -1], // Diagonal directions
];

// Default blocking terrain types (can be overridden by map definition)
export const DEFAULT_BLOCKING_TERRAIN = ['wall', 'mountain', 'forest', 'building'];

// Pathfinding constants
export const MAX_PATHFINDING_ITERATIONS = 1000;
export const DEFAULT_MOVEMENT_COST = 1;
export const CLIMBING_COST_PENALTY = 1;

// Movement cost constants - now centralized in movementCost.ts
export const DEFAULT_MOVEMENT_OPTIONS = {
  baseCost: 1,
  maxElevationDifference: 1,
  climbingCostPenalty: 1,
  checkDiagonalCornerRule: true,
  considerCreatures: true,
  returnInfinityForBlocked: true
} as const;
