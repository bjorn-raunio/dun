import { ICreature } from '../../creatures/index';
import { GameActions } from '../../game/types';
import { QuestMap } from '../../maps/types';
import { findCreatureById } from '../../utils/pathfinding';
import { addMessage } from '../../game/messageSystem';
import { VALIDATION_MESSAGES } from '../../validation/messages';

export interface CombatHandlers {
  handleAttack: (attacker: ICreature, target: ICreature, creatures: ICreature[], mapDefinition: QuestMap) => void;
  handleTargetingModeAttack: (attacker: ICreature, target: ICreature, creatures: ICreature[], mapDefinition: QuestMap) => void;
}

export function createCombatHandlers(gameActions: GameActions): CombatHandlers {
  const { setCreatures, setTargetingMode, setTargetsInRangeKey, dispatch } = gameActions;

  function handleAttack(attacker: ICreature, target: ICreature, creatures: ICreature[], mapDefinition: QuestMap) {
    if (!attacker.isAlive() || !target.isAlive()) {
      return;
    }

    // Perform the attack using the creature's attack method
    const combatResult = attacker.attack(target, creatures, mapDefinition);

    // Add combat messages
    if (combatResult.messages && combatResult.messages.length > 0) {
      combatResult.messages.forEach(message => {
        addMessage(message, dispatch);
      });
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

  function handleTargetingModeAttack(attacker: ICreature, target: ICreature, creatures: ICreature[], mapDefinition: QuestMap) {
    if (!attacker.isAlive() || !target.isAlive()) {
      return;
    }

    // Handle attack in targeting mode
    handleAttack(attacker, target, creatures, mapDefinition);
    
    // Exit targeting mode
    setTargetingMode({ isActive: false, attackerId: null, message: '' });
  }

  return {
    handleAttack,
    handleTargetingModeAttack,
  };
}
