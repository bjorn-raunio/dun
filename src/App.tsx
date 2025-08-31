import React from "react";
import './App.css';
import { mapDefinition, generateMapTiles } from './maps';
import { useGameState, endTurnWithAI } from './game';
import { MapView, GameUI, TurnTracker } from './components';
import { CreaturePanel } from './components/CreaturePanel';
import { useEventHandlers } from './handlers';
import { useTargetsInRange, useReachableTiles, useSelectedCreature, useKeyboardHandlers, useTurnAdvancement, usePathHighlight, useZoom } from './game/hooks';
import { findCreatureById } from './utils/pathfinding';
import { addMessage } from './game/messageSystem';
import { VALIDATION_MESSAGES } from './validation/messages';

// Map and game state are now imported from extracted modules

const tileMapData = {
  name: mapDefinition.name,
  description: mapDefinition.description,
  tiles: generateMapTiles(mapDefinition).tiles,
};

function TileMapView({ mapData }: { mapData: typeof tileMapData }) {
  // Game state management (extracted)
  const [gameState, gameRefs, gameActions] = useGameState(mapDefinition.creatures, mapDefinition);
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
  useTurnAdvancement(turnState, creatures, setTurnState);

  // Attack function for equipment panel - enters targeting mode
  const handleAttack = React.useCallback((attackingCreature: any) => {
    // Check if creature can attack
    if (!attackingCreature.isPlayerControlled() || 
        !attackingCreature.isAlive() || 
        !attackingCreature.hasActionsRemaining()) {
      addMessage(`${attackingCreature.name} cannot attack right now`, setMessages);
      return;
    }

    // Check if there are any hostile creatures
    const hostileCreatures = attackingCreature.getHostileCreatures(creatures);
    if (hostileCreatures.length === 0) {
      addMessage(`No enemies to attack`, setMessages);
      return;
    }

    // Enter targeting mode
    setTargetingMode({
      isActive: true,
      attackerId: attackingCreature.id,
      message: `Select a target for ${attackingCreature.name}'s attack`
    });

    addMessage(`Targeting mode: Click on an enemy to attack with ${attackingCreature.name}`, setMessages);
  }, [creatures, setMessages, setTargetingMode]);

  // Check if creature can attack
  const canAttack = React.useCallback((creature: any) => {
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
          endTurnWithAI(creatures, tileMapData, setCreatures, setMessages, setAITurnState, setTurnState, lastMovement, turnState, mapDefinition);
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
          setCreatures(prevCreatures => prevCreatures.map(c => c.id === creature.id ? creature : c));
        }}
        onAttack={handleAttack}
        canAttack={canAttack}
      />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <TileMapView mapData={tileMapData} />
    </div>
  );
}

export default App;
