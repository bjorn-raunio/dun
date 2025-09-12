import { useEffect, useCallback } from 'react';
import { animationManager, AnimatedMovementService, AnimatedCombatService, AnimatedSpellService } from '../../animations';
import { ICreature } from '../../creatures/interfaces';
import { QuestMap } from '../../maps/types';
import { MovementResult } from '../../utils/movement';
import { CombatResult } from '../../utils/combat/types';
import { Spell } from '../../spells';

export function useAnimations() {
  // Create service instances
  const animatedMovementService = new AnimatedMovementService();
  const animatedCombatService = new AnimatedCombatService();
  const animatedSpellService = new AnimatedSpellService();

  // Set up animation frame loop
  useEffect(() => {
    let animationFrameId: number;

    const updateAnimations = () => {
      animationManager.updateAnimations(performance.now());
      animationFrameId = requestAnimationFrame(updateAnimations);
    };

    animationFrameId = requestAnimationFrame(updateAnimations);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Animation functions (no game logic)
  const animateMovement = useCallback(async (
    creatureId: string,
    path: Array<{ x: number; y: number }>
  ): Promise<void> => {
    return animatedMovementService.animateMovement(creatureId, path);
  }, [animatedMovementService]);

  const animateSingleStep = useCallback(async (
    creatureId: string,
    fromPosition: { x: number; y: number },
    toPosition: { x: number; y: number }
  ): Promise<void> => {
    return animatedMovementService.animateSingleStep(creatureId, fromPosition, toPosition);
  }, [animatedMovementService]);

  const animateAttack = useCallback(async (
    attackerId: string,
    targetId: string,
    attackType: 'melee' | 'ranged'
  ): Promise<void> => {
    return animatedCombatService.animateAttack(attackerId, targetId, attackType);
  }, [animatedCombatService]);

  const animateSpellCast = useCallback(async (
    casterId: string,
    targetId: string | undefined,
    spellName: string,
    targetX?: number,
    targetY?: number
  ): Promise<void> => {
    return animatedSpellService.animateSpellCast(casterId, targetId, spellName, targetX, targetY);
  }, [animatedSpellService]);

  // Helper functions for adding specific animations
  const animateDamage = useCallback((targetId: string, damage: number) => {
    return animatedCombatService.animateDamage(targetId, damage);
  }, [animatedCombatService]);

  const animateHeal = useCallback((targetId: string, heal: number) => {
    return animatedCombatService.animateHeal(targetId, heal);
  }, [animatedCombatService]);

  const animateSpellDamage = useCallback((targetId: string, damage: number) => {
    return animatedSpellService.animateSpellDamage(targetId, damage);
  }, [animatedSpellService]);

  const animateSpellHeal = useCallback((targetId: string, heal: number) => {
    return animatedSpellService.animateSpellHeal(targetId, heal);
  }, [animatedSpellService]);

  const animateStatusEffect = useCallback((targetId: string, statusEffect: string) => {
    return animatedSpellService.animateStatusEffect(targetId, statusEffect);
  }, [animatedSpellService]);

  const animateDeath = useCallback((creatureId: string) => {
    return animatedCombatService.animateDeath(creatureId);
  }, [animatedCombatService]);

  return {
    // Animation functions (no game logic)
    animateMovement,
    animateSingleStep,
    animateAttack,
    animateSpellCast,
    
    // Animation helpers
    animateDamage,
    animateHeal,
    animateSpellDamage,
    animateSpellHeal,
    animateStatusEffect,
    animateDeath,
    
    // Animation settings
    setAnimationsEnabled: (enabled: boolean) => animationManager.setEnabled(enabled),
    
    // Direct access to animation manager
    animationManager
  };
}
