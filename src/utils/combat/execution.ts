import { Creature } from '../../creatures/index';
import { EquipmentSystem } from '../../items/equipment';
import { validateCombat } from '../../validation/combat';
import { updateCombatStates } from '../combatStateUtils';
import { CombatResult } from './types';
import { CombatSkillTriggerManager } from '../../skills';
import { applyStatusEffect, CommonStatusEffects } from '../../statusEffects';
import { logCombat } from '../logging';
import {
  executeToHitRollMelee,
  executeToHitRollRanged,
  executeBlockRoll,
  executeDamageRoll
} from './phases';

// --- Combat Execution ---
// Streamlined combat execution with optimized object creation and message building

/**
 * Execute a combat attack between two creatures
 */
export function executeCombat(
  attacker: Creature,
  target: Creature,
  allCreatures: Creature[],
  mapDefinition?: any,
  mapData?: { tiles: string[][] }
): CombatResult {
  // Face the target when attacking
  attacker.faceTowards(target.x, target.y);

  // Use consolidated validation
  const validation = validateCombat(attacker, target, allCreatures, mapDefinition, mapData);

  if (!validation.isValid) {
    return {
      success: false,
      damage: 0,
      targetDefeated: false,
      messages: [validation.reason || `${attacker.name} cannot attack ${target.name}.`]
    };
  }

  // Check if this is a ranged attack - create EquipmentSystem once and reuse
  const equipment = new EquipmentSystem(attacker.equipment);
  const isRanged = equipment.hasRangedWeapon();

  // Execute unified combat
  const result = executeCombatPhase(attacker, target, isRanged, allCreatures, mapDefinition);

  // Update combat states for all creatures after combat
  updateCombatStates(allCreatures);

  return result;
}

/**
 * Unified combat execution for both melee and ranged combat
 */
function executeCombatPhase(
  attacker: Creature,
  target: Creature,
  isRanged: boolean,
  allCreatures: Creature[],
  mapDefinition?: any
): CombatResult {
  const messages = [];
  // === PART 1: TO-HIT ROLL ===
  const toHitResult = isRanged
    ? executeToHitRollRanged(attacker, target)
    : executeToHitRollMelee(attacker, target, mapDefinition);
  messages.push(toHitResult.toHitMessage);

  // Consume action (regardless of hit or miss)
  attacker.setRemainingActions(attacker.remainingActions - 1);

  if (!toHitResult.hit) {
    // Process miss triggers
    const missResult = {
      success: true,
      damage: 0,
      targetDefeated: false,
      messages: messages
    };

    CombatSkillTriggerManager.processAttackMiss(attacker, target, missResult);
    return missResult;
  }

  // Process hit-related triggers
  const hitResult = {
    success: true,
    damage: 0,
    targetDefeated: false,
    messages: messages
  };

  CombatSkillTriggerManager.processAttackHit(attacker, target, hitResult);

  // Process critical hit triggers
  if (toHitResult.criticalHit) {
    CombatSkillTriggerManager.processCriticalHit(attacker, target, hitResult);
  }

  // Process double critical triggers
  if (toHitResult.attackerDoubleCritical) {
    CombatSkillTriggerManager.processDoubleCritical(attacker, target, hitResult);

    // Universal rule: Double critical hits apply knocked down status unless target has greater size
    if (target.size <= attacker.size) {
      const knockedDownEffect = CommonStatusEffects.knockedDown(target);
      applyStatusEffect(target, knockedDownEffect);
    }
  }

  // Process double result triggers (any doubles: 2&2, 3&3, 4&4, 5&5, 6&6)
  if (toHitResult.attackerDice) {
    CombatSkillTriggerManager.processDoubleResultFromDice(attacker, target, hitResult, toHitResult.attackerDice);
  }

  // === PART 2: BLOCK ROLL ===
  const blockResult = executeBlockRoll(attacker, target, toHitResult.attackerDoubleCritical, toHitResult.criticalHit);
  messages.push(blockResult.blockMessage);

  if (blockResult.blockSuccess) {
    // Shield blocked the attack - no damage
    return {
      success: true,
      damage: 0,
      targetDefeated: false,
      messages: messages
    };
  }

  // === PART 3: DAMAGE ROLL ===
  const damageResult = executeDamageRoll(
    attacker,
    target,
    toHitResult.attackerDoubleCritical,
    toHitResult.criticalHit,
    isRanged
  );
  messages.push(damageResult.damageMessage);

  // Apply damage using the proper method
  target.takeDamage(damageResult.damage);

  // Check if target is defeated
  const targetDefeated = target.isDead();

  // Create final result
  const finalResult = {
    success: true,
    damage: damageResult.damage,
    targetDefeated,
    messages: messages.filter(message => !!message)
  };

  // Process target defeated triggers if applicable
  if (targetDefeated) {
    CombatSkillTriggerManager.processTargetDefeated(attacker, target, finalResult);
  }

  return finalResult;
}