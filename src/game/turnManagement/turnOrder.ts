import { Creature, ICreature } from '../../creatures/index';
import { AIBehaviorType } from '../../ai/types';
import { AI_BEHAVIORS } from '../../ai';

/**
 * Turn Order Rules:
 * 1. Player-controlled creatures always act first (order among them doesn't matter)
 * 2. AI-controlled creatures are ordered by behavior:
 *    - Ranged creatures act before melee creatures
 *    - Within the same behavior type, creatures are ordered by agility (highest first)
 * 3. This ensures ranged AI creatures can position themselves before melee creatures engage
 */

/**
 * Get AI behavior type for a creature
 */
export function getAIBehaviorType(creature: ICreature): AIBehaviorType | null {
  if (!creature.isAIControlled()) {
    return null;
  }
  
  // Get AI state from the creature (assuming it's a Monster)
  const aiState = creature.getAIState();
  return aiState?.behavior || AI_BEHAVIORS.MELEE;
}

/**
 * Compare AI creatures by behavior (ranged before melee) then by agility
 */
export function compareAICreaturesByBehavior(a: ICreature, b: ICreature): number {
  const aBehavior = getAIBehaviorType(a);
  const bBehavior = getAIBehaviorType(b);
  
  if (!aBehavior || !bBehavior) {
    return 0;
  }
  
  // Use the behavior's priority system for comparison
  if (aBehavior.shouldActBefore(bBehavior)) return -1;
  if (bBehavior.shouldActBefore(aBehavior)) return 1;
  
  // Same behavior type - use agility as tiebreaker
  return b.agility - a.agility;
}

/**
 * Compare creatures for turn order
 * Player-controlled creatures come first (order doesn't matter)
 * AI-controlled creatures are ordered by behavior (ranged before melee) then by agility
 */
export function compareCreaturesForTurnOrder(a: ICreature, b: ICreature): number {
  const aIsPlayer = a.isPlayerControlled();
  const bIsPlayer = b.isPlayerControlled();
  
  // Player-controlled creatures come first
  if (aIsPlayer && !bIsPlayer) return -1;
  if (!aIsPlayer && bIsPlayer) return 1;
  
  // If both are player-controlled, order doesn't matter (use agility as tiebreaker)
  if (aIsPlayer && bIsPlayer) {
    return b.agility - a.agility;
  }
  
  // Both are AI-controlled - use behavior-based comparison
  return compareAICreaturesByBehavior(a, b);
}

/**
 * Sort creatures by turn order priority
 */
export function sortCreaturesByTurnOrder(creatures: ICreature[]): ICreature[] {
  return [...creatures].sort(compareCreaturesForTurnOrder);
}

/**
 * Get turn order IDs from sorted creatures
 */
export function getTurnOrderIds(creatures: ICreature[]): string[] {
  return sortCreaturesByTurnOrder(creatures).map(c => c.id);
}
