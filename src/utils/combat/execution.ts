import { Creature } from '../../creatures/index';
import { EquipmentSystem } from '../../items/equipment';
import { validateCombat } from '../../validation/combat';
import { updateCombatStates } from '../combatStateUtils';
import { CombatResult } from './types';
import { 
  executeToHitRollMelee, 
  executeToHitRollRanged, 
  executeBlockRoll, 
  executeDamageRoll 
} from './phases';

// --- Combat Execution ---

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
      message: validation.reason || `${attacker.name} cannot attack ${target.name}.`,
      damage: 0,
      targetDefeated: false
    };
  }

  // Check if this is a ranged attack
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
  // === PART 1: TO-HIT ROLL ===
  const toHitResult = isRanged 
    ? executeToHitRollRanged(attacker, target)
    : executeToHitRollMelee(attacker, target, mapDefinition);

  // Consume action (regardless of hit or miss)
  attacker.setRemainingActions(attacker.remainingActions - 1);

  if (!toHitResult.hit) {
    const missMessage = isRanged ? " - Miss! (needs 10+)" : " - Miss!";
    return {
      success: true,
      message: `${toHitResult.toHitMessage}${missMessage}`,
      toHitMessage: toHitResult.toHitMessage,
      damage: 0,
      targetDefeated: false
    };
  }

  // === PART 2: BLOCK ROLL ===
  const blockResult = executeBlockRoll(attacker, target, toHitResult.attackerDoubleCritical, toHitResult.criticalHit);

  if (blockResult.blockSuccess) {
    // Shield blocked the attack - no damage
    return {
      success: true,
      message: `${toHitResult.toHitMessage} - Hit! ${blockResult.blockMessage} - Attack blocked!`,
      toHitMessage: toHitResult.toHitMessage,
      blockMessage: blockResult.blockMessage,
      damage: 0,
      targetDefeated: false
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

  // Apply damage using the proper method
  target.takeDamage(damageResult.damage);

  // Check if target is defeated
  const targetDefeated = target.isDead();

  return {
    success: true,
    message: `${toHitResult.toHitMessage} - Hit! ${blockResult.blockMessage} ${damageResult.damageMessage}`,
    toHitMessage: toHitResult.toHitMessage,
    blockMessage: blockResult.blockMessage,
    damageMessage: damageResult.damageMessage,
    damage: damageResult.damage,
    targetDefeated
  };
}
