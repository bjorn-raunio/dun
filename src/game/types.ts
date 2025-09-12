import { Creature, ICreature, CreatureGroup, Party } from '../creatures/index';
import { TurnState, AITurnState } from './turnManagement';
import { WeatherState } from './weather';
import { WorldMap } from '../worldmap/WorldMap';
import { Campaign } from '../campaigns/Campaign';

import { QuestMap } from '../maps/types';

// --- Game State Types ---

export type GameState = {
  creatures: ICreature[];
  groups: CreatureGroup[]; // NEW
  party: Party;
  worldMap: WorldMap;
  mapDefinition: QuestMap | null;
  campaign: Campaign | null;
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
  weather: WeatherState;
  viewMode: 'quest' | 'world';
  animationsEnabled: boolean;
};

export type TargetingMode = {
  isActive: boolean;
  attackerId: string | null;
  message: string;
  offhand?: boolean;
  spellId?: string; // For spell targeting
  targetType?: 'ally' | 'enemy' | 'self'; // For spell targeting
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
  setCreatures: (updater: (prev: ICreature[]) => ICreature[]) => void;
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
  setWeather: (weather: WeatherState) => void;
  setViewMode: (viewMode: 'quest' | 'world') => void;
  setParty: (updater: (prev: Party) => Party) => void;
  setWorldMap: (updater: (prev: WorldMap) => WorldMap) => void;
  setMapDefinition: (mapDefinition: QuestMap | null) => void;
  setCampaign: (campaign: Campaign | null) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  centerWorldmapOnParty: () => void;
  centerQuestmapOnStartingTile: () => void;
  dispatch: React.Dispatch<any>;
};
