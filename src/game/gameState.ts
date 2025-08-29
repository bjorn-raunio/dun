import React from 'react';
import { Creature } from '../creatures/index';
import { GameState, GameRefs, GameActions, ViewportState, PanState } from './types';
import { initializeAITurnState } from '../gameLogic/turnManagement';

// --- Game State Management ---

export function useGameState(initialCreatures: Creature[]): [GameState, GameRefs, GameActions] {
  // --- VIEWPORT SIZE ---
  const [viewport, setViewport] = React.useState<ViewportState>({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
  
  React.useEffect(() => {
    function handleResize() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- PANNING LOGIC ---
  const [pan, setPan] = React.useState<PanState>({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  
  // --- GAME STATE ---
  const [creatures, setCreatures] = React.useState<Creature[]>(initialCreatures);
  const [selectedCreatureId, setSelectedCreatureId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<string[]>([]);
  const [reachableKey, setReachableKey] = React.useState<number>(0);
  const [targetsInRangeKey, setTargetsInRangeKey] = React.useState<number>(0);
  const [aiTurnState, setAITurnState] = React.useState(initializeAITurnState());

  // --- REFS ---
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);
  const panStart = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRef = React.useRef<HTMLDivElement>(null);
  const livePan = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafId = React.useRef<number | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const dragMoved = React.useRef<{dx: number; dy: number}>({dx: 0, dy: 0});
  const lastMovement = React.useRef<{creatureId: string; x: number; y: number} | null>(null);

  // Set panRef to current pan when React renders
  React.useEffect(() => {
    livePan.current = { ...pan };
    if (panRef.current) {
      panRef.current.style.transform = `translate(${pan.x}px, ${pan.y}px)`;
    }
  }, [pan]);

  const gameState: GameState = {
    creatures,
    selectedCreatureId,
    messages,
    viewport,
    pan,
    dragging,
    reachableKey,
    targetsInRangeKey,
    aiTurnState,
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
  };

  return [gameState, gameRefs, gameActions];
}
