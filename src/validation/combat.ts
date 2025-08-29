import { Creature } from '../creatures/index';
import { BaseValidationResult } from '../utils/types';

// --- Combat Validation Logic ---

export interface CombatValidationResult extends BaseValidationResult {}

/**
 * Validate if a creature can attack a target
 */
export function validateAttack(
  attacker: Creature,
  target: Creature,
  allCreatures: Creature[]
): CombatValidationResult {
  // Check if attacker is alive
  if (!attacker.isAlive()) {
    return {
      isValid: false,
      reason: `${attacker.name} is dead and cannot attack.`
    };
  }

  // Check if target is alive
  if (!target.isAlive()) {
    return {
      isValid: false,
      reason: `${target.name} is already dead.`
    };
  }

  // Check if attacker has actions remaining
  if (!attacker.hasActionsRemaining()) {
    return {
      isValid: false,
      reason: `${attacker.name} has no actions remaining.`
    };
  }

  // Check if target is hostile
  if (attacker.kind === target.kind) {
    return {
      isValid: false,
      reason: `${attacker.name} cannot attack friendly creatures.`
    };
  }

  // Check if target is in range
  const rangeValidation = validateAttackRange(attacker, target);
  if (!rangeValidation.isValid) {
    return rangeValidation;
  }

  // Check line of sight for ranged attacks
  if (attacker.hasRangedWeapon()) {
    const losValidation = validateLineOfSight(attacker, target, allCreatures);
    if (!losValidation.isValid) {
      return losValidation;
    }
  }

  return { isValid: true };
}

/**
 * Validate if target is within attack range
 */
export function validateAttackRange(attacker: Creature, target: Creature): CombatValidationResult {
  const attackRange = attacker.getAttackRange();
  const distance = Math.max(Math.abs(target.x - attacker.x), Math.abs(target.y - attacker.y));

  if (distance > attackRange) {
    return {
      isValid: false,
      reason: `${target.name} is out of range (${distance}/${attackRange}).`
    };
  }

  return { isValid: true };
}

/**
 * Validate line of sight for ranged attacks
 */
export function validateLineOfSight(
  attacker: Creature,
  target: Creature,
  allCreatures: Creature[]
): CombatValidationResult {
  // For now, implement a simple line of sight check
  // In a full implementation, this would check for walls, obstacles, etc.
  
  const dx = target.x - attacker.x;
  const dy = target.y - attacker.y;
  const distance = Math.max(Math.abs(dx), Math.abs(dy));
  
  // Check each point along the path
  for (let i = 1; i < distance; i++) {
    const t = i / distance;
    const checkX = Math.floor(attacker.x + dx * t);
    const checkY = Math.floor(attacker.y + dy * t);
    
    // Check if there's a blocking creature at this point
    for (const creature of allCreatures) {
      if (creature.id === attacker.id || creature.id === target.id) continue;
      if (creature.isDead()) continue;
      
      const creatureDimensions = creature.getDimensions();
      if (checkX >= creature.x && checkX < creature.x + creatureDimensions.w &&
          checkY >= creature.y && checkY < creature.y + creatureDimensions.h) {
        return {
          isValid: false,
          reason: `${creature.name} is blocking the line of sight to ${target.name}.`
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Validate if a creature can be targeted
 */
export function validateTarget(
  target: Creature,
  allCreatures: Creature[]
): CombatValidationResult {
  // Check if target is alive
  if (!target.isAlive()) {
    return {
      isValid: false,
      reason: `${target.name} is dead and cannot be targeted.`
    };
  }

  // Check if target is visible (not hidden, invisible, etc.)
  // This could be expanded with stealth mechanics
  if (!isTargetVisible(target)) {
    return {
      isValid: false,
      reason: `${target.name} is not visible.`
    };
  }

  return { isValid: true };
}

/**
 * Check if a target is visible
 */
export function isTargetVisible(target: Creature): boolean {
  // For now, all alive creatures are visible
  // This could be expanded with stealth, invisibility, etc.
  return target.isAlive();
}

/**
 * Validate if a creature can use a specific action
 */
export function validateAction(
  creature: Creature,
  actionType: 'move' | 'attack' | 'special'
): CombatValidationResult {
  // Check if creature is alive
  if (!creature.isAlive()) {
    return {
      isValid: false,
      reason: `${creature.name} is dead and cannot perform actions.`
    };
  }

  // Check if creature has actions remaining
  if (!creature.hasActionsRemaining()) {
    return {
      isValid: false,
      reason: `${creature.name} has no actions remaining.`
    };
  }

  // Check specific action requirements
  switch (actionType) {
    case 'move':
      if (creature.remainingMovement <= 0) {
        return {
          isValid: false,
          reason: `${creature.name} has no movement points remaining.`
        };
      }
      break;
    
    case 'attack':
      // Attack validation is handled in validateAttack
      break;
    
    case 'special':
      // Special action validation could be added here
      break;
  }

  return { isValid: true };
}

/**
 * Validate if a creature can equip an item
 */
export function validateEquipment(
  creature: Creature,
  item: any // This would be properly typed based on your item system
): CombatValidationResult {
  // Check if creature is alive
  if (!creature.isAlive()) {
    return {
      isValid: false,
      reason: `${creature.name} is dead and cannot equip items.`
    };
  }

  // Check if item is in creature's inventory
  const hasItem = creature.inventory.some(invItem => invItem.id === item.id);
  if (!hasItem) {
    return {
      isValid: false,
      reason: `${creature.name} doesn't have this item in their inventory.`
    };
  }

  // Check if item is equippable
  if (!isItemEquippable(item)) {
    return {
      isValid: false,
      reason: `This item cannot be equipped.`
    };
  }

  return { isValid: true };
}

/**
 * Check if an item is equippable
 */
export function isItemEquippable(item: any): boolean {
  // This would check if the item is a weapon, armor, shield, etc.
  // For now, assume all items are equippable
  return true;
}
