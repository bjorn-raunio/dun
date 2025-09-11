import React, { useState } from "react";
import './App.css';
import { endTurn } from './game';
import { GameProvider, useGameContext } from './game/GameContext';
import { MapView, WorldMapView, GameUI, WorldMapBottomBar, HeroSelection } from './components';
import { CreaturePanel } from './components/CreaturePanel';
import { useEventHandlers } from './handlers';
import { useTargetsInRange, useReachableTiles, useSelectedCreature, useKeyboardHandlers, useTurnAdvancement, usePathHighlight, useZoom } from './game/hooks';
import { Hero, ICreature } from './creatures/index';
import { addMessage } from './utils/messageSystem';
import { createQuestMapFromPresetWithWeather } from './maps/presets';
import { returnOfRazbaal } from "./campaigns";

// Map and game state are now imported from extracted modules

function TileMapView() {
  // Game state management using context
  const { state: gameState, actions: gameActions, refs: gameRefs } = useGameContext();
  const { groups, creatures, selectedCreatureId, messages, reachableKey, targetsInRangeKey, aiTurnState, turnState, targetingMode, party } = gameState;
  const { setSelectedCreatureId, setTargetingMode } = gameActions;
  const { panRef, viewportRef, lastMovement, livePan } = gameRefs;

  // Custom hooks for game logic
  const { targetsInRangeIds } = useTargetsInRange(creatures, selectedCreatureId, targetsInRangeKey, party.currentQuestMap ?? null, targetingMode);
  const reachable = useReachableTiles(creatures, selectedCreatureId, party.currentQuestMap ?? null, reachableKey);
  const selectedCreature = useSelectedCreature(creatures, selectedCreatureId);

  // Path highlight hook
  const { highlightedPath, onMouseMove: onPathMouseMove, onMouseLeave: onPathMouseLeave } = usePathHighlight(
    reachable,
    viewportRef,
    livePan.current,
    party.currentQuestMap ?? null,
    reachableKey
  );

  // Zoom hook
  const { onWheel } = useZoom(gameActions, gameRefs, gameState.viewport);

  // Turn advancement hook
  useTurnAdvancement(turnState, creatures, gameActions.setTurnState, gameActions.setReachableKey);

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

  // Handle leaving the current map
  const handleLeaveMap = React.useCallback(() => {
    // Store the current quest map to get the preset creatures
    const currentQuestMap = party.currentQuestMap;
    const initialCreatures = currentQuestMap?.initialCreatures ?? [];

    // Remove preset creatures that were added when entering the map
    const presetCreatureIds = initialCreatures.map(creature => creature.id);

    // Get current creatures from state and filter them
    const currentCreatures = creatures; // Use the creatures from the current state

    // First, call leaveMap on creatures that are NOT being removed (player's heroes)
    const creaturesToKeep = currentCreatures.filter(creature => !presetCreatureIds.includes(creature.id));
    creaturesToKeep.forEach(creature => creature.leaveMap());

    // Remove preset creatures from their groups
    const creaturesToRemove = currentCreatures.filter(creature => presetCreatureIds.includes(creature.id));
    creaturesToRemove.forEach(creature => creature.group.removeCreature(creature));

    // Then filter out the preset creatures
    const filteredCreatures = currentCreatures.filter(creature => !presetCreatureIds.includes(creature.id));

    // Dispatch the filtered creatures directly
    gameActions.dispatch({ type: 'SET_CREATURES', payload: filteredCreatures });

    gameActions.setParty(prevParty => {
      const newParty = prevParty.clone();
      newParty.currentQuestMap = undefined;
      return newParty;
    });

    // Reset last movement tracking when leaving the map
    lastMovement.current = null;

    // Also clear the map definition in the game state and switch back to world mode
    gameActions.dispatch({ type: 'SET_MAP_DEFINITION', payload: null });
    gameActions.dispatch({ type: 'SET_VIEW_MODE', payload: 'world' });
  }, [gameActions, party.currentQuestMap, lastMovement]);


  // Event handlers (extracted)
  const { mouseHandlers } = useEventHandlers(
    gameActions,
    gameRefs,
    creatures,
    selectedCreatureId,
    reachable,
    targetsInRangeIds,
    party.currentQuestMap ?? null,
    setSelectedCreatureId,
    targetingMode
  );

  // Setup keyboard handlers
  useKeyboardHandlers(gameActions, creatures, selectedCreatureId);

  return (
    <div className="App">
      {party.currentQuestMap ? (
        <MapView
          mapDefinition={party.currentQuestMap}
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
          onCenterOnStartingTile={gameActions.centerQuestmapOnStartingTile}
        />
      ) : (
        <>
          <WorldMapView
            onMouseDown={mouseHandlers.onMouseDown}
            onMouseMove={mouseHandlers.onMouseMove}
            onMouseUp={mouseHandlers.onMouseUp}
            onMouseLeave={() => { }} // No special handling needed for world map
            onWheel={onWheel}
            viewportRef={viewportRef}
            panRef={panRef}
            regions={Array.from(gameState.worldMap.regions.values())}
            currentRegionId={gameState.party.currentRegionId}
            onCenterOnParty={gameActions.centerWorldmapOnParty}
            heroes={creatures.filter(c => c.isPlayerControlled())}
            onHeroSelect={(hero) => {
            }}
            onRegionClick={(region) => {
              // Handle region click - enter region without automatically loading a quest map
              // Only allow travel to adjacent regions
              try {
                gameActions.setParty(prevParty => {
                  const newParty = prevParty.clone();
                  newParty.enterRegion(region, gameState.worldMap);
                  return newParty;
                });

                // Clear the map definition since we're not loading a quest map automatically
                gameActions.setMapDefinition(null);
              } catch (error) {
                // Show error message to user (you might want to add a proper error display system)
                console.error('Travel error:', error);
                // You could add a toast notification or error message display here
              }
            }}
            onRegionHover={(region) => {
              // Handle region hover - could show tooltip or highlight
            }}
            onQuestMapSelect={(location) => {
              if(!location.questMap) {
                return;
              }
              // Handle quest map selection - set the selected quest map as current
              // First, create the quest map from the preset with random weather
              const numberOfHeroes = creatures.filter(creature => creature.isPlayerControlled()).length;
              const { questMap: newQuestMap, weather } = createQuestMapFromPresetWithWeather(location.questMap, numberOfHeroes);

              if (newQuestMap) {
                // Set the quest map in the party
                gameActions.setParty(prevParty => {
                  const newParty = prevParty.clone();
                  newParty.currentQuestMap = newQuestMap;
                  return newParty;
                });

                // Update the map definition and weather in the game state
                gameActions.setMapDefinition(newQuestMap);
                gameActions.dispatch({ type: 'SET_WEATHER', payload: { current: weather, transitionTime: 0, isTransitioning: false } });

                // Switch to quest view mode to show the quest map and weather
                gameActions.dispatch({ type: 'SET_VIEW_MODE', payload: 'quest' });

                // Add the preset creatures from the quest map to the game creatures
                if (newQuestMap.initialCreatures) {
                  const newCreatures = [...creatures, ...newQuestMap.initialCreatures];
                  gameActions.dispatch({ type: 'SET_CREATURES', payload: newCreatures });
                }

                // Center the questmap when the party enters the quest map
                gameActions.centerQuestmapOnStartingTile();
              }
            }}
          />
          <WorldMapBottomBar messages={messages} />
        </>
      )}

      {party.currentQuestMap && (
        <>
          <GameUI
            messages={messages}
            onEndTurn={() => {
              endTurn(groups, creatures, party.currentQuestMap!, gameActions.dispatch, lastMovement, turnState, gameActions.setReachableKey);
            }}
            onLeaveMap={handleLeaveMap}
            isAITurnActive={aiTurnState.isAITurnActive}
            turnState={turnState}
            creatures={creatures}
            onCreatureClick={(creature) => setSelectedCreatureId(creature.id)}
            targetingMode={targetingMode}
            mapDefinition={party.currentQuestMap}
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
  const [selectedHeroes, setSelectedHeroes] = useState<Hero[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  const handleHeroesSelected = (heroes: Hero[]) => {
    setSelectedHeroes(heroes);
    setGameStarted(true);
  };

  // Show hero selection screen if no heroes are selected yet
  if (!gameStarted) {
    return <HeroSelection onHeroesSelected={handleHeroesSelected} />;
  }

  return (
    <GameProvider initialCreatures={selectedHeroes} campaign={returnOfRazbaal}>
      <div className="App">
        <TileMapView />
      </div>
    </GameProvider>
  );
}

export default App;
