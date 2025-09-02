import { ICreature } from '../../creatures/index';
import { QuestMap } from '../../maps/types';

// --- Core Movement Types ---

export type MovementStatus = 'success' | 'partial' | 'failed';

export interface MovementResult {
  status: MovementStatus;
  message?: string;
  cost: number;
  finalPosition?: { x: number; y: number };
  intendedDestination?: { x: number; y: number };
  tilesMoved: number;
  totalPathLength: number;
}

export interface MovementCostOptions {
  /** Whether to check diagonal movement corner rule */
  checkDiagonalCornerRule?: boolean;
  /** Whether to consider creature blocking */
  considerCreatures?: boolean;
  /** Base movement cost (default: 1) */
  baseCost?: number;
  /** Maximum elevation difference allowed (default: 1) */
  maxElevationDifference?: number;
  /** Cost penalty for climbing (default: 1) */
  climbingCostPenalty?: number;
  /** Whether to return Infinity for blocked movement or throw error */
  returnInfinityForBlocked?: boolean;
  /** Area dimensions for multi-tile creatures (default: 1x1 for single tiles) */
  areaDimensions?: { w: number; h: number };
  /** Map dimensions for bounds checking (required when using area dimensions) */
  mapDimensions?: { cols: number; rows: number };
  /** Cost to reach the source position (used for engagement zone calculations) */
  sourcePositionCost?: number;
}

// AI movement types are kept in their original location (src/ai/types.ts)

// --- Movement Handler Types ---

export interface ReachableData {
  tiles: Array<{ x: number; y: number }>;
  costMap: Map<string, number>;
  pathMap: Map<string, Array<{ x: number; y: number }>>;
}

export interface MovementParams {
  selectedCreatureId: string;
  targetX: number;
  targetY: number;
  creatures: ICreature[];
  reachable: ReachableData;
  mapDefinition: QuestMap;
}

export interface MovementHandlers {
  handleMovement: (params: MovementParams) => boolean;
}

// Weather types are kept in their original location (src/game/weather.ts)

// --- Validation Types ---

export interface MovementValidationResult {
  isValid: boolean;
  reason?: string;
}
