import { Creature } from '../../creatures/index';
import { GameActions, GameRefs } from '../../game/types';
import { MapDefinition } from '../../maps/types';
import { tileFromPointer, GAME_SETTINGS } from '../../utils';
import { addMessage } from '../../game/messageSystem';
import { findCreatureById } from '../../utils/pathfinding';

export interface TileInteractionHandlers {
  handleTileClick: (
    e: React.MouseEvent<HTMLDivElement>,
    selectedCreatureId: string | null,
    creatures: Creature[],
    reachable: { tiles: Array<{ x: number; y: number }>; costMap: Map<string, number>; pathMap: Map<string, Array<{ x: number; y: number }>> },
    mapData: { tiles: string[][] },
    mapDefinition?: MapDefinition,
    targetingMode?: { isActive: boolean; attackerId: string | null; message: string }
  ) => { action: 'none' | 'deselect' | 'movement' | 'targeting_cancelled' };
}

export function createTileInteractionHandlers(gameActions: GameActions, gameRefs: GameRefs): TileInteractionHandlers {
  const { setDragging, setPan, setTargetingMode, dispatch } = gameActions;
  const { dragStart, dragMoved, livePan, viewportRef } = gameRefs;

  function handleTileClick(
    e: React.MouseEvent<HTMLDivElement>,
    selectedCreatureId: string | null,
    creatures: Creature[],
    reachable: { tiles: Array<{ x: number; y: number }>; costMap: Map<string, number>; pathMap: Map<string, Array<{ x: number; y: number }>> },
    mapData: { tiles: string[][] },
    mapDefinition?: MapDefinition,
    targetingMode?: { isActive: boolean; attackerId: string | null; message: string }
  ): { action: 'none' | 'deselect' | 'movement' | 'targeting_cancelled' } {
    const wasDrag = Math.hypot(dragMoved.current.dx, dragMoved.current.dy) > GAME_SETTINGS.DRAG_THRESHOLD;
    setDragging(false);
    setPan({ ...livePan.current }); // Save end position in React state
    dragStart.current = null;

    if (wasDrag) return { action: 'none' }; // Don't handle clicks if we were dragging

    // If in targeting mode and clicking on empty space, cancel targeting mode
    if (targetingMode?.isActive) {
      const pos = tileFromPointer(e.clientX, e.clientY, viewportRef, livePan.current, mapData.tiles[0].length, mapData.tiles.length);
      if (pos) {
        // Check if there's a creature at this position
        const creatureAtPosition = creatures.find(c => c.x === pos.tileX && c.y === pos.tileY);
        if (!creatureAtPosition) {
          // Clicked on empty space - cancel targeting mode
          setTargetingMode({ isActive: false, attackerId: null, message: '' });
          addMessage('Targeting mode cancelled', dispatch);
          return { action: 'targeting_cancelled' };
        }
      }
    }

    const pos = tileFromPointer(e.clientX, e.clientY, viewportRef, livePan.current, mapData.tiles[0].length, mapData.tiles.length);
    
    // If clicked outside map area or on empty tile, deselect creature
    if (!pos) {
      return { action: 'deselect' };
    }

    // Check if clicked on an empty tile (no creature present)
    const creatureAtPosition = creatures.find(c => c.x === pos.tileX && c.y === pos.tileY);
    if (!creatureAtPosition && selectedCreatureId) {
      // Check if this is a highlighted movement tile - if so, don't deselect
      const reachableKeySet = new Set(reachable.tiles.map((t: { x: number; y: number }) => `${t.x},${t.y}`));
      const destKey = `${pos.tileX},${pos.tileY}`;
      
      if (!reachableKeySet.has(destKey)) {
        // Clicked on empty tile that's not highlighted for movement - deselect creature
        return { action: 'deselect' };
      }
      // If it's a highlighted movement tile, continue to movement logic
      return { action: 'movement' };
    }

    // If clicked on a creature, let the creature click handler deal with it
    if (creatureAtPosition) {
      return { action: 'none' };
    }

    // Handle tile click for movement
    if (selectedCreatureId) {
      const reachableKeySet = new Set(reachable.tiles.map((t: { x: number; y: number }) => `${t.x},${t.y}`));
      const destKey = `${pos.tileX},${pos.tileY}`;

      if (reachableKeySet.has(destKey)) {
        return { action: 'movement' };
      }
    }

    return { action: 'none' };
  }

  return {
    handleTileClick,
  };
}
