import { ICreature, CreatureGroup } from '../creatures/index';
import { GameState, ViewportState, PanState, TargetingMode } from './types';
import { TurnState, AITurnState } from './turnManagement';
import { MapDefinition } from '../maps/types';
import { WeatherState, createWeatherEffect } from './weather';

// --- Game Action Types ---

export type GameAction = 
  | { type: 'SET_CREATURES'; payload: ICreature[] }
  | { type: 'UPDATE_CREATURE'; payload: { id: string; updates: Partial<ICreature> } }
  | { type: 'SET_SELECTED_CREATURE'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: string }
  | { type: 'SET_MESSAGES'; payload: string[] }
  | { type: 'SET_VIEWPORT'; payload: ViewportState }
  | { type: 'SET_PAN'; payload: PanState }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'INCREMENT_REACHABLE_KEY' }
  | { type: 'INCREMENT_TARGETS_KEY' }
  | { type: 'SET_AI_TURN_STATE'; payload: AITurnState }
  | { type: 'SET_TURN_STATE'; payload: TurnState }
  | { type: 'SET_TARGETING_MODE'; payload: TargetingMode }
  | { type: 'SET_WEATHER'; payload: WeatherState }
  | { type: 'BATCH_UPDATE'; payload: GameAction[] }
  | { type: 'RESET_VIEWPORT_CENTER'; payload: { width: number; height: number } };

// --- Game Reducer ---

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CREATURES':
      return { ...state, creatures: action.payload };
    
    case 'UPDATE_CREATURE':
      return {
        ...state,
        creatures: state.creatures.map(c => 
          c.id === action.payload.id 
            ? { ...c, ...action.payload.updates } as ICreature
            : c
        )
      };
    
    case 'SET_SELECTED_CREATURE':
      return { ...state, selectedCreatureId: action.payload };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [action.payload, ...state.messages].slice(0, 50)
      };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'SET_VIEWPORT':
      return { ...state, viewport: action.payload };
    
    case 'SET_PAN':
      return { ...state, pan: action.payload };
    
    case 'SET_DRAGGING':
      return { ...state, dragging: action.payload };
    
    case 'INCREMENT_REACHABLE_KEY':
      return { ...state, reachableKey: state.reachableKey + 1 };
    
    case 'INCREMENT_TARGETS_KEY':
      return { ...state, targetsInRangeKey: state.targetsInRangeKey + 1 };
    
    case 'SET_AI_TURN_STATE':
      return { ...state, aiTurnState: action.payload };
    
    case 'SET_TURN_STATE':
      return { ...state, turnState: action.payload };
    
    case 'SET_TARGETING_MODE':
      return { ...state, targetingMode: action.payload };
    
    case 'SET_WEATHER':
      return { ...state, weather: action.payload };
    
    case 'RESET_VIEWPORT_CENTER':
      return {
        ...state,
        viewport: { ...state.viewport, ...action.payload }
      };
    
    case 'BATCH_UPDATE':
      return action.payload.reduce(gameReducer, state);
    
    default:
      return state;
  }
}

// --- Initial State Helper ---

export function getInitialGameState(
  initialCreatures: ICreature[], 
  mapDefinition?: MapDefinition
): GameState {
  // Calculate initial pan position to center over a starting tile
  const mapWidth = mapDefinition?.width ?? 40;
  const mapHeight = mapDefinition?.height ?? 30;
  const startingTile = mapDefinition?.startingTiles?.[0] ?? { 
    x: Math.floor(mapWidth / 2), 
    y: Math.floor(mapHeight / 2) 
  };
  
  const bottomBarHeight = 130;
  const availableHeight = window.innerHeight - bottomBarHeight;
  
  // Center the starting tile in the viewport
  const initialPanX = (window.innerWidth / 2) - (startingTile.x * 32) - 16;
  const initialPanY = (availableHeight / 2) - (startingTile.y * 32) - 16;
  
  return {
    creatures: initialCreatures,
    groups: [
      CreatureGroup.PLAYER,
      CreatureGroup.ENEMY,
      CreatureGroup.NEUTRAL
    ],
    selectedCreatureId: null,
    messages: [],
    viewport: { 
      width: window.innerWidth, 
      height: window.innerHeight,
      zoom: 1.0
    },
    pan: { x: initialPanX, y: initialPanY },
    dragging: false,
    reachableKey: 0,
    targetsInRangeKey: 0,
    aiTurnState: { 
      isAITurnActive: false, 
      currentGroup: null, 
      groupTurnOrder: [], 
      groupTurnIndex: 0, 
      processedCreatures: new Set() 
    },
    turnState: { 
      currentTurn: 1, 
      activeCreatureId: null, 
      turnOrder: [], 
      turnIndex: 0 
    },
    targetingMode: {
      isActive: false,
      attackerId: null,
      message: ''
    },
    weather: {
      current: createWeatherEffect('clear'),
      transitionTime: 0,
      isTransitioning: false
    }
  };
}
