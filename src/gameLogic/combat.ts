import { Creature } from '../creatures/index';
import { GAME_SETTINGS } from '../utils/constants';
import { validateAttack } from '../validation/combat';

// --- Combat Logic ---

export interface CombatResult {
  success: boolean;
  message: string;
  damage: number;
  targetDefeated: boolean;
  toHitMessage?: string;
  damageMessage?: string;
}

/**
 * Calculate combat roll (2d6 + combat bonus)
 */
export function calculateCombatRoll(combatBonus: number): number {
  const roll1 = Math.floor(Math.random() * 6) + 1;
  const roll2 = Math.floor(Math.random() * 6) + 1;
  return roll1 + roll2 + combatBonus;
}

/**
 * Calculate damage roll (Xd6 where X = strength + weapon damage)
 */
export function calculateDamageRoll(strength: number, weaponDamage: number): number[] {
  const numDice = strength + weaponDamage;
  const rolls: number[] = [];
  
  for (let i = 0; i < numDice; i++) {
    rolls.push(Math.floor(Math.random() * 6) + 1);
  }
  
  return rolls;
}

/**
 * Calculate damage based on dice rolls and armor
 */
export function calculateDamage(diceRolls: number[], armorValue: number): number {
  return diceRolls.filter(roll => roll >= armorValue).length;
}

/**
 * Determine if attack hits based on combat rolls and agility
 */
export function determineHit(
  attackerRoll: number,
  defenderRoll: number,
  attackerAgility: number,
  defenderAgility: number,
  attackerHasShield: boolean,
  defenderHasShield: boolean
): boolean {
  if (attackerRoll > defenderRoll) return true;
  if (attackerRoll < defenderRoll) return false;
  
  // Tie - check agility
  if (attackerAgility > defenderAgility) return true;
  if (attackerAgility < defenderAgility) return false;
  
  // Agility tie - check shields
  if (defenderHasShield && !attackerHasShield) return false;
  return true; // Attacker wins if both have shields or neither has shield
}

/**
 * Check if attack is from behind (for back attack bonus)
 * A back attack occurs when the attacker is positioned behind the target
 * The back arc consists of the 3 positions behind the target (opposite and adjacent)
 */
export function isBackAttack(attacker: Creature, target: Creature): boolean {
  // Get direction from target to attacker (where is attacker relative to target)
  const { getDirectionFromTo } = require('../utils/geometry');
  const attackerPositionRelativeToTarget = getDirectionFromTo(target.x, target.y, attacker.x, attacker.y);
  
  // Get the target's facing direction
  const targetFacing = target.facing;
  
  // Calculate the back arc directions (opposite and adjacent)
  const oppositeDirection = (targetFacing + 4) % 8;
  const backArcLeft = (oppositeDirection + 7) % 8;  // One direction left of opposite
  const backArcRight = (oppositeDirection + 1) % 8; // One direction right of opposite
  
  // Check if attacker is positioned in the back arc
  const isBack = attackerPositionRelativeToTarget === oppositeDirection || 
                 attackerPositionRelativeToTarget === backArcLeft || 
                 attackerPositionRelativeToTarget === backArcRight;
  
  // Debug logging
  console.log(`Back attack check: ${attacker.name} at (${attacker.x},${attacker.y}) attacking ${target.name} at (${target.x},${target.y})`);
  console.log(`  Attacker position relative to target: ${attackerPositionRelativeToTarget} (${getDirectionName(attackerPositionRelativeToTarget)}), Target facing: ${targetFacing} (${getDirectionName(targetFacing)})`);
  console.log(`  Back arc: ${oppositeDirection} (${getDirectionName(oppositeDirection)}), ${backArcLeft} (${getDirectionName(backArcLeft)}), ${backArcRight} (${getDirectionName(backArcRight)})`);
  console.log(`  Is back attack: ${isBack}`);
  
  // Helper function to get direction name
  function getDirectionName(dir: number): string {
    const names = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    return names[dir] || 'Unknown';
  }
  
  return isBack;
}

/**
 * Execute a combat attack between two creatures
 */
export function executeCombat(attacker: Creature, target: Creature, allCreatures: Creature[]): CombatResult {
  // Validate attack using extracted validation logic
  const validation = validateAttack(attacker, target, allCreatures);
  
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.reason || `${attacker.name} cannot attack ${target.name}.`,
      damage: 0,
      targetDefeated: false
    };
  }
  
  // Calculate combat bonuses
  const { getAttackBonus, getMainWeapon } = require('../utils/equipment');
  let attackerBonus = getAttackBonus(attacker);
  let defenderBonus = target.combat;
  
  // Track modifiers for display
  const attackerModifiers: string[] = [];
  const defenderModifiers: string[] = [];
  
  // Add weapon combat modifier display
  const mainWeapon = getMainWeapon(attacker);
  const weaponCombatModifier = mainWeapon.combatModifier || 0;
  if (weaponCombatModifier !== 0) {
    const modifierText = weaponCombatModifier > 0 ? `+${weaponCombatModifier}` : `${weaponCombatModifier}`;
    attackerModifiers.push(`weapon ${modifierText}`);
  }
  
  // Check for back attack bonus
  if (isBackAttack(attacker, target)) {
    attackerBonus += 1;
    attackerModifiers.push("back attack +1");
    console.log(`Back attack detected: ${attacker.name} attacking ${target.name} from behind!`);
  }
  
  // Roll for combat
  const attackerRoll = calculateCombatRoll(attackerBonus);
  const defenderRoll = calculateCombatRoll(defenderBonus);
  
  // Check if attack hits
  const attackerHasShield = attacker.equipment.offHand?.constructor.name === 'Shield';
  const defenderHasShield = target.equipment.offHand?.constructor.name === 'Shield';
  
  const hit = determineHit(
    attackerRoll,
    defenderRoll,
    attacker.agility,
    target.agility,
    attackerHasShield,
    defenderHasShield
  );
  
  // Generate to-hit message with modifiers
  const attackerModifierText = attackerModifiers.length > 0 ? ` (${attackerModifiers.join(', ')})` : '';
  const defenderModifierText = defenderModifiers.length > 0 ? ` (${defenderModifiers.join(', ')})` : '';
  const toHitMessage = `${attacker.name} attacks ${target.name}: ${attackerRoll}${attackerModifierText} vs ${defenderRoll}${defenderModifierText}`;
  
  // Consume action (regardless of hit or miss)
  attacker.remainingActions -= 1;
  
  // Reset actions for other creatures in the same group that have already acted
  attacker.resetGroupActions(allCreatures);
  
  if (!hit) {
    return {
      success: true,
      message: `${toHitMessage} - Miss!`,
      toHitMessage,
      damage: 0,
      targetDefeated: false
    };
  }
  
  // Calculate damage
  const { getWeaponDamage } = require('../utils/equipment');
  const weaponDamage = getWeaponDamage(attacker);
  const diceRolls = calculateDamageRoll(attacker.strength, weaponDamage);
  
  // Determine armor value
  const { getEffectiveArmor } = require('../utils/equipment');
  const baseArmorValue = getEffectiveArmor(target);
  
  // Apply attacker's weapon armor modifier to target's armor
  // Negative values reduce target armor (armor-piercing), positive values increase it
  const attackerWeapon = getMainWeapon(attacker);
  const weaponArmorModifier = attackerWeapon.armorModifier || 0;
  const armorValue = baseArmorValue + weaponArmorModifier;
  
  const damage = calculateDamage(diceRolls, armorValue);
  
  // Apply damage
  target.remainingVitality -= damage;
  
  // Check if target is defeated
  const targetDefeated = target.isDead();
  
  // Generate damage message
  const damageMessage = `Damage: ${damage} [${diceRolls.join(',')}] vs armor ${armorValue}`;
  
  return {
    success: true,
    message: `${toHitMessage} - Hit! ${damageMessage}`,
    toHitMessage,
    damageMessage,
    damage,
    targetDefeated
  };
}
