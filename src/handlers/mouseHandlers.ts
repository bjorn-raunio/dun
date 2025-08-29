import { Creature } from '../creatures/index';
import { GameActions, GameRefs } from '../game/types';
import { tileFromPointer, GAME_SETTINGS } from '../utils';
import { executeMovement } from '../game/movement';
import { calculateCostDifference } from '../utils/movementCost';
import { VALIDATION_MESSAGES } from '../validation/messages';
import { addMessage } from '../game/messageSystem';
import { findCreatureById } from '../utils/pathfinding';

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
  reachable: { tiles: Array<{ x: number; y: number }>; costMap: Map<string, number> },
  targetsInRangeIds: Set<string>,
  mapData: { tiles: string[][] },
  mapDefinition?: any
): MouseHandlers {
  const { setDragging, setPan, setCreatures, setMessages, setReachableKey, setTargetsInRangeKey } = gameActions;
  const { dragStart, panStart, panRef, livePan, rafId, viewportRef, dragMoved, lastMovement } = gameRefs;



  // Mouse down handler for panning
  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...livePan.current };
    dragMoved.current = { dx: 0, dy: 0 };
  }

  // Mouse move handler for panning
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragMoved.current = { dx, dy };
    const newPan = { x: panStart.current.x + dx, y: panStart.current.y + dy };
    livePan.current = newPan;
    if (rafId.current === null) {
      rafId.current = window.requestAnimationFrame(() => {
        if (panRef.current) {
          panRef.current.style.transform = `translate(${livePan.current.x}px, ${livePan.current.y}px)`;
        }
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

    const pos = tileFromPointer(e.clientX, e.clientY, viewportRef, livePan.current, mapData.tiles[0].length, mapData.tiles.length);
    if (!pos) return;

    // Handle tile click for movement
    if (selectedCreatureId) {
      const selected = findCreatureById(creatures, selectedCreatureId);
      if (!selected || !selected.isPlayerControlled()) {
        // keep current selection
        return;
      }

      const reachableKeySet = new Set(reachable.tiles.map((t: any) => `${t.x},${t.y}`));
      const destKey = `${pos.tileX},${pos.tileY}`;

      let moved = false;
      if (reachableKeySet.has(destKey)) {
        // Get the current creature state to avoid stale closures
        const currentCreature = findCreatureById(creatures, selectedCreatureId);
        if (!currentCreature) return;
        
        // Calculate the step cost from current position to destination
        const currentCost = reachable.costMap.get(`${currentCreature.x},${currentCreature.y}`) ?? 0;
        const destCost = reachable.costMap.get(destKey) ?? 0;
        const stepCost = calculateCostDifference(currentCost, destCost);
        
        // Debug logging for movement cost
        console.log(`Movement cost debug: Hero at (${currentCreature.x},${currentCreature.y}) moving to (${pos.tileX},${pos.tileY})`);
        console.log(`  Current cost: ${currentCost}, Dest cost: ${destCost}, Step cost: ${stepCost}`);
        console.log(`  Remaining movement before: ${currentCreature.remainingMovement}`);
        
                 setCreatures(prev => {
           // Check if this is a duplicate movement (React Strict Mode can cause double execution)
           if (lastMovement.current && 
               lastMovement.current.creatureId === selectedCreatureId &&
               lastMovement.current.x === pos.tileX &&
               lastMovement.current.y === pos.tileY) {
             console.log(`  Skipping duplicate movement to (${pos.tileX},${pos.tileY})`);
             return prev;
           }
           const targetCreature = prev.find(c => c.id === selectedCreatureId);
           if (!targetCreature) return prev;
           
                       // Execute movement using extracted logic
                          const moveResult = executeMovement(targetCreature, pos.tileX, pos.tileY, prev, stepCost, mapData, mapDefinition);
           
           if (moveResult.success) {
             console.log(`  Movement cost applied: ${moveResult.cost}, Remaining after: ${targetCreature.remainingMovement}`);
             
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
                addMessage(VALIDATION_MESSAGES.NOW_ENGAGED(targetCreature.name), setMessages);
              }
             
             return prev.map(c => {
               if (c.id !== selectedCreatureId) return c;
               // Create a new object reference to ensure React detects the change
               return targetCreature.clone();
             });
                       } else {
              // Movement failed - show message
              addMessage(moveResult.message || VALIDATION_MESSAGES.CANNOT_MOVE_THERE(targetCreature.name), setMessages);
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
                       addMessage(VALIDATION_MESSAGES.MOVES_OVER_REMAINS(selected.name), setMessages);
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
    const selected = selectedCreatureId ? findCreatureById(creatures, selectedCreatureId) : null;

         // If a player-controlled creature is selected and the clicked creature is hostile, handle attack
     if (selected && selected.isPlayerControlled() && selected.isHostileTo(creature)) {
       if (!targetsInRangeIds.has(creature.id)) {
         addMessage(VALIDATION_MESSAGES.CANNOT_REACH_TARGET(selected.name, creature.name), setMessages);
         return; // keep hero selected
       }
      
      // Get the current creature state to avoid stale closures
      const currentCreature = selectedCreatureId ? findCreatureById(creatures, selectedCreatureId) : null;
      if (!currentCreature) return;
      
             // Perform the attack using the creature's attack method
       const combatResult = currentCreature.attack(creature, creatures, mapDefinition);
      
      // Add to-hit message
      if (combatResult.toHitMessage) {
        addMessage(combatResult.toHitMessage!, setMessages);
      }
      
      // Add damage message if hit
      if (combatResult.damageMessage) {
        addMessage(combatResult.damageMessage!, setMessages);
      }
      
             // Add defeat message if target was defeated
       if (combatResult.targetDefeated) {
         addMessage(VALIDATION_MESSAGES.TARGET_DEFEATED(creature.name), setMessages);
       }
      
      // Set remaining movement to zero if the creature has already moved this turn
      const hasMoved = currentCreature.hasMoved();
      
             // Set remaining movement to zero if already moved (action already consumed in attack method)
       setCreatures(prev => prev.map(c => {
         if (c.id === selectedCreatureId) {
           // Ensure we're working with class instances
           if (hasMoved) {
             c.useMovement(c.remainingMovement);
           }
           return c;
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
