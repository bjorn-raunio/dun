import React from "react";
import './App.css';
import { mapDefinition, generateMapTiles } from './maps';
import { useGameState, endTurnWithAI } from './game';
import { MapView, GameUI, TurnTracker } from './components';
import { CreaturePanel } from './components/CreaturePanel';
import { useEventHandlers } from './handlers';
import { useTargetsInRange, useReachableTiles, useSelectedCreature, useKeyboardHandlers, useTurnAdvancement, usePathHighlight, useZoom } from './game/hooks';

// Map and game state are now imported from extracted modules

const tileMapData = {
  name: mapDefinition.name,
  description: mapDefinition.description,
  tiles: generateMapTiles(mapDefinition).tiles,
};

function TileMapView({ mapData }: { mapData: typeof tileMapData }) {
  // Game state management (extracted)
  const [gameState, gameRefs, gameActions] = useGameState(mapDefinition.creatures, mapDefinition);
  const { creatures, selectedCreatureId, messages, reachableKey, targetsInRangeKey, aiTurnState, turnState } = gameState;
  const { setCreatures, setSelectedCreatureId, setMessages, setAITurnState, setTurnState } = gameActions;
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
