import React from 'react';
import { Creature } from '../creatures/index';
import { GameActions, GameRefs } from '../game/types';
import { createMouseHandlers, MouseHandlers } from './mouseHandlers';
import { createKeyboardHandlers, KeyboardHandlers } from './keyboardHandlers';
import { findCreatureById, PathfindingSystem } from '../utils/pathfinding';
import { logGame } from '../utils/logging';


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
  reachable: { tiles: Array<{ x: number; y: number }>; costMap: Map<string, number>; pathMap: Map<string, Array<{ x: number; y: number }>> },
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
      const selected = selectedCreatureId ? findCreatureById(creatures, selectedCreatureId) : null;

      // If a player-controlled creature is selected and the clicked creature is hostile, handle attack
      if (selected && selected.isPlayerControlled() && selected.isHostileTo(creature)) {
        originalOnCreatureClick(creature, e);
        return;
      }

      // Otherwise, select the clicked creature
      setSelectedCreatureId(creature.id);
      
      // If the clicked creature is player-controlled, calculate line of sight
      if (creature.isPlayerControlled() && mapData && mapData.tiles && mapData.tiles.length > 0) {
        const cols = mapData.tiles[0].length;
        const rows = mapData.tiles.length;
        
        logGame(`${creature.name} selected - calculating line of sight at (${creature.x}, ${creature.y})`);
        
        // Get visible creatures for the selected player creature
        const visibleCreatures = PathfindingSystem.getVisibleCreatures(
          creature.x,
          creature.y,
          creatures,
          mapData,
          cols,
          rows,
          mapDefinition
        );
        
        const visibleHostileCreatures = visibleCreatures.filter(c => creature.isHostileTo(c));
        logGame(`${creature.name} can see ${visibleHostileCreatures.length} hostile creatures: ${visibleHostileCreatures.map(c => c.name).join(', ')}`);
      }
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
