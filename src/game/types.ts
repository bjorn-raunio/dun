import { Creature } from '../creatures/index';
import { TurnState, AITurnState } from './turnManagement';

// --- Game State Types ---

export type GameState = {
  creatures: Creature[];
  selectedCreatureId: string | null;
  messages: string[];
  viewport: ViewportState;
  pan: PanState;
  dragging: boolean;
  reachableKey: number;
  targetsInRangeKey: number;
  aiTurnState: AITurnState;
  turnState: TurnState;
  targetingMode: TargetingMode;
};

export type TargetingMode = {
  isActive: boolean;
  attackerId: string | null;
  message: string;
};

export type ViewportState = {
  width: number;
  height: number;
  zoom: number;
};

export type PanState = {
  x: number;
  y: number;
};

export type GameRefs = {
  dragStart: React.MutableRefObject<{ x: number; y: number } | null>;
  panStart: React.MutableRefObject<{ x: number; y: number }>;
  panRef: React.MutableRefObject<HTMLDivElement | null>;
  livePan: React.MutableRefObject<{ x: number; y: number; zoom: number }>;
  rafId: React.MutableRefObject<number | null>;
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
  dragMoved: React.MutableRefObject<{ dx: number; dy: number }>;
  lastMovement: React.MutableRefObject<{ creatureId: string; x: number; y: number } | null>;
  updateTransform: (x: number, y: number) => void;
};

export type GameActions = {
  setCreatures: (updater: (prev: Creature[]) => Creature[]) => void;
  setSelectedCreatureId: (id: string | null) => void;
  setMessages: (updater: (prev: string[]) => string[]) => void;
  setViewport: (viewport: ViewportState) => void;
  setPan: (pan: PanState) => void;
  setDragging: (dragging: boolean) => void;
  setReachableKey: (updater: (prev: number) => number) => void;
  setTargetsInRangeKey: (updater: (prev: number) => number) => void;
  setAITurnState: (updater: (prev: AITurnState) => AITurnState) => void;
  setTurnState: (updater: (prev: TurnState) => TurnState) => void;
  setZoom: (zoom: number) => void;
  setTargetingMode: (targetingMode: TargetingMode) => void;
};
