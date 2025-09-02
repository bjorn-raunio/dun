import { ICreature } from '../../creatures/index';
import { GameActions, GameRefs } from '../../game/types';
import { QuestMap } from '../../maps/types';
import { tileFromPointer } from '../../utils';
import { findCreatureById, getVisibleCreatures } from '../../utils/pathfinding';
import { logGame } from '../../utils/logging';
import { addMessage } from '../../game/messageSystem';
import { 
  createPanningHandlers, 
  createCombatHandlers, 
  createMovementHandlers, 
  createTileInteractionHandlers 
} from './index';
import { MouseHandlers, MouseHandlerDependencies } from './types';

export function createMouseHandlers(deps: MouseHandlerDependencies): MouseHandlers {
  const {
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
  } = deps;

  // Create specialized handlers
  const panningHandlers = createPanningHandlers(gameRefs);
  const combatHandlers = createCombatHandlers(gameActions);
  const movementHandlers = createMovementHandlers(gameActions, gameRefs);
  const tileInteractionHandlers = createTileInteractionHandlers(gameActions, gameRefs);

  // Enhanced mouse up handler that coordinates between handlers
  function onMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    panningHandlers.onMouseUp(e);
    
    const tileAction = tileInteractionHandlers.handleTileClick(
      e,
      selectedCreatureId,
      creatures,
      reachable,
      mapData,
      mapDefinition,
      targetingMode
    );

    // Handle tile action results
    if (tileAction.action === 'deselect' && selectedCreatureId) {
      setSelectedCreatureId(null);
    } else if (tileAction.action === 'movement' && selectedCreatureId) {
      const pos = tileFromPointer(e.clientX, e.clientY, gameRefs.viewportRef, gameRefs.livePan.current, mapData.tiles[0].length, mapData.tiles.length);

      if (pos) {
        movementHandlers.handleMovement({
          selectedCreatureId,
          targetX: pos.tileX,
          targetY: pos.tileY,
          creatures,
          reachable,
          mapData,
          mapDefinition
        });
      }
    }
  }

  // Handle targeting mode attack
  function handleTargetingModeAttack(attacker: ICreature, target: ICreature) {
    if (!targetsInRangeIds.has(target.id)) {
      addMessage(`Cannot reach target: ${attacker.name} cannot reach ${target.name}`, gameActions.dispatch);
      return false;
    }

    combatHandlers.handleTargetingModeAttack(attacker, target, creatures, mapDefinition, mapData);
    return true;
  }

  // Handle regular attack
  function handleAttack(attacker: ICreature, target: ICreature) {
    if (!targetsInRangeIds.has(target.id)) {
      logGame(`Cannot reach target: ${attacker.name} cannot reach ${target.name}`);
      return false;
    }

    combatHandlers.handleAttack(attacker, target, creatures, mapDefinition, mapData);
    return true;
  }

  // Handle creature selection and line of sight calculation
  function handleCreatureSelection(creature: ICreature) {
    setSelectedCreatureId(creature.id);
    
    if (creature.isPlayerControlled() && mapData?.tiles?.length > 0) {
      const cols = mapData.tiles[0].length;
      const rows = mapData.tiles.length;
      
      logGame(`${creature.name} selected - calculating line of sight at (${creature.x}, ${creature.y})`);
      
      const visibleCreatures = creature.x !== undefined && creature.y !== undefined ? 
        getVisibleCreatures(
          creature.x,
          creature.y,
          creatures,
          mapData,
          cols,
          rows,
          mapDefinition
        ) : [];
      
      const visibleHostileCreatures = visibleCreatures.filter((c: ICreature) => creature.isHostileTo(c));
      logGame(`${creature.name} can see ${visibleHostileCreatures.length} hostile creatures: ${visibleHostileCreatures.map((c: ICreature) => c.name).join(', ')}`);
    }
  }

  // Creature click handler
  function onCreatureClick(creature: ICreature, e: React.MouseEvent) {
    e.stopPropagation();
    
    // Handle targeting mode
    if (targetingMode?.isActive && targetingMode.attackerId) {
      const attacker = findCreatureById(creatures, targetingMode.attackerId);
      if (!attacker) {
        gameActions.setTargetingMode({ isActive: false, attackerId: null, message: '' });
        return;
      }

      if (attacker.isHostileTo(creature) && creature.isAlive()) {
        if (handleTargetingModeAttack(attacker, creature)) {
          return;
        }
      } else {
        gameActions.setTargetingMode({ isActive: false, attackerId: null, message: '' });
        addMessage(`Invalid target: ${creature.name} is not a valid target for ${attacker.name}`, gameActions.dispatch);
        return;
      }
    }

    // Handle regular creature interaction
    const selected = selectedCreatureId ? findCreatureById(creatures, selectedCreatureId) : null;

    if (selected && selected.isPlayerControlled() && selected.isHostileTo(creature)) {
      if (handleAttack(selected, creature)) {
        return;
      }
    }

    // Select the clicked creature
    handleCreatureSelection(creature);
  }

  return {
    // Panning handlers
    onMouseDown: panningHandlers.onMouseDown,
    onMouseMove: panningHandlers.onMouseMove,
    onMouseUp,
    
    // Creature interaction
    onCreatureClick,
    handleTileInteraction: onMouseUp, // Direct reference instead of wrapper function
  };
}
