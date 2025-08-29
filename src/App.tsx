import React from "react";
import './App.css';
import { mapDefinition, generateMapTiles } from './maps';
import { useGameState, endTurnWithAI } from './game';
import { MapView, GameUI, CreaturePanel } from './components';
import { useEventHandlers } from './handlers';
import { useTargetsInRange, useReachableTiles, useSelectedCreature, useKeyboardHandlers } from './hooks';

// Map and game state are now imported from extracted modules

const tileMapData = {
  name: mapDefinition.name,
  description: mapDefinition.description,
  tiles: generateMapTiles(mapDefinition).tiles,
};

function TileMapView({ mapData }: { mapData: typeof tileMapData }) {
  // Game state management (extracted)
  const [gameState, gameRefs, gameActions] = useGameState(mapDefinition.creatures);
  const { creatures, selectedCreatureId, messages, reachableKey, targetsInRangeKey, aiTurnState } = gameState;
  const { setCreatures, setSelectedCreatureId, setMessages, setAITurnState } = gameActions;
  const { panRef, viewportRef, lastMovement } = gameRefs;
  
  // Custom hooks for game logic
  const { targetsInRangeIds } = useTargetsInRange(creatures, selectedCreatureId, targetsInRangeKey);
  const reachable = useReachableTiles(creatures, selectedCreatureId, mapData, reachableKey, mapDefinition);
  const selectedCreature = useSelectedCreature(creatures, selectedCreatureId);

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
    mapDefinition
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
        onMouseDown={mouseHandlers.onMouseDown}
        onMouseMove={mouseHandlers.onMouseMove}
        onMouseUp={mouseHandlers.onMouseUp}
        onCreatureClick={mouseHandlers.onCreatureClick}
        onTileClick={() => {}} // Handled in onMouseUp
        viewportRef={viewportRef}
        panRef={panRef}
      />
      <GameUI
        messages={messages}
        onEndTurn={() => {
          endTurnWithAI(creatures, tileMapData, setCreatures, setMessages, setAITurnState, lastMovement);
        }}
        isAITurnActive={aiTurnState.isAITurnActive}
      />
      <CreaturePanel
        selectedCreature={selectedCreature}
        creatures={creatures}
        onDeselect={() => setSelectedCreatureId(null)}
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
