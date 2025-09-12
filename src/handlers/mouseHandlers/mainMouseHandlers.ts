import { ICreature } from '../../creatures/index';
import { GameActions, GameRefs } from '../../game/types';
import { QuestMap } from '../../maps/types';
import { tileFromPointer, GAME_SETTINGS } from '../../utils';
import { findCreatureById, getVisibleCreatures } from '../../utils/pathfinding';
import { logGame } from '../../utils/logging';
import { addMessage } from '../../utils/messageSystem';
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
  async function onMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    panningHandlers.onMouseUp(e);
    
    const tileAction = tileInteractionHandlers.handleTileClick(
      e,
      selectedCreatureId,
      creatures,
      reachable,
      mapDefinition,
      targetingMode
    );

    // Handle tile action results
    if (tileAction.action === 'deselect' && selectedCreatureId) {
      setSelectedCreatureId(null);
    } else if (tileAction.action === 'movement' && selectedCreatureId && mapDefinition) {
              const pos = tileFromPointer(e.clientX, e.clientY, gameRefs.viewportRef, gameRefs.livePan.current, mapDefinition.tiles[0].length, mapDefinition.tiles.length, GAME_SETTINGS.TILE_SIZE);

      if (pos) {
        await movementHandlers.handleMovement({
          selectedCreatureId,
          targetX: pos.tileX,
          targetY: pos.tileY,
          creatures,
          reachable,
          mapDefinition
        });
      }
    }
  }

  // Handle targeting mode attack
  function handleTargetingModeAttack(attacker: ICreature, target: ICreature) {
    if (!targetsInRangeIds.has(target.id)) {
      addMessage(`Cannot reach target: ${attacker.name} cannot reach ${target.name}`);
      return false;
    }

    const offhand = targetingMode && 'offhand' in targetingMode ? (targetingMode.offhand as boolean) : false;
    combatHandlers.handleTargetingModeAttack(attacker, target, creatures, mapDefinition, offhand);
    return true;
  }

  // Handle targeting mode spell casting
  function handleTargetingModeSpell(attacker: ICreature, target: ICreature) {
    if (!targetingMode?.spellId || !targetingMode?.targetType) {
      addMessage(`Invalid spell targeting mode`);
      return false;
    }

    // Get the spell from the attacker's known spells
    const spell = attacker.getKnownSpells().find(s => s.name === targetingMode.spellId);
    if (!spell) {
      addMessage(`Spell not found: ${targetingMode.spellId}`);
      return false;
    }

    // Validate target type
    if (targetingMode.targetType === 'ally' && attacker.isHostileTo(target)) {
      addMessage(`Invalid target: ${target.name} is not an ally`);
      return false;
    }
    if (targetingMode.targetType === 'enemy' && !attacker.isHostileTo(target)) {
      addMessage(`Invalid target: ${target.name} is not an enemy`);
      return false;
    }

    // Cast the spell
    const success = attacker.castSpell(spell, target, creatures);
    
    // Trigger particle effects if spell was successful
    if (success && target.x !== undefined && target.y !== undefined) {
      // Use the animations from the game context
      const animations = deps.animations;
      if (animations && animations.animateSpellCast) {
        animations.animateSpellCast(attacker.id, target.id, spell.name, target.x, target.y);
      }
    }
    
    // Update creatures state (action was consumed regardless of success/failure)
    gameActions.setCreatures(prev => prev.map(c => c.id === attacker.id ? attacker : c));
    
    // Exit targeting mode (action was consumed, so player can't try again)
    gameActions.setTargetingMode({ isActive: false, attackerId: null, message: '' });
    
    return success;
  }

  // Handle regular attack
  function handleAttack(attacker: ICreature, target: ICreature) {
    if (!targetsInRangeIds.has(target.id)) {
      logGame(`Cannot reach target: ${attacker.name} cannot reach ${target.name}`);
      return false;
    }

    combatHandlers.handleAttack(attacker, target, creatures, mapDefinition);
    return true;
  }

  // Handle creature selection and line of sight calculation
  function handleCreatureSelection(creature: ICreature) {
    setSelectedCreatureId(creature.id);
    
    if (creature.isPlayerControlled() && mapDefinition?.tiles && mapDefinition.tiles.length > 0) {
      const cols = mapDefinition.tiles[0].length;
      const rows = mapDefinition.tiles.length;
      
      logGame(`${creature.name} selected - calculating line of sight at (${creature.x}, ${creature.y})`);
      
      const visibleCreatures = creature.x !== undefined && creature.y !== undefined ? 
        getVisibleCreatures(
          creature.x,
          creature.y,
          creatures,
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

      // Handle spell targeting
      if (targetingMode.spellId) {
        if (creature.isAlive()) {
          handleTargetingModeSpell(attacker, creature);
          return; // Always return after spell targeting attempt
        } else {
          addMessage(`Cannot target dead creature: ${creature.name}`);
          return;
        }
      }
      // Handle attack targeting
      else if (attacker.isHostileTo(creature) && creature.isAlive()) {
        if (handleTargetingModeAttack(attacker, creature)) {
          return;
        }
      } else {
        gameActions.setTargetingMode({ isActive: false, attackerId: null, message: '' });
        addMessage(`Invalid target: ${creature.name} is not a valid target for ${attacker.name}`);
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
