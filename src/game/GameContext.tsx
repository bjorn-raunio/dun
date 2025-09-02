import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useRef } from 'react';
import { ICreature } from '../creatures/index';
import { gameReducer, GameAction, getInitialGameState } from './gameReducer';
import { GameState, GameRefs, GameActions, TargetingMode } from './types';
import { WeatherState } from './weather';
import { TurnState, initializeAITurnState, initializeTurnState } from './turnManagement';
import { GAME_SETTINGS } from '../utils/constants';
import { updateCombatStates } from '../utils/combatStateUtils';
import { MapDefinition } from '../maps/types';
import { AITurnState } from './turnManagement/types';

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
  mapDefinition 
}: {
  children: React.ReactNode;
  initialCreatures: ICreature[];
  mapDefinition?: MapDefinition;
}) {
  const [state, dispatch] = useReducer(
    gameReducer, 
    getInitialGameState(initialCreatures, mapDefinition)
  );
  
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
    dispatch,
  }), [setCreatures, setSelectedCreatureId, setMessages, setViewport, setPan, setDragging, setReachableKey, setTargetsInRangeKey, setAITurnState, setTurnState, setZoom, setTargetingMode, setWeather, dispatch]);

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
