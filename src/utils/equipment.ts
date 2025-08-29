import { Creature } from '../creatures/index';
import { Weapon, RangedWeapon, Armor, Shield, createWeapon } from '../items';
import { GAME_SETTINGS } from './constants';

// --- Equipment Utilities ---

/**
 * Check if a creature has a ranged weapon equipped
 */
export function hasRangedWeapon(creature: Creature): boolean {
  return creature.equipment.mainHand instanceof RangedWeapon || 
         creature.equipment.offHand instanceof RangedWeapon;
}

/**
 * Check if a creature has a shield equipped
 */
export function hasShield(creature: Creature): boolean {
  return creature.equipment.offHand instanceof Shield;
}

/**
 * Check if a creature has armor equipped
 */
export function hasArmor(creature: Creature): boolean {
  return creature.equipment.armor instanceof Armor;
}

/**
 * Check if a creature has a melee weapon equipped
 * Always returns true since unarmed is considered a melee weapon
 */
export function hasMeleeWeapon(creature: Creature): boolean {
  return creature.equipment.mainHand instanceof Weapon || 
         creature.equipment.offHand instanceof Weapon ||
         (!creature.equipment.mainHand && !creature.equipment.offHand); // Unarmed
}

/**
 * Get the main weapon (prioritizes main hand, then off hand)
 * Returns an unarmed weapon if no weapon is equipped
 */
export function getMainWeapon(creature: Creature): Weapon | RangedWeapon {
  if (creature.equipment.mainHand instanceof Weapon || creature.equipment.mainHand instanceof RangedWeapon) {
    return creature.equipment.mainHand;
  }
  if (creature.equipment.offHand instanceof Weapon || creature.equipment.offHand instanceof RangedWeapon) {
    return creature.equipment.offHand;
  }
  // Return unarmed weapon if no weapon is equipped
  return createWeapon('unarmed');
}

/**
 * Get the equipped armor
 */
export function getEquippedArmor(creature: Creature): Armor | undefined {
  return creature.equipment.armor;
}

/**
 * Get the equipped shield
 */
export function getEquippedShield(creature: Creature): Shield | undefined {
  return creature.equipment.offHand instanceof Shield ? creature.equipment.offHand : undefined;
}

/**
 * Get the effective armor value (equipped armor or natural armor)
 */
export function getEffectiveArmor(creature: Creature): number {
  return creature.equipment.armor?.armor ?? creature.naturalArmor ?? GAME_SETTINGS.DEFAULT_NATURAL_ARMOR;
}

/**
 * Get weapon damage value
 */
export function getWeaponDamage(creature: Creature): number {
  const weapon = getMainWeapon(creature);
  return (weapon as any).damage as number;
}

/**
 * Get weapon range information for a creature
 * @param creature The creature to check
 * @param rangeType The type of range to return ('normal', 'long', or 'info')
 * @returns Range value or range info object
 */
export function getWeaponRange(
  creature: Creature, 
  rangeType: 'normal' | 'long' | 'info' = 'normal'
): number | { rangeTiles: number; isRanged: boolean } {
  const main = creature.equipment.mainHand;
  const offHand = creature.equipment.offHand;
  
  let rangeTiles = 1;
  let isRanged = false;
  
  if (main instanceof Weapon) {
    rangeTiles = Math.max(1, main.reach ?? 1);
  } else if (main instanceof RangedWeapon) {
    isRanged = true;
    rangeTiles = Math.max(1, rangeType === 'long' ? main.range.long : main.range.normal);
  } else if (offHand instanceof RangedWeapon) {
    isRanged = true;
    rangeTiles = Math.max(1, rangeType === 'long' ? offHand.range.long : offHand.range.normal);
  }
  
  // If no weapon equipped, return unarmed range (1)
  if (rangeType === 'info') {
    return { rangeTiles, isRanged };
  }
  
  return rangeTiles;
}

/**
 * Get attack range based on equipped weapons (normal range)
 */
export function getAttackRange(creature: Creature): number {
  return getWeaponRange(creature, 'normal') as number;
}

/**
 * Get maximum attack range (long range for ranged weapons, normal range for melee)
 */
export function getMaxAttackRange(creature: Creature): number {
  return getWeaponRange(creature, 'long') as number;
}

/**
 * Get attack bonus based on weapon type and weapon modifiers
 */
export function getAttackBonus(creature: Creature): number {
  const weapon = getMainWeapon(creature);
  const baseBonus = hasRangedWeapon(creature) ? creature.ranged : creature.combat;
  const weaponModifier = weapon instanceof Weapon ? (weapon.combatModifier ?? 0) : 0;
  return baseBonus + weaponModifier;
}

/**
 * Check if an item is equippable
 */
export function isItemEquippable(item: any): boolean {
  return item instanceof Weapon || 
         item instanceof RangedWeapon || 
         item instanceof Armor || 
         item instanceof Shield;
}

/**
 * Check if an item is a valid weapon
 */
export function isValidWeapon(item: any): boolean {
  return item instanceof Weapon || item instanceof RangedWeapon;
}

/**
 * Check if an item is a valid off-hand item
 */
export function isValidOffHand(item: any): boolean {
  return item instanceof Weapon || item instanceof RangedWeapon || item instanceof Shield;
}

/**
 * Check if an item is valid armor
 */
export function isValidArmor(item: any): boolean {
  return item instanceof Armor;
}
