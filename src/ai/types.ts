import { Creature } from '../creatures';

// --- AI Types ---

export type AIBehaviorType = 
  | 'aggressive'    // Always attack if possible
  | 'defensive'     // Prefer to stay back and use ranged attacks
  | 'cautious'      // Only attack when advantageous
  | 'berserker'     // Always move toward nearest enemy and attack
  | 'support'       // Focus on supporting allies
  | 'scout'         // Move around and gather information
  | 'guard'         // Stay in position and attack if enemies approach
  | 'flee'          // Try to escape when low on health
  | 'patrol'        // Move in a pattern
  | 'ambush';       // Hide and wait for enemies to approach

export interface AIDecision {
  type: 'move' | 'attack' | 'wait' | 'flee' | 'special';
  target?: Creature;
  destination?: { x: number; y: number };
  priority: number; // Higher number = higher priority
  reason: string;
}

export interface AITarget {
  creature: Creature;
  distance: number;
  threat: number; // How dangerous this target is
  vulnerability: number; // How vulnerable this target is
  priority: number; // Overall priority for this target
}

export interface AIMovementOption {
  x: number;
  y: number;
  cost: number;
  benefits: {
    closerToTarget?: boolean;
    betterPosition?: boolean;
    saferPosition?: boolean;
    tacticalAdvantage?: boolean;
  };
  risks: {
    exposedToAttack?: boolean;
    trapped?: boolean;
    isolated?: boolean;
  };
  score: number;
}

export interface AIState {
  behavior: AIBehaviorType;
  currentTarget: Creature | null;
  lastKnownPlayerPositions: Map<string, { x: number; y: number; turn: number }>;
  threatAssessment: Map<string, number>;
  tacticalMemory: {
    lastMove: { x: number; y: number } | null;
    lastAttack: { targetId: string; success: boolean } | null;
    preferredPositions: Array<{ x: number; y: number; reason: string }>;
  };
  personality: {
    aggression: number; // 0-1: How likely to attack
    caution: number;    // 0-1: How careful about positioning
    intelligence: number; // 0-1: How well it plans
    adaptability: number; // 0-1: How well it adapts to changing situations
  };
}

export interface AIActionResult {
  success: boolean;
  action: AIDecision;
  message: string;
  newState: AIState;
}

export interface AIContext {
  ai: AIState;
  creature: Creature;
  allCreatures: Creature[];
  mapData: { tiles: string[][] };
  currentTurn: number;
  reachableTiles: Array<{ x: number; y: number }>;
  targetsInRange: Creature[];
}
