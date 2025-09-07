import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useRef } from 'react';
import { ICreature } from '../creatures/index';
import { gameReducer, GameAction, getInitialGameState } from './gameReducer';
import { GameState, GameRefs, GameActions, TargetingMode } from './types';
import { WeatherState } from './weather';
import { TurnState, initializeAITurnState, initializeTurnState } from './turnManagement';
import { GAME_SETTINGS } from '../utils/constants';
import { updateCombatStates } from '../utils/combatStateUtils';
import { QuestMap } from '../maps/types';
import { AITurnState } from './turnManagement/types';
import { Party } from '../creatures/index';
import { WorldMap } from '../worldmap/WorldMap';
import { messageManager } from '../utils/messageSystem';


// --- Game Context Types ---

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  actions: GameActions;
  refs: GameRefs;
}

const GameContext = createContext<GameContextValue | null>(null);

// --- Game Provider Component ---

export function GameProvider({ 
  children, 
  initialCreatures, 
  mapDefinition = null 
}: {
  children: React.ReactNode;
  initialCreatures: ICreature[];
  mapDefinition?: QuestMap | null;
}) {
  const [state, dispatch] = useReducer(
    gameReducer, 
    getInitialGameState(initialCreatures, mapDefinition)
  );
  
  // Initialize message system with dispatch function
  useEffect(() => {
    messageManager.setDispatchFunction(dispatch);
  }, [dispatch]);
  
  // --- REFS ---
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRef = useRef<HTMLDivElement | null>(null);
  const livePan = useRef<{ x: number; y: number; zoom: number }>({ x: 0, y: 0, zoom: 1.0 });
  const rafId = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragMoved = useRef<{dx: number; dy: number}>({dx: 0, dy: 0});
  const lastMovement = useRef<{creatureId: string; x: number; y: number} | null>(null);

  // --- VIEWPORT RESIZE HANDLING ---
  useEffect(() => {
    function handleResize() {
      dispatch({ 
        type: 'RESET_VIEWPORT_CENTER', 
        payload: { 
          width: window.innerWidth, 
          height: window.innerHeight 
        } 
      });
    }
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- PAN REF UPDATES ---
  useEffect(() => {
    livePan.current = { ...state.pan, zoom: state.viewport.zoom };
    if (panRef.current) {
      panRef.current.style.transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.viewport.zoom})`;
    }
  }, [state.pan, state.viewport.zoom]);

  // --- COMBAT STATE INITIALIZATION ---
  useEffect(() => {
    updateCombatStates(state.creatures);
  }, []); // Only run once on mount

  // --- MAP DEFINITION INITIALIZATION ---
  useEffect(() => {
    if (mapDefinition && !state.mapDefinition) {
      dispatch({ type: 'SET_MAP_DEFINITION', payload: mapDefinition });
      // Also set the party's currentQuestMap
      dispatch({ 
        type: 'SET_PARTY', 
        payload: new Party(state.party.currentRegionId, mapDefinition) 
      });
    }
  }, [mapDefinition, state.mapDefinition, state.party.currentRegionId, dispatch]);

  // --- ACTIONS ---
  const setCreatures = useCallback((updater: (prev: ICreature[]) => ICreature[]) => {
    const newCreatures = updater(state.creatures);
    dispatch({ type: 'SET_CREATURES', payload: newCreatures });
  }, [state.creatures, dispatch]);
  
  const setSelectedCreatureId = useCallback((id: string | null) => {
    dispatch({ type: 'SET_SELECTED_CREATURE', payload: id });
  }, [dispatch]);
  
  const setMessages = useCallback((updater: (prev: string[]) => string[]) => {
    const newMessages = updater(state.messages);
    dispatch({ type: 'SET_MESSAGES', payload: newMessages });
  }, [state.messages, dispatch]);
  
  const setViewport = useCallback((viewport: GameState['viewport']) => {
    dispatch({ type: 'SET_VIEWPORT', payload: viewport });
  }, [dispatch]);
  
  const setPan = useCallback((pan: GameState['pan']) => {
    dispatch({ type: 'SET_PAN', payload: pan });
  }, [dispatch]);
  
  const setDragging = useCallback((dragging: boolean) => {
    dispatch({ type: 'SET_DRAGGING', payload: dragging });
  }, [dispatch]);
  
  const setReachableKey = useCallback((updater: (prev: number) => number) => {
    const newKey = updater(state.reachableKey);
    if (newKey !== state.reachableKey) {
      dispatch({ type: 'INCREMENT_REACHABLE_KEY' });
    }
  }, [state.reachableKey, dispatch]);
  
  const setTargetsInRangeKey = useCallback((updater: (prev: number) => number) => {
    const newKey = updater(state.targetsInRangeKey);
    if (newKey !== state.targetsInRangeKey) {
      dispatch({ type: 'INCREMENT_TARGETS_KEY' });
    }
  }, [state.targetsInRangeKey, dispatch]);
  
  const setAITurnState = useCallback((updater: (prev: AITurnState) => AITurnState) => {
    const newState = updater(state.aiTurnState);
    dispatch({ type: 'SET_AI_TURN_STATE', payload: newState });
  }, [state.aiTurnState, dispatch]);
  
  const setTurnState = useCallback((updater: (prev: TurnState) => TurnState) => {
    const newState = updater(state.turnState);
    dispatch({ type: 'SET_TURN_STATE', payload: newState });
  }, [state.turnState, dispatch]);
  
  const setZoom = useCallback((zoom: number) => {
    const newZoom = Math.max(0.25, Math.min(3.0, zoom));
    dispatch({ 
      type: 'SET_VIEWPORT', 
      payload: { ...state.viewport, zoom: newZoom } 
    });
  }, [state.viewport, dispatch]);
  
  const setTargetingMode = useCallback((targetingMode: TargetingMode) => {
    dispatch({ type: 'SET_TARGETING_MODE', payload: targetingMode });
  }, [dispatch]);

  const setWeather = useCallback((weather: WeatherState) => {
    dispatch({ type: 'SET_WEATHER', payload: weather });
  }, [dispatch]);

  const setViewMode = useCallback((viewMode: 'quest' | 'world') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: viewMode });
  }, [dispatch]);

  const setParty = useCallback((updater: (prev: Party) => Party) => {
    const newParty = updater(state.party);
    dispatch({ type: 'SET_PARTY', payload: newParty });
  }, [state.party, dispatch]);

  const setWorldMap = useCallback((updater: (prev: WorldMap) => WorldMap) => {
    const newWorldMap = updater(state.worldMap);
    dispatch({ type: 'SET_WORLDMAP', payload: newWorldMap });
  }, [state.worldMap, dispatch]);

  const setMapDefinition = useCallback((mapDefinition: QuestMap | null) => {
    dispatch({ type: 'SET_MAP_DEFINITION', payload: mapDefinition });
  }, [dispatch]);

  const centerWorldmapOnParty = useCallback(() => {
    dispatch({ type: 'CENTER_WORLDMAP_ON_PARTY' });
  }, [dispatch]);

  const centerQuestmapOnStartingTile = useCallback(() => {
    dispatch({ type: 'CENTER_QUESTMAP_ON_STARTING_TILE' });
  }, [dispatch]);



  const actions = useMemo((): GameActions => ({
    setCreatures,
    setSelectedCreatureId,
    setMessages,
    setViewport,
    setPan,
    setDragging,
    setReachableKey,
    setTargetsInRangeKey,
    setAITurnState,
    setTurnState,
    setZoom,
    setTargetingMode,
    setWeather,
    setViewMode,
    setParty,
    setWorldMap,
    setMapDefinition,
    centerWorldmapOnParty,
    centerQuestmapOnStartingTile,
    dispatch,
  }), [setCreatures, setSelectedCreatureId, setMessages, setViewport, setPan, setDragging, setReachableKey, setTargetsInRangeKey, setAITurnState, setTurnState, setZoom, setTargetingMode, setWeather, setViewMode, setParty, setWorldMap, setMapDefinition, centerWorldmapOnParty, centerQuestmapOnStartingTile, dispatch]);

  // --- REFS ---
  const updateTransform = useCallback((x: number, y: number) => {
    if (panRef.current) {
      panRef.current.style.transform = `translate(${x}px, ${y}px) scale(${state.viewport.zoom})`;
    }
  }, [state.viewport.zoom]);

  const refs = useMemo((): GameRefs => ({
    dragStart,
    panStart,
    panRef,
    livePan,
    rafId,
    viewportRef,
    dragMoved,
    lastMovement,
    updateTransform,
  }), [updateTransform]);

  const contextValue: GameContextValue = {
    state,
    dispatch,
    actions,
    refs
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// --- Hook to use Game Context ---

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
}

// --- Convenience hooks for specific state pieces ---

export function useGameState() {
  const { state } = useGameContext();
  return state;
}

export function useGameActions() {
  const { actions } = useGameContext();
  return actions;
}

export function useGameRefs() {
  const { refs } = useGameContext();
  return refs;
}

export function useGameDispatch() {
  const { dispatch } = useGameContext();
  return dispatch;
}
