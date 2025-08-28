import { Weapon, RangedWeapon } from '../items';
import { Creature } from '../creatures';
import { chebyshevDistanceRect, getCreatureDimensions } from './geometry';

// --- Combat Utilities ---

/**
 * Calculate weapon range for a creature
 */
export function calculateWeaponRange(creature: Creature): { rangeTiles: number; isRanged: boolean } {
  let rangeTiles = 1;
  let isRanged = false;
  
  const main = creature.equipment.mainHand;
  const offHand = creature.equipment.offHand;
  
  if (main instanceof Weapon) {
    rangeTiles = Math.max(1, main.reach ?? 1);
  } else if (main instanceof RangedWeapon) {
    isRanged = true;
    rangeTiles = Math.max(1, main.range.normal);
  } else if (offHand instanceof RangedWeapon) {
    isRanged = true;
    rangeTiles = Math.max(1, offHand.range.normal);
  }
  
  return { rangeTiles, isRanged };
}

/**
 * Calculate targets in range for a creature
 */
export function calculateTargetsInRange(
  attacker: Creature,
  allCreatures: Creature[]
): Set<string> {
  const { rangeTiles } = calculateWeaponRange(attacker);
  const attackerDims = getCreatureDimensions(attacker.size);
  const inRange = new Set<string>();
  
  for (const target of allCreatures) {
    if (target.kind === attacker.kind) continue; // Same faction
    if (target.vitality <= 0) continue; // Skip dead creatures
    
    const targetDims = getCreatureDimensions(target.size);
    const dist = chebyshevDistanceRect(
      attacker.x, attacker.y, attackerDims.w, attackerDims.h,
      target.x, target.y, targetDims.w, targetDims.h
    );
    
    if (dist <= rangeTiles) {
      inRange.add(target.id);
    }
  }
  
  return inRange;
}

/**
 * Get all targets in range for a hero
 */
export function getTargetsInRangeForHero(
  hero: Creature,
  allCreatures: Creature[]
): Set<string> {
  return calculateTargetsInRange(hero, allCreatures);
}
