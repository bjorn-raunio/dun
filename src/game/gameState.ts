import React from 'react';
import { ICreature, CreatureGroup, Party } from '../creatures/index';
import { GameState, GameRefs, GameActions, ViewportState, PanState, TargetingMode } from './types';
import { TurnState, initializeAITurnState, initializeTurnState } from './turnManagement';
import { GAME_SETTINGS } from '../utils/constants';
import { updateCombatStates } from '../utils/combatStateUtils';
import { QuestMap } from '../maps/types';
import { createWeatherEffect } from './weather';

// --- Game State Management ---

export function useGameState(initialCreatures: ICreature[], mapDefinition?: QuestMap): [GameState, GameRefs, GameActions] {
  // --- VIEWPORT SIZE ---
    const [viewport, setViewport] = React.useState<ViewportState>({ 
    width: window.innerWidth, 
    height: window.innerHeight,
    zoom: 1.0
  });
  
  React.useEffect(() => {
    function handleResize() {
      setViewport(prev => ({ ...prev, width: window.innerWidth, height: window.innerHeight }));
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- PANNING LOGIC ---
  // Calculate initial pan position to center over a starting tile
  const mapWidth = mapDefinition?.width ?? 40;
  const mapHeight = mapDefinition?.height ?? 30;
  const mapPixelWidth = mapWidth * GAME_SETTINGS.TILE_SIZE;
  const mapPixelHeight = mapHeight * GAME_SETTINGS.TILE_SIZE;
  
  // Get the first starting tile to center over (or default to map center)
  const startingTile = mapDefinition?.startingTiles?.[0] ?? { x: Math.floor(mapWidth / 2), y: Math.floor(mapHeight / 2) };
  const startingTilePixelX = startingTile.x * GAME_SETTINGS.TILE_SIZE;
  const startingTilePixelY = startingTile.y * GAME_SETTINGS.TILE_SIZE;
  
  // Account for bottom bar height (195px) in vertical centering
  const bottomBarHeight = 195;
  const availableHeight = window.innerHeight - bottomBarHeight;
  
  // Center the starting tile in the viewport
  const initialPanX = (window.innerWidth / 2) - startingTilePixelX - (GAME_SETTINGS.TILE_SIZE / 2);
  const initialPanY = (availableHeight / 2) - startingTilePixelY - (GAME_SETTINGS.TILE_SIZE / 2);
  
  const [pan, setPan] = React.useState<PanState>({ x: initialPanX, y: initialPanY });
  const [dragging, setDragging] = React.useState(false);
  
  // Recalculate center when viewport changes
  React.useEffect(() => {
    const bottomBarHeight = 195;
    const availableHeight = viewport.height - bottomBarHeight;
    
    // Recalculate center over starting tile when viewport changes
    const newPanX = (viewport.width / 2) - startingTilePixelX - (GAME_SETTINGS.TILE_SIZE / 2);
    const newPanY = (availableHeight / 2) - startingTilePixelY - (GAME_SETTINGS.TILE_SIZE / 2);
    
    setPan({ x: newPanX, y: newPanY });
  }, [viewport.width, viewport.height, startingTilePixelX, startingTilePixelY]);

  // --- ZOOM MANAGEMENT ---
  const setZoom = React.useCallback((newZoom: number) => {
    setViewport(prev => ({ ...prev, zoom: Math.max(0.25, Math.min(3.0, newZoom)) }));
  }, []);

  // --- GAME STATE ---
  const [creatures, setCreatures] = React.useState<ICreature[]>(initialCreatures);
  const [groups, setGroups] = React.useState<CreatureGroup[]>([
    CreatureGroup.PLAYER,
    CreatureGroup.ENEMY,
    CreatureGroup.NEUTRAL
  ]);
  const [selectedCreatureId, setSelectedCreatureId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<string[]>([]);
  const [reachableKey, setReachableKey] = React.useState<number>(0);
  const [targetsInRangeKey, setTargetsInRangeKey] = React.useState<number>(0);
  const [aiTurnState, setAITurnState] = React.useState(initializeAITurnState());
  const [turnState, setTurnState] = React.useState<TurnState>(() => initializeTurnState(initialCreatures));
  const [targetingMode, setTargetingMode] = React.useState<TargetingMode>({
    isActive: false,
    attackerId: null,
    message: ''
  });
  const [party, setParty] = React.useState<Party>(() => {
    const playerCreatures = initialCreatures.filter(c => c.group === CreatureGroup.PLAYER);
    const startingRegionId = 'starting_village'; // Default starting region
    return new Party(startingRegionId, playerCreatures);
  });

  // Weather state
  const [weather, setWeather] = React.useState({
    current: createWeatherEffect('clear'),
    transitionTime: 0,
    isTransitioning: false
  });

  // Initialize combat states when creatures are first loaded
  React.useEffect(() => {
    updateCombatStates(creatures);
  }, []); // Only run once on mount

  // --- REFS ---
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);
  const panStart = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRef = React.useRef<HTMLDivElement>(null);
  const livePan = React.useRef<{ x: number; y: number; zoom: number }>({ x: 0, y: 0, zoom: 1.0 });
  const rafId = React.useRef<number | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const dragMoved = React.useRef<{dx: number; dy: number}>({dx: 0, dy: 0});
  const lastMovement = React.useRef<{creatureId: string; x: number; y: number} | null>(null);

  // Set panRef to current pan when React renders
  React.useEffect(() => {
    livePan.current = { ...pan, zoom: viewport.zoom };
    if (panRef.current) {
      panRef.current.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${viewport.zoom})`;
    }
  }, [pan, viewport.zoom]);

  // Function to update transform with current zoom
  const updateTransform = React.useCallback((x: number, y: number) => {
    if (panRef.current) {
      panRef.current.style.transform = `translate(${x}px, ${y}px) scale(${viewport.zoom})`;
    }
  }, [viewport.zoom]);

  const gameState: GameState = {
    creatures,
    groups, // NEW
    party,
    worldMap: null as any, // This function is not being used - GameContext.tsx handles worldMap initialization
    selectedCreatureId,
    messages,
    viewport,
    pan,
    dragging,
    reachableKey,
    targetsInRangeKey,
    aiTurnState,
    turnState,
    targetingMode,
    weather,
    viewMode: 'quest',
  };

  const gameRefs: GameRefs = {
    dragStart,
    panStart,
    panRef,
    livePan,
    rafId,
    viewportRef,
    dragMoved,
    lastMovement,
    updateTransform,
  };

  const gameActions: GameActions = {
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
    setViewMode: () => {}, // Placeholder - implement actual dispatch logic if needed
    setParty,
    setWorldMap: () => {}, // Placeholder - implement actual dispatch logic if needed
    dispatch: () => {}, // Placeholder - implement actual dispatch logic if needed
  };

  return [gameState, gameRefs, gameActions];
}
