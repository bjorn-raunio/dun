import { animationManager } from './index';

export class AnimatedCombatService {
  /**
   * Animate an attack between two creatures
   * This only handles the animation, not the actual combat logic
   */
  async animateAttack(
    attackerId: string,
    targetId: string,
    attackType: 'melee' | 'ranged'
  ): Promise<void> {
    const attackAnimationId = animationManager.addAttackAnimation(
      attackerId,
      targetId,
      attackType
    );

    await this.waitForAnimation(attackAnimationId);
  }

  /**
   * Animate damage being dealt to a creature
   */
  animateDamage(targetId: string, damage: number): string {
    return animationManager.addDamageAnimation(targetId, damage);
  }

  /**
   * Animate healing being applied to a creature
   */
  animateHeal(targetId: string, heal: number): string {
    return animationManager.addHealAnimation(targetId, heal);
  }

  /**
   * Animate a creature's death
   */
  animateDeath(creatureId: string): string {
    return animationManager.addDeathAnimation(creatureId);
  }

  /**
   * Wait for an animation to complete
   */
  private async waitForAnimation(animationId: string): Promise<void> {
    return new Promise((resolve) => {
      const checkAnimation = () => {
        if (animationManager.isAnimationComplete(animationId)) {
          resolve();
        } else {
          requestAnimationFrame(checkAnimation);
        }
      };
      checkAnimation();
    });
  }
}
