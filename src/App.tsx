import React from "react";
import './App.css';
import { mapDefinition, generateMapTiles } from './maps';
import { endTurnWithAI } from './game';
import { GameProvider, useGameContext } from './game/GameContext';
import { MapView, GameUI, TurnTracker } from './components';
import { CreaturePanel } from './components/CreaturePanel';
import { useEventHandlers } from './handlers';
import { useTargetsInRange, useReachableTiles, useSelectedCreature, useKeyboardHandlers, useTurnAdvancement, usePathHighlight, useZoom, useActions } from './game/hooks';
import { findCreatureById } from './utils/pathfinding';
import { addMessage } from './game/messageSystem';
import { VALIDATION_MESSAGES } from './validation/messages';
import { Creature } from './creatures/index';

// Map and game state are now imported from extracted modules

const tileMapData = {
  name: mapDefinition.name,
  description: mapDefinition.description,
  tiles: generateMapTiles(mapDefinition).tiles,
};

function TileMapView({ mapData }: { mapData: typeof tileMapData }) {
  // Game state management using context
  const { state: gameState, actions: gameActions, refs: gameRefs } = useGameContext();
  const { creatures, selectedCreatureId, messages, reachableKey, targetsInRangeKey, aiTurnState, turnState, targetingMode } = gameState;
  const { setCreatures, setSelectedCreatureId, setMessages, setAITurnState, setTurnState, setTargetingMode } = gameActions;
  const { panRef, viewportRef, lastMovement, livePan } = gameRefs;
  
  // Custom hooks for game logic
  const { targetsInRangeIds } = useTargetsInRange(creatures, selectedCreatureId, targetsInRangeKey, mapData, mapDefinition);
  const reachable = useReachableTiles(creatures, selectedCreatureId, mapData, reachableKey, mapDefinition);
  const selectedCreature = useSelectedCreature(creatures, selectedCreatureId);

  // Path highlight hook
  const { highlightedPath, onMouseMove: onPathMouseMove, onMouseLeave: onPathMouseLeave } = usePathHighlight(
    reachable,
    viewportRef,
    livePan,
    mapData,
    reachableKey
  );

  // Zoom hook
  const { onWheel } = useZoom(gameActions, gameRefs, gameState.viewport);

  // Turn advancement hook
  useTurnAdvancement(turnState, creatures, gameActions.setTurnState);

  // Actions hook (unused but kept for future use)
  const { handleRun, handleSearch } = useActions(
    (creature) => {
      // Update the creature in the creatures array
      gameActions.setCreatures(prevCreatures => prevCreatures.map(c => c.id === creature.id ? creature : c));
    }
  );

  // Enhanced action handlers with messages
  const handleRunWithMessage = React.useCallback((creature: Creature) => {
    const success = creature.run();
    if (success) {
      addMessage(`${creature.name} used an action to run! Movement doubled for this turn.`, gameActions.dispatch);
      // Update the creature in the creatures array
      gameActions.setCreatures(prevCreatures => prevCreatures.map(c => c.id === creature.id ? creature : c));
    } else {
      addMessage(`${creature.name} cannot run right now`, gameActions.dispatch);
    }
  }, [gameActions]);

  const handleSearchWithMessage = React.useCallback((creature: Creature) => {
    const success = creature.search();
    if (success) {
      addMessage(`${creature.name} used an action to search the area...`, gameActions.dispatch);
      // Update the creature in the creatures array
      gameActions.setCreatures(prevCreatures => prevCreatures.map(c => c.id === creature.id ? creature : c));
      
      // TODO: Implement actual search logic (reveal hidden items, traps, etc.)
      // For now, just add a placeholder message
      setTimeout(() => {
        addMessage(`Search complete. No hidden items or traps found.`, gameActions.dispatch);
      }, 1000);
    } else {
      addMessage(`${creature.name} cannot search right now`, gameActions.dispatch);
    }
  }, [gameActions]);

  // Attack function for equipment panel - enters targeting mode
  const handleAttack = React.useCallback((attackingCreature: Creature) => {
    // Check if creature can attack
    if (!attackingCreature.isPlayerControlled() || 
        !attackingCreature.isAlive() || 
        !attackingCreature.hasActionsRemaining()) {
      addMessage(`${attackingCreature.name} cannot attack right now`, gameActions.dispatch);
      return;
    }

    // Check if there are any hostile creatures
    const hostileCreatures = attackingCreature.getHostileCreatures(creatures);
    if (hostileCreatures.length === 0) {
      addMessage(`No enemies to attack`, gameActions.dispatch);
      return;
    }

    // Enter targeting mode
    setTargetingMode({
      isActive: true,
      attackerId: attackingCreature.id,
      message: `Select a target for ${attackingCreature.name}'s attack`
    });
  }, [creatures, setTargetingMode]);

  // Check if creature can attack
  const canAttack = React.useCallback((creature: Creature) => {
    return creature.isPlayerControlled() && 
           creature.isAlive() && 
           creature.hasActionsRemaining() &&
           creature.getHostileCreatures(creatures).length > 0;
  }, [creatures]);

  // Event handlers (extracted)
  const { mouseHandlers } = useEventHandlers(
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
  );

  // Setup keyboard handlers
  useKeyboardHandlers(gameActions, creatures, selectedCreatureId);

  return (
    <div className="App">
      <MapView
        mapData={mapData}
        mapDefinition={mapDefinition}
        creatures={creatures}
        selectedCreatureId={selectedCreatureId}
        reachable={reachable}
        highlightedPath={highlightedPath}
        onMouseDown={mouseHandlers.onMouseDown}
        onMouseMove={(e) => {
          mouseHandlers.onMouseMove(e);
          onPathMouseMove(e);
        }}
        onMouseUp={mouseHandlers.onMouseUp}
        onMouseLeave={onPathMouseLeave}
        onWheel={onWheel}
        onCreatureClick={mouseHandlers.onCreatureClick}
        onTileClick={() => {}} // Handled in onMouseUp
        viewportRef={viewportRef}
        panRef={panRef}
        targetingMode={targetingMode}
      />
      <GameUI
        messages={messages}
        onEndTurn={() => {
          endTurnWithAI(creatures, tileMapData, gameActions.dispatch, lastMovement, turnState, mapDefinition);
        }}
        isAITurnActive={aiTurnState.isAITurnActive}
        turnState={turnState}
        creatures={creatures}
        onCreatureClick={(creature) => setSelectedCreatureId(creature.id)}
        targetingMode={targetingMode}
      />
      <CreaturePanel
        selectedCreature={selectedCreature}
        creatures={creatures}
        onDeselect={() => setSelectedCreatureId(null)}
        onSelectCreature={(creature) => setSelectedCreatureId(creature.id)}
        onCreatureUpdate={(creature) => {
          // Update the creature in the creatures array
          gameActions.setCreatures(prevCreatures => prevCreatures.map(c => c.id === creature.id ? creature : c));
        }}
        onAttack={handleAttack}
        canAttack={canAttack}
        onRun={handleRunWithMessage}
        onSearch={handleSearchWithMessage}
      />
    </div>
  );
}

function App() {
  return (
    <GameProvider initialCreatures={mapDefinition.creatures} mapDefinition={mapDefinition}>
      <div className="App">
        <TileMapView mapData={tileMapData} />
      </div>
    </GameProvider>
  );
}

export default App;
