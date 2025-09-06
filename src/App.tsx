import React, { useState } from "react";
import './App.css';
import { mapDefinition } from './maps';
import { QuestMap } from './maps/types';
import { endTurn } from './game';
import { GameProvider, useGameContext } from './game/GameContext';
import { MapView, WorldMapView, GameUI, HeroSelection } from './components';
import { CreaturePanel } from './components/CreaturePanel';
import { useEventHandlers } from './handlers';
import { useTargetsInRange, useReachableTiles, useSelectedCreature, useKeyboardHandlers, useTurnAdvancement, usePathHighlight, useZoom } from './game/hooks';
import { Hero, ICreature } from './creatures/index';
import { addMessage } from './utils/messageSystem';

// Map and game state are now imported from extracted modules

function TileMapView({ mapDefinition }: { mapDefinition: QuestMap }) {
  // Game state management using context
  const { state: gameState, actions: gameActions, refs: gameRefs } = useGameContext();
  const { groups, creatures, selectedCreatureId, messages, reachableKey, targetsInRangeKey, aiTurnState, turnState, targetingMode, viewMode } = gameState;
  const { setSelectedCreatureId, setTargetingMode } = gameActions;
  const { panRef, viewportRef, lastMovement, livePan } = gameRefs;

  // Custom hooks for game logic
  const { targetsInRangeIds } = useTargetsInRange(creatures, selectedCreatureId, targetsInRangeKey, mapDefinition);
  const reachable = useReachableTiles(creatures, selectedCreatureId, mapDefinition, reachableKey);
  const selectedCreature = useSelectedCreature(creatures, selectedCreatureId);

  // Path highlight hook
  const { highlightedPath, onMouseMove: onPathMouseMove, onMouseLeave: onPathMouseLeave } = usePathHighlight(
    reachable,
    viewportRef,
    livePan.current,
    mapDefinition,
    reachableKey
  );

  // Zoom hook
  const { onWheel } = useZoom(gameActions, gameRefs, gameState.viewport);

  // Turn advancement hook
  useTurnAdvancement(turnState, creatures, gameActions.setTurnState);

  // Attack function for equipment panel - enters targeting mode
  const handleAttack = React.useCallback((attackingCreature: ICreature, offhand: boolean = false) => {
    // Check if creature can attack
    if (!attackingCreature.isPlayerControlled() ||
      !attackingCreature.isAlive() ||
      !attackingCreature.hasActionsRemaining()) {
      addMessage(`${attackingCreature.name} cannot attack right now`);
      return;
    }

    // Check if there are any hostile creatures
    const hostileCreatures = attackingCreature.getHostileCreatures(creatures);
    if (hostileCreatures.length === 0) {
      addMessage(`No enemies to attack`);
      return;
    }

    // Enter targeting mode
    setTargetingMode({
      isActive: true,
      attackerId: attackingCreature.id,
      message: `Select a target for ${attackingCreature.name}'s attack`,
      offhand
    });
  }, [creatures, setTargetingMode]);

  // Check if creature can attack
  const canAttack = React.useCallback((creature: ICreature) => {
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
    mapDefinition,
    setSelectedCreatureId,
    targetingMode
  );

  // Setup keyboard handlers
  useKeyboardHandlers(gameActions, creatures, selectedCreatureId);

  return (
    <div className="App">
      {/*<ViewToggle
        currentView={viewMode}
        onViewChange={setViewMode}
      />*/}
      
      {viewMode === 'quest' ? (
        <MapView
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
          onTileClick={() => { }} // Handled in onMouseUp
          viewportRef={viewportRef}
          panRef={panRef}
          targetingMode={targetingMode}
        />
      ) : (
        <WorldMapView
          onMouseDown={mouseHandlers.onMouseDown}
          onMouseMove={mouseHandlers.onMouseMove}
          onMouseUp={mouseHandlers.onMouseUp}
          onMouseLeave={() => {}} // No special handling needed for world map
          onWheel={onWheel}
          viewportRef={viewportRef}
          panRef={panRef}
          regions={Array.from(gameState.worldMap.regions.values())}
          currentRegionId={gameState.party.currentRegionId}
          onRegionClick={(region) => {
            // Handle region click - implement travel logic here
            gameActions.setParty(prevParty => {
              const newParty = prevParty.clone();
              newParty.travelToRegion(region.id);
              return newParty;
            });
          }}
          onRegionHover={(region) => {
            // Handle region hover - could show tooltip or highlight
          }}
        />
      )}
      
      {viewMode === 'quest' && (
        <>
          <GameUI
            messages={messages}
            onEndTurn={() => {
              endTurn(groups, mapDefinition, gameActions.dispatch, lastMovement, turnState);
            }}
            isAITurnActive={aiTurnState.isAITurnActive}
            turnState={turnState}
            creatures={creatures}
            onCreatureClick={(creature) => setSelectedCreatureId(creature.id)}
            targetingMode={targetingMode}
            mapDefinition={mapDefinition}
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
          />
        </>
      )}
    </div>
  );
}

function App() {
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleHeroSelected = (hero: Hero) => {
    setSelectedHero(hero);
    setGameStarted(true);
  };

  // Show hero selection screen if no hero is selected yet
  if (!gameStarted) {
    return <HeroSelection onHeroSelected={handleHeroSelected} />;
  }

  // Show game with selected hero
  const initialCreatures = mapDefinition?.initialCreatures.concat(selectedHero!) ?? [selectedHero!];

  return (
    <GameProvider initialCreatures={initialCreatures} mapDefinition={mapDefinition}>
      <div className="App">
        {mapDefinition ?
          <TileMapView mapDefinition={mapDefinition} />
          : null}
      </div>
    </GameProvider>
  );
}

export default App;
