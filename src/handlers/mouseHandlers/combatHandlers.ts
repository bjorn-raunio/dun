import { Creature } from '../../creatures/index';
import { GameActions } from '../../game/types';
import { MapDefinition } from '../../maps/types';
import { findCreatureById } from '../../utils/pathfinding';
import { addMessage } from '../../game/messageSystem';
import { VALIDATION_MESSAGES } from '../../validation/messages';

export interface CombatHandlers {
  handleAttack: (attacker: Creature, target: Creature, creatures: Creature[], mapDefinition?: MapDefinition, mapData?: { tiles: string[][] }) => void;
  handleTargetingModeAttack: (attacker: Creature, target: Creature, creatures: Creature[], mapDefinition?: MapDefinition, mapData?: { tiles: string[][] }) => void;
}

export function createCombatHandlers(gameActions: GameActions): CombatHandlers {
  const { setCreatures, setTargetingMode, setTargetsInRangeKey, dispatch } = gameActions;

  function handleAttack(attacker: Creature, target: Creature, creatures: Creature[], mapDefinition?: MapDefinition, mapData?: { tiles: string[][] }) {
    // Perform the attack using the creature's attack method
    const combatResult = attacker.attack(target, creatures, mapDefinition, mapData);

    // Add combat messages
    if (combatResult.toHitMessage) {
      addMessage(combatResult.toHitMessage, dispatch);
    }

    if (combatResult.blockMessage) {
      addMessage(combatResult.blockMessage, dispatch);
    }

    if (combatResult.damageMessage) {
      addMessage(combatResult.damageMessage, dispatch);
    }

    if (combatResult.targetDefeated) {
      addMessage(VALIDATION_MESSAGES.TARGET_DEFEATED(target.name), dispatch);
    }

    // Update creatures state to reflect the attack
    setCreatures(prev => prev.map(c => {
      if (c.id === attacker.id) {
        return attacker;
      } else if (c.id === target.id) {
        return target;
      }
      return c;
    }));

    // Force targets in range recalculation
    setTargetsInRangeKey(prev => prev + 1);
  }

  function handleTargetingModeAttack(attacker: Creature, target: Creature, creatures: Creature[], mapDefinition?: MapDefinition, mapData?: { tiles: string[][] }) {
    // Handle attack in targeting mode
    handleAttack(attacker, target, creatures, mapDefinition, mapData);
    
    // Exit targeting mode
    setTargetingMode({ isActive: false, attackerId: null, message: '' });
  }

  return {
    handleAttack,
    handleTargetingModeAttack,
  };
}
