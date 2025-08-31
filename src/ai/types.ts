import { Creature } from '../creatures/index';
import { MapDefinition } from '../maps/types';

// --- AI Types ---

export enum AIBehaviorType {
  MELEE = 'melee',   // Close combat focused, aggressive melee attacks
  RANGED = 'ranged', // Prefer ranged attacks, maintain distance
  ANIMAL = 'animal'  // Instinctive behavior, pack tactics, territorial
}

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
    inAttackRange?: boolean;
    combatBonus?: boolean;
    hasLineOfSight?: boolean;
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
  mapDefinition?: MapDefinition;
  currentTurn: number;
  reachableTiles: Array<{ x: number; y: number }>;
  reachableTilesCostMap: Map<string, number>;
  targetsInRange: Creature[];
}
