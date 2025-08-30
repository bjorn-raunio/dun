import { Creature } from '../../creatures/index';
import { EquipmentSystem } from '../../items/equipment';
import { Weapon } from '../../items/types';
import { rollD6 } from '../dice';
import { calculateDistanceBetween } from '../pathfinding';
import { terrainHeightAt } from '../../maps/mapRenderer';
import { isInBackArc } from '../geometry';
import { logCombat } from '../logging';

// --- Combat Calculation Utilities ---

/**
 * Calculate targets in range for a creature
 */
export function calculateTargetsInRange(
  attacker: Creature,
  allCreatures: Creature[]
): Set<string> {
  const equipment = new EquipmentSystem(attacker.equipment);
  const rangeTiles = equipment.getAttackRange();
  const inRange = new Set<string>();

  for (const target of allCreatures) {
    if (attacker.isFriendlyTo(target)) continue; // Same faction
    if (target.isDead()) continue; // Skip dead creatures

    const distance = calculateDistanceBetween(attacker.x, attacker.y, target.x, target.y);
    if (distance <= rangeTiles) {
      inRange.add(target.id);
    }
  }

  return inRange;
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
 */
export function isBackAttack(attacker: Creature, target: Creature): boolean {
  const isBack = isInBackArc(target.x, target.y, target.facing, attacker.x, attacker.y);

  logCombat(`Back attack check: ${attacker.name} at (${attacker.x},${attacker.y}) attacking ${target.name} at (${target.x},${target.y})`, {
    targetFacing: target.facing,
    isBackAttack: isBack
  });

  return isBack;
}

/**
 * Check if a shield blocks an attack
 */
export function checkShieldBlock(shieldBlockValue: number): { blocked: boolean; message: string } {
  const roll = rollD6();
  const blocked = roll >= shieldBlockValue;

  const message = blocked
    ? `Shield blocks! (${roll} >= ${shieldBlockValue})`
    : `Shield fails to block (${roll} < ${shieldBlockValue})`;

  return { blocked, message };
}

/**
 * Calculate critical damage bonus based on hit type
 */
export function calculateCriticalDamage(baseDamage: number, attackerDoubleCritical: boolean, criticalHit: boolean): number {
  if (attackerDoubleCritical) return baseDamage + 2;
  if (criticalHit) return baseDamage + 1;
  return baseDamage;
}

/**
 * Generate critical hit text for display
 */
export function generateCriticalHitText(attackerDoubleCritical: boolean, criticalHit: boolean): string {
  if (attackerDoubleCritical) return " (DOUBLE CRITICAL!)";
  if (criticalHit) return " (CRITICAL HIT!)";
  return "";
}

/**
 * Calculate effective armor value for target
 */
export function calculateEffectiveArmor(target: Creature, targetEquipment: EquipmentSystem, attackerEquipment: EquipmentSystem): number {
  const baseArmorValue = targetEquipment.getEffectiveArmor(target.naturalArmor);
  const weaponArmorModifier = attackerEquipment.getWeaponArmorModifier();
  return baseArmorValue + weaponArmorModifier;
}

/**
 * Generate weapon modifier text for display
 */
export function generateWeaponModifierText(weapon: any, isUnarmed: boolean = false): string {
  if (isUnarmed) return "weapon -1";
  if (!weapon) return "";
  
  const modifier = weapon instanceof Weapon ? (weapon.combatModifier ?? 0) : 0;
  if (modifier === 0) return "";
  
  const modifierText = modifier > 0 ? `+${modifier}` : `${modifier}`;
  return `weapon ${modifierText}`;
}

/**
 * Calculate elevation bonus for melee combat
 */
export function calculateElevationBonus(
  attacker: Creature,
  target: Creature,
  mapDefinition?: any
): { attackerBonus: number; defenderBonus: number } {
  if (!mapDefinition) return { attackerBonus: 0, defenderBonus: 0 };

  const attackerElevation = terrainHeightAt(attacker.x, attacker.y, mapDefinition);
  const targetElevation = terrainHeightAt(target.x, target.y, mapDefinition);

  let attackerBonus = 0;
  let defenderBonus = 0;

  // Attacker gets +1 bonus if they are 1 elevation higher than target
  if (attackerElevation === targetElevation + 1) {
    attackerBonus = 1;
    logCombat(`Elevation bonus: ${attacker.name} is attacking from higher ground (+1 bonus)`);
  }

  // Defender gets +1 bonus if they are 1 elevation higher than attacker
  if (targetElevation === attackerElevation + 1) {
    defenderBonus = 1;
    logCombat(`Elevation bonus: ${target.name} is defending from higher ground (+1 bonus)`);
  }

  return { attackerBonus, defenderBonus };
}
