// --- Combat Utilities Module ---
// This module provides a clean, organized interface for all combat-related functionality

// Re-export types
export * from './types';

// Re-export calculation utilities
export {
  calculateTargetsInRange,
  calculateDamage,
  determineHit,
  isBackAttack,
  checkShieldBlock,
  calculateEffectiveArmor,
  calculateElevationBonus
} from './calculations';

// Re-export combat phase functions
export {
  executeToHitRollMelee,
  executeToHitRollRanged,
  executeBlockRoll,
  executeDamageRoll
} from './phases';

// Re-export main combat execution
export { executeCombat } from './execution';
