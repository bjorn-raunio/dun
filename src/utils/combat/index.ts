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
  calculateCriticalDamage,
  generateCriticalHitText,
  calculateEffectiveArmor,
  generateWeaponModifierText,
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

// Legacy exports for backward compatibility
// These maintain the same interface as the old combatUtils.ts
export { executeCombat as executeCombatAttack } from './execution';
