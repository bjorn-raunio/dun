// Animation system exports
import { GameAnimationManager } from './AnimationManager';

export * from './types';
export type { EasingFunction } from './easing';
export { applyEasing, applyMovementEasing } from './easing';
export * from './AnimationManager';
export * from './AnimatedMovementService';
export * from './AnimatedCombatService';
export * from './AnimatedSpellService';
export * from './particleSystem';

// Create a global animation manager instance
export const animationManager = new GameAnimationManager();
