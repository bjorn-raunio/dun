import { Creature } from '../creatures';
import { hasShield, getEffectiveArmor } from './equipment';

// --- Creature Analysis Utilities ---

/**
 * Calculate the threat level of a target creature
 * Used by AI for target evaluation and decision making
 */
export function calculateThreatLevel(target: Creature): number {
  let threat = 0;
  
  // Base threat from combat stats
  threat += target.combat * 2;
  threat += target.strength * 1.5;
  threat += target.agility * 1;
  
  // Equipment-based threat
  if (target.equipment.mainHand) {
    const weapon = target.equipment.mainHand;
    if ('damage' in weapon) {
      threat += weapon.damage * 2;
    }
    if ('range' in weapon) {
      threat += weapon.range.normal * 0.5; // Ranged weapons are more threatening
    }
  }
  
  // Armor reduces threat (harder to kill)
  if (target.equipment.armor) {
    threat += target.equipment.armor.armor * 0.5;
  }
  
  // Shield reduces threat
  if (hasShield(target)) {
    threat += 1;
  }
  
  // Current vitality affects threat
  const vitalityRatio = target.vitality / (target.vitality + 10); // Normalize
  threat *= vitalityRatio;
  
  return Math.max(0, threat);
}

/**
 * Calculate the vulnerability of a target creature
 * Used by AI for target evaluation and decision making
 */
export function calculateVulnerability(target: Creature): number {
  let vulnerability = 0;
  
  // Low vitality makes a target more vulnerable
  const vitalityRatio = target.vitality / (target.vitality + 10);
  vulnerability += (1 - vitalityRatio) * 3;
  
  // Low armor makes a target more vulnerable
  const armorValue = getEffectiveArmor(target);
  vulnerability += Math.max(0, 5 - armorValue) * 0.5;
  
  // Low agility makes a target more vulnerable
  vulnerability += Math.max(0, 5 - target.agility) * 0.3;
  
  // Being engaged makes a target more vulnerable
  if (target.isEngagedWithAll([])) {
    vulnerability += 1;
  }
  
  // No shield makes a target more vulnerable
  if (!hasShield(target)) {
    vulnerability += 0.5;
  }
  
  return Math.max(0, vulnerability);
}

/**
 * Calculate distance-based priority for target selection
 * Different behaviors have different distance preferences
 */
export function calculateDistancePriority(distance: number, behavior: string): number {
  switch (behavior) {
    case 'aggressive':
    case 'berserker':
      return Math.max(0, 10 - distance); // Prefer closer targets
    case 'defensive':
      return Math.max(0, distance - 5); // Prefer farther targets
    case 'cautious':
      return Math.max(0, 8 - distance); // Moderate preference for closer targets
    case 'ambush':
      return distance <= 2 ? 10 : 0; // Only attack very close targets
    default:
      return Math.max(0, 6 - distance); // Default preference for closer targets
  }
}

/**
 * Calculate health ratio for a creature (0-1)
 */
export function calculateHealthRatio(creature: Creature): number {
  return creature.vitality / (creature.vitality + 10);
}


