import React from 'react';
import { Creature } from '../creatures';
import { GameActions, GameRefs } from '../game/types';
import { createMouseHandlers, MouseHandlers } from './mouseHandlers';
import { createKeyboardHandlers, KeyboardHandlers } from './keyboardHandlers';


// --- Event Handlers Custom Hook ---

export interface EventHandlers {
  mouseHandlers: MouseHandlers;
  keyboardHandlers: KeyboardHandlers;
}

export function useEventHandlers(
  gameActions: GameActions,
  gameRefs: GameRefs,
  creatures: Creature[],
  selectedCreatureId: string | null,
  reachable: { tiles: Array<{ x: number; y: number }>; costMap: Map<string, number> },
  targetsInRangeIds: Set<string>,
  mapData: { tiles: string[][] },
  setSelectedCreatureId: (id: string | null) => void,
  mapDefinition?: any
): EventHandlers {
  // Create mouse handlers
  const mouseHandlers = React.useMemo(() => {
    const handlers = createMouseHandlers(
      gameActions,
      gameRefs,
      creatures,
      selectedCreatureId,
      reachable,
      targetsInRangeIds,
      mapData,
      mapDefinition
    );

    // Wrap the creature click handler to handle selection
    const originalOnCreatureClick = handlers.onCreatureClick;
    handlers.onCreatureClick = (creature: Creature, e: React.MouseEvent) => {
      const selected = creatures.find(c => c.id === selectedCreatureId);

      // If a hero is selected and the clicked creature is a monster, handle attack
      if (selected && selected.kind === "hero" && creature.kind === "monster") {
        originalOnCreatureClick(creature, e);
        return;
      }

      // Otherwise, select the clicked creature
      setSelectedCreatureId(creature.id);
    };

    // Use the original mouse up handler without deselection logic
    // The hero will remain selected after movement

    return handlers;
  }, [
    gameActions,
    gameRefs,
    creatures,
    selectedCreatureId,
    reachable,
    targetsInRangeIds,
    mapData,
    setSelectedCreatureId,
    mapDefinition
  ]);

  // Create keyboard handlers
  const keyboardHandlers = React.useMemo(() => {
    return createKeyboardHandlers(gameActions, creatures, selectedCreatureId);
  }, [gameActions, creatures, selectedCreatureId]);



  return {
    mouseHandlers,
    keyboardHandlers,
  };
}
