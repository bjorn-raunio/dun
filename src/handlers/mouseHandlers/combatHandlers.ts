import { ICreature } from '../../creatures/index';
import { GameActions } from '../../game/types';
import { QuestMap } from '../../maps/types';
import { findCreatureById } from '../../utils/pathfinding';
import { addMessage, addCombatMessage } from '../../utils/messageSystem';
import { VALIDATION_MESSAGES } from '../../validation/messages';

export interface CombatHandlers {
  handleAttack: (attacker: ICreature, target: ICreature, creatures: ICreature[], mapDefinition: QuestMap | null, offhand?: boolean) => void;
  handleTargetingModeAttack: (attacker: ICreature, target: ICreature, creatures: ICreature[], mapDefinition: QuestMap | null, offhand?: boolean) => void;
}

export function createCombatHandlers(gameActions: GameActions): CombatHandlers {
  const { setCreatures, setTargetingMode, setTargetsInRangeKey, dispatch } = gameActions;

  function handleAttack(attacker: ICreature, target: ICreature, creatures: ICreature[], mapDefinition: QuestMap | null, offhand: boolean = false) {
    if (!attacker.isAlive() || !target.isAlive() || !mapDefinition) {
      return;
    }
    
    // Perform the attack using the creature's attack method
    const combatResult = attacker.attack(target, creatures, mapDefinition, offhand);

    // Add defeat message if target was defeated
    if (combatResult.targetDefeated) {
      addCombatMessage(VALIDATION_MESSAGES.TARGET_DEFEATED(target.name));
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

  function handleTargetingModeAttack(attacker: ICreature, target: ICreature, creatures: ICreature[], mapDefinition: QuestMap | null, offhand: boolean = false) {
    if (!attacker.isAlive() || !target.isAlive()) {
      return;
    }

    // Handle attack in targeting mode
    handleAttack(attacker, target, creatures, mapDefinition, offhand);
    
    // Exit targeting mode
    setTargetingMode({ isActive: false, attackerId: null, message: '' });
  }

  return {
    handleAttack,
    handleTargetingModeAttack,
  };
}
