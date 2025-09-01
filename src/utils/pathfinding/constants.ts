// Direction constants for movement (including diagonal with corner rule)
export const MOVEMENT_DIRECTIONS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],  // Cardinal directions
  [1, 1], [1, -1], [-1, 1], [-1, -1], // Diagonal directions
];

// Pathfinding constants
export const MAX_PATHFINDING_ITERATIONS = 1000;

// Movement cost constants - now centralized in movementCost.ts
export const DEFAULT_MOVEMENT_OPTIONS = {
  baseCost: 1,
  maxElevationDifference: 1,
  climbingCostPenalty: 1,
  checkDiagonalCornerRule: true,
  considerCreatures: true,
  returnInfinityForBlocked: true
} as const;
