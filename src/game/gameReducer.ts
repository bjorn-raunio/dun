import { ICreature, CreatureGroup, Party } from '../creatures/index';
import { GameState, ViewportState, PanState, TargetingMode } from './types';
import { TurnState, AITurnState } from './turnManagement';
import { QuestMap } from '../maps/types';
import { WeatherState, createWeatherEffect } from './weather';
import { WorldMap } from '../worldmap/WorldMap';
import { createSampleWorldMap } from '../worldmap/presets';
import { Scenario } from '../scenarios/Scenario';
import { TILE_SIZE } from '../components/styles';


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
  | { type: 'SET_VIEW_MODE'; payload: 'quest' | 'world' }
  | { type: 'SET_PARTY'; payload: Party }
  | { type: 'SET_WORLDMAP'; payload: WorldMap }
  | { type: 'SET_MAP_DEFINITION'; payload: QuestMap | null }
  | { type: 'SET_SCENARIO'; payload: Scenario | null }
  | { type: 'BATCH_UPDATE'; payload: GameAction[] }
  | { type: 'RESET_VIEWPORT_CENTER'; payload: { width: number; height: number } }
  | { type: 'CENTER_WORLDMAP_ON_PARTY' }
  | { type: 'CENTER_QUESTMAP_ON_STARTING_TILE' };

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
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    case 'SET_PARTY':
      return { ...state, party: action.payload };
    
    case 'SET_WORLDMAP':
      return { ...state, worldMap: action.payload };
    
    case 'SET_MAP_DEFINITION':
      return { ...state, mapDefinition: action.payload };
    
    case 'SET_SCENARIO':
      return { ...state, scenario: action.payload };
    
    case 'RESET_VIEWPORT_CENTER':
      return {
        ...state,
        viewport: { ...state.viewport, ...action.payload }
      };
    
    case 'CENTER_WORLDMAP_ON_PARTY':
      const currentRegion = state.worldMap.getRegion(state.party.currentRegionId);
      if (currentRegion) {
        const regionCenter = currentRegion.getCenterPosition();
        // Center the region in the viewport and reset zoom to 1.0
        const centerX = (state.viewport.width / 2) - regionCenter.x;
        const centerY = (state.viewport.height / 2) - regionCenter.y;
        return {
          ...state,
          viewport: { ...state.viewport, zoom: 1.0 },
          pan: { x: centerX, y: centerY }
        };
      }
      console.log('Could not center worldmap: region not found for', state.party.currentRegionId);
      return state;
    
    case 'CENTER_QUESTMAP_ON_STARTING_TILE':
      if (state.mapDefinition && state.mapDefinition.startingTiles && state.mapDefinition.startingTiles.length > 0) {
        const startingTile = state.mapDefinition.startingTiles[0];
        const bottomBarHeight = 130; // Account for UI elements
        const availableHeight = state.viewport.height - bottomBarHeight;
        
        // Center the starting tile in the viewport and reset zoom to 1.0
        const centerX = (state.viewport.width / 2) - (startingTile.x * TILE_SIZE) - (TILE_SIZE / 2);
        const centerY = (availableHeight / 2) - (startingTile.y * TILE_SIZE) - (TILE_SIZE / 2);
        
        return {
          ...state,
          viewport: { ...state.viewport, zoom: 1.0 },
          pan: { x: centerX, y: centerY }
        };
      }
      console.log('Could not center quest map: no map definition or starting tiles');
      return state;
    
    case 'BATCH_UPDATE':
      return action.payload.reduce(gameReducer, state);
    
    default:
      return state;
  }
}

// --- Initial State Helper ---

// Cache the world map to prevent recreation on re-renders
let cachedWorldMap: WorldMap = createSampleWorldMap();

// Track which scenarios have been initialized to prevent multiple calls
const initializedScenarios = new Set<Scenario>();

export function getInitialGameState(
  initialCreatures: ICreature[], 
  mapDefinition: QuestMap | null,
  scenario: Scenario | null = null
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
  
  // Initialize scenario if provided and not already initialized
  if (scenario && !initializedScenarios.has(scenario)) {
    scenario.startScenario(cachedWorldMap);
    initializedScenarios.add(scenario);
  }
  
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
    },
    viewMode: 'quest',
    worldMap: cachedWorldMap,
    mapDefinition: mapDefinition,
    scenario: scenario,
    party: (() => {
      const startingRegionId = 't26'; // Default starting region
      return new Party(startingRegionId);
    })()
  };
}
