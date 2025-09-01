import React from 'react';
import { ICreature } from '../creatures/index';
import { GameActions, GameRefs } from '../game/types';
import { createKeyboardHandlers, KeyboardHandlers } from './keyboardHandlers';
import { findCreatureById, getVisibleCreatures } from '../utils/pathfinding';
import { logGame } from '../utils/logging';
import { MapDefinition } from '../maps/types';
import { createMouseHandlers } from './mouseHandlers/mainMouseHandlers';
import { MouseHandlers } from './mouseHandlers/types';

// --- Event Handlers Custom Hook ---

export interface EventHandlers {
  mouseHandlers: MouseHandlers;
  keyboardHandlers: KeyboardHandlers;
}

export function useEventHandlers(
  gameActions: GameActions,
  gameRefs: GameRefs,
  creatures: ICreature[],
  selectedCreatureId: string | null,
  reachable: { tiles: Array<{ x: number; y: number }>; costMap: Map<string, number>; pathMap: Map<string, Array<{ x: number; y: number }>> },
  targetsInRangeIds: Set<string>,
  mapData: { tiles: string[][] },
  setSelectedCreatureId: (id: string | null) => void,
  mapDefinition?: MapDefinition,
  targetingMode?: { isActive: boolean; attackerId: string | null; message: string }
): EventHandlers {
  // Create mouse handlers with organized structure
  const mouseHandlers = React.useMemo(() => {
    const handlers = createMouseHandlers({
      gameActions,
      gameRefs,
      creatures,
      selectedCreatureId,
      reachable,
      targetsInRangeIds,
      mapData,
      setSelectedCreatureId,
      mapDefinition,
      targetingMode
    });

    // Override the creature click handler to handle both targeting mode and creature selection
    handlers.onCreatureClick = (creature: ICreature, e: React.MouseEvent) => {
      // If we're in targeting mode, let the original handler deal with it
      if (targetingMode?.isActive) {
        // Call the original handler for targeting mode
        const originalHandler = createMouseHandlers({
          gameActions,
          gameRefs,
          creatures,
          selectedCreatureId,
          reachable,
          targetsInRangeIds,
          mapData,
          setSelectedCreatureId,
          mapDefinition,
          targetingMode
        });
        originalHandler.onCreatureClick(creature, e);
        return;
      }

      // Otherwise, always select the clicked creature
      setSelectedCreatureId(creature.id);
      
      // If the clicked creature is player-controlled, calculate line of sight
      if (creature.isPlayerControlled() && mapData && mapData.tiles && mapData.tiles.length > 0) {
        const cols = mapData.tiles[0].length;
        const rows = mapData.tiles.length;
        
        logGame(`${creature.name} selected - calculating line of sight at (${creature.x}, ${creature.y})`);
        
        // Get visible creatures for the selected player creature
        const visibleCreatures = getVisibleCreatures(
          creature.x,
          creature.y,
          creatures,
          mapData,
          cols,
          rows,
          mapDefinition
        );
        
        const visibleHostileCreatures = visibleCreatures.filter((c: ICreature) => creature.isHostileTo(c));
        logGame(`${creature.name} can see ${visibleHostileCreatures.length} hostile creatures: ${visibleHostileCreatures.map((c: ICreature) => c.name).join(', ')}`);
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
    mapDefinition,
    targetingMode
  ]);

  // Create keyboard handlers
  const keyboardHandlers = React.useMemo(() => {
    return createKeyboardHandlers(gameActions, creatures, selectedCreatureId, targetingMode);
  }, [gameActions, creatures, selectedCreatureId, targetingMode]);

  return {
    mouseHandlers,
    keyboardHandlers,
  };
}
