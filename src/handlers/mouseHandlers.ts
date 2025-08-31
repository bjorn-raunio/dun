import { Creature } from '../creatures/index';
import { GameActions, GameRefs } from '../game/types';
import { tileFromPointer, GAME_SETTINGS } from '../utils';
import { executeMovement } from '../game/movement';
import { calculateCostDifference } from '../utils/movementCost';
import { VALIDATION_MESSAGES } from '../validation/messages';
import { addMessage } from '../game/messageSystem';
import { findCreatureById } from '../utils/pathfinding';
import { logMovement, logGame } from '../utils/logging';
import { MapDefinition } from '../maps/types';

// --- Mouse Event Handlers ---

export interface MouseHandlers {
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCreatureClick: (creature: Creature, e: React.MouseEvent) => void;
}

export function createMouseHandlers(
  gameActions: GameActions,
  gameRefs: GameRefs,
  creatures: Creature[],
  selectedCreatureId: string | null,
  reachable: { tiles: Array<{ x: number; y: number }>; costMap: Map<string, number>; pathMap: Map<string, Array<{ x: number; y: number }>> },
  targetsInRangeIds: Set<string>,
  mapData: { tiles: string[][] },
  setSelectedCreatureId: (id: string | null) => void,
  mapDefinition?: MapDefinition,
  targetingMode?: { isActive: boolean; attackerId: string | null; message: string }
): MouseHandlers {
  const { setDragging, setPan, setCreatures, setReachableKey, setTargetsInRangeKey, setTargetingMode, dispatch } = gameActions;
  const { dragStart, panStart, panRef, livePan, rafId, viewportRef, dragMoved, lastMovement, updateTransform } = gameRefs;

  // Mouse down handler for panning
  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return; // Only handle left mouse button
    
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: livePan.current.x, y: livePan.current.y };
    dragMoved.current = { dx: 0, dy: 0 };
  }

  // Mouse move handler for panning
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragMoved.current = { dx, dy };
    
    const newPan = {
      x: panStart.current.x + dx,
      y: panStart.current.y + dy
    };
    
    livePan.current = { ...newPan, zoom: livePan.current.zoom };
    if (rafId.current === null) {
      rafId.current = window.requestAnimationFrame(() => {
        updateTransform(livePan.current.x, livePan.current.y);
        rafId.current = null;
      });
    }
  }

  // Mouse up handler for panning and tile interaction
  function onMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    const wasDrag = Math.hypot(dragMoved.current.dx, dragMoved.current.dy) > GAME_SETTINGS.DRAG_THRESHOLD;
    setDragging(false);
    setPan({ ...livePan.current }); // Save end position in React state
    dragStart.current = null;

    if (wasDrag) return; // Don't handle clicks if we were dragging

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
          return;
        }
      }
    }

    const pos = tileFromPointer(e.clientX, e.clientY, viewportRef, livePan.current, mapData.tiles[0].length, mapData.tiles.length);
    
    // If clicked outside map area or on empty tile, deselect creature
    if (!pos) {
      if (selectedCreatureId) {
        setSelectedCreatureId(null);
      }
      return;
    }

    // Check if clicked on an empty tile (no creature present)
    const creatureAtPosition = creatures.find(c => c.x === pos.tileX && c.y === pos.tileY);
    if (!creatureAtPosition && selectedCreatureId) {
      // Check if this is a highlighted movement tile - if so, don't deselect
      const reachableKeySet = new Set(reachable.tiles.map((t: { x: number; y: number }) => `${t.x},${t.y}`));
      const destKey = `${pos.tileX},${pos.tileY}`;
      
      if (!reachableKeySet.has(destKey)) {
        // Clicked on empty tile that's not highlighted for movement - deselect creature
        setSelectedCreatureId(null);
        return;
      }
      // If it's a highlighted movement tile, continue to movement logic
    }

    // Handle tile click for movement
    if (selectedCreatureId) {
      const selected = findCreatureById(creatures, selectedCreatureId);
      if (!selected || !selected.isPlayerControlled()) {
        // keep current selection
        return;
      }

      const reachableKeySet = new Set(reachable.tiles.map((t: { x: number; y: number }) => `${t.x},${t.y}`));
      const destKey = `${pos.tileX},${pos.tileY}`;

      let moved = false;
      if (reachableKeySet.has(destKey)) {
        // Get the current creature state to avoid stale closures
        const currentCreature = findCreatureById(creatures, selectedCreatureId);
        if (!currentCreature) return;

        // Get the path to the destination from the pathMap
        const path = reachable.pathMap.get(destKey);
        if (!path) {
          console.error(`No path found for destination (${pos.tileX}, ${pos.tileY})`);
          return;
        }

        // Validate that the path is still valid for the current creature position
        if (path.length > 0 && (path[0].x !== currentCreature.x || path[0].y !== currentCreature.y)) {
          console.warn(`Path is stale - creature moved from (${path[0].x}, ${path[0].y}) to (${currentCreature.x}, ${currentCreature.y}). Recalculating path.`);

          // Recalculate the path for the current position
          const freshReachable = currentCreature.getReachableTiles(creatures, mapData, mapData.tiles[0].length, mapData.tiles.length, mapDefinition);
          const freshPath = freshReachable.pathMap.get(destKey);

          if (!freshPath) {
            console.error(`No fresh path found for destination (${pos.tileX}, ${pos.tileY}) from current position (${currentCreature.x}, ${currentCreature.y})`);
            return;
          }

          // Use the fresh path
          path.length = 0;
          path.push(...freshPath);
        }

        // Calculate the step cost from current position to destination
        const currentCost = reachable.costMap.get(`${currentCreature.x},${currentCreature.y}`) ?? 0;
        const destCost = reachable.costMap.get(destKey) ?? 0;
        const stepCost = calculateCostDifference(currentCost, destCost);

        // Debug logging for movement cost
        logMovement(`Hero at (${currentCreature.x},${currentCreature.y}) moving to (${pos.tileX},${pos.tileY})`, {
          path,
          currentCost,
          destCost,
          stepCost,
          remainingMovement: currentCreature.remainingMovement
        });

        setCreatures(prev => {
          // Check if this is a duplicate movement (React Strict Mode can cause double execution)
          if (lastMovement.current &&
            lastMovement.current.creatureId === selectedCreatureId &&
            lastMovement.current.x === pos.tileX &&
            lastMovement.current.y === pos.tileY) {
            logMovement(`Skipping duplicate movement to (${pos.tileX},${pos.tileY})`);
            return prev;
          }
          const targetCreature = findCreatureById(prev, selectedCreatureId);
          if (!targetCreature) return prev;

          // Execute movement using the path
          const moveResult = executeMovement(targetCreature, path, prev, stepCost, mapData, mapDefinition);
          if (moveResult.status === 'success' || moveResult.status === 'partial') {
            const statusText = moveResult.status === 'partial' ? 'partial' : 'complete';
            logMovement(`${statusText} movement: cost ${moveResult.cost}, moved ${moveResult.tilesMoved}/${moveResult.totalPathLength} tiles, remaining: ${targetCreature.remainingMovement}`);

            // Update last movement to prevent duplicate processing
            lastMovement.current = {
              creatureId: selectedCreatureId,
              x: pos.tileX,
              y: pos.tileY
            };

            moved = true;

            // Force reachable tiles recalculation
            setReachableKey(prev => prev + 1);
            // Force targets in range recalculation
            setTargetsInRangeKey(prev => prev + 1);

            // Check engagement status after movement
            const isEngaged = targetCreature.isEngagedWithAll(prev);
            if (isEngaged) {
              logGame(`${targetCreature.name} is now engaged`);
            }

            return prev.map(c => {
              if (c.id !== selectedCreatureId) return c;
              // Create a new object reference to ensure React detects the change
              return targetCreature.clone();
            });
          } else {
            // Movement failed - log to console
            logMovement(`Movement failed: ${moveResult.message || VALIDATION_MESSAGES.CANNOT_MOVE_THERE(targetCreature.name)}`);
            return prev;
          }
        });

        // Check if we moved onto a space where a dead creature was
        const deadCreatureAtDestination = creatures.find(c =>
          c.isDead() &&
          c.x === pos.tileX &&
          c.y === pos.tileY
        );
        if (deadCreatureAtDestination) {
          logGame(`${selected.name} moves over remains`);
        }
      }
      if (moved) {
        // Deselect after successful movement
        // Note: This would need to be handled by the parent component
        // since we don't have access to setSelectedCreatureId here
      }
    }
  }

  // Creature click handler
  function onCreatureClick(creature: Creature, e: React.MouseEvent) {
    e.stopPropagation();
    
    // If we're in targeting mode, handle attack targeting
    if (targetingMode?.isActive && targetingMode.attackerId) {
      const attacker = findCreatureById(creatures, targetingMode.attackerId);
      if (!attacker) {
        // Cancel targeting mode if attacker no longer exists
        setTargetingMode({ isActive: false, attackerId: null, message: '' });
        return;
      }

      // Check if the clicked creature is a valid target
      if (attacker.isHostileTo(creature) && creature.isAlive()) {
        // Check if target is in range
        if (!targetsInRangeIds.has(creature.id)) {
          addMessage(`Cannot reach target: ${attacker.name} cannot reach ${creature.name}`, dispatch);
          return;
        }

        // Perform the attack
        const combatResult = attacker.attack(creature, creatures, mapDefinition, mapData);

        // Add to-hit message
        if (combatResult.toHitMessage) {
          addMessage(combatResult.toHitMessage!, dispatch);
        }

        // Add block message if present
        if (combatResult.blockMessage) {
          addMessage(combatResult.blockMessage!, dispatch);
        }

        // Add damage message if hit
        if (combatResult.damageMessage) {
          addMessage(combatResult.damageMessage!, dispatch);
        }

        // Add defeat message if target was defeated
        if (combatResult.targetDefeated) {
          addMessage(VALIDATION_MESSAGES.TARGET_DEFEATED(creature.name), dispatch);
        }

        // Update creatures state to reflect the attack
        // Use the modified creatures directly since attack() modifies them in place
        setCreatures(prev => prev.map(c => {
          if (c.id === attacker.id) {
            // Return the attacker with updated remaining actions
            return attacker;
          } else if (c.id === creature.id) {
            // Return the target with updated health/damage
            return creature;
          }
          return c;
        }));

        // Exit targeting mode
        setTargetingMode({ isActive: false, attackerId: null, message: '' });

        // Force targets in range recalculation
        setTargetsInRangeKey(prev => prev + 1);
        return;
      } else {
        // Invalid target - cancel targeting mode
        setTargetingMode({ isActive: false, attackerId: null, message: '' });
        addMessage(`Invalid target: ${creature.name} is not a valid target for ${attacker.name}`, dispatch);
        return;
      }
    }

    const selected = selectedCreatureId ? findCreatureById(creatures, selectedCreatureId) : null;

    // If a player-controlled creature is selected and the clicked creature is hostile, handle attack
    if (selected && selected.isPlayerControlled() && selected.isHostileTo(creature)) {
      if (!targetsInRangeIds.has(creature.id)) {
        logGame(`Cannot reach target: ${selected.name} cannot reach ${creature.name}`);
        return; // keep hero selected
      }

      // Get the current creature state to avoid stale closures
      const currentCreature = selectedCreatureId ? findCreatureById(creatures, selectedCreatureId) : null;
      if (!currentCreature) return;

      // Perform the attack using the creature's attack method
      const combatResult = currentCreature.attack(creature, creatures, mapDefinition, mapData);

              // Add to-hit message
        if (combatResult.toHitMessage) {
          addMessage(combatResult.toHitMessage!, dispatch);
        }

        // Add block message if present
        if (combatResult.blockMessage) {
          addMessage(combatResult.blockMessage!, dispatch);
        }

        // Add damage message if hit
        if (combatResult.damageMessage) {
          addMessage(combatResult.damageMessage!, dispatch);
        }

        // Add defeat message if target was defeated
        if (combatResult.targetDefeated) {
          addMessage(VALIDATION_MESSAGES.TARGET_DEFEATED(creature.name), dispatch);
        }

      // Update creatures state to reflect the attack
      // Use the modified creatures directly since attack() modifies them in place
      setCreatures(prev => prev.map(c => {
        if (c.id === selectedCreatureId) {
          // Return the attacker with updated remaining actions
          return currentCreature;
        } else if (c.id === creature.id) {
          // Return the target with updated health/damage
          return creature;
        }
        return c;
      }));

      // Force targets in range recalculation
      setTargetsInRangeKey(prev => prev + 1);
      return;
    }

    // Otherwise, select the clicked creature
    // Note: This would need to be handled by the parent component
    // since we don't have access to setSelectedCreatureId here
  }

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onCreatureClick,
  };
}
