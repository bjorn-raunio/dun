import { animationManager } from './index';
import { particleManager, SPELL_PARTICLE_CONFIGS } from './particleSystem';

export class AnimatedSpellService {
  /**
   * Animate spell casting with particle effects
   * This only handles the animation, not the actual spell logic
   */
  async animateSpellCast(
    casterId: string,
    targetId: string | undefined,
    spellName: string,
    targetX?: number,
    targetY?: number
  ): Promise<void> {
    const spellAnimationId = animationManager.addSpellCastAnimation(
      casterId,
      targetId,
      spellName
    );

    // Add particle effects based on spell type
    this.addSpellParticleEffect(spellName, targetX, targetY);

    await this.waitForAnimation(spellAnimationId);
  }

  /**
   * Add particle effects for a spell
   */
  private addSpellParticleEffect(spellName: string, x?: number, y?: number): void {
    if (x === undefined || y === undefined) return;

    // Skip fire spells - they use the special CSS fire effect
    const spellType = this.getSpellType(spellName);
    if (spellType === 'fire') return;

    // Convert tile coordinates to pixel coordinates
    const pixelX = x * 32 + 16; // TILE_SIZE is 32, center of tile
    const pixelY = y * 32 + 16;

    // Determine particle effect based on spell name
    const config = SPELL_PARTICLE_CONFIGS[spellType] || SPELL_PARTICLE_CONFIGS.magic;

    // Create particle system
    const systemId = `spell_${spellName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    particleManager.createParticleSystem(systemId, pixelX, pixelY, config, 3500);
  }

  /**
   * Determine spell type from spell name for particle effects
   */
  private getSpellType(spellName: string): string {
    const name = spellName.toLowerCase();
    if (name.includes('ice') || name.includes('frost') || name.includes('freeze')) {
      return 'ice';
    } else if (name.includes('heal') || name.includes('cure') || name.includes('restore') || name.includes('divine') || name.includes('energy')) {
      return 'healing';
    } else if (name.includes('lightning') || name.includes('shock') || name.includes('bolt')) {
      return 'lightning';
    } else if (name.includes('poison') || name.includes('venom') || name.includes('toxin')) {
      return 'poison';
    } else {
      return 'magic'; // Default magic effect
    }
  }

  /**
   * Animate spell damage being dealt
   */
  animateSpellDamage(targetId: string, damage: number): string {
    return animationManager.addDamageAnimation(targetId, damage);
  }

  /**
   * Animate spell healing being applied
   */
  animateSpellHeal(targetId: string, heal: number): string {
    return animationManager.addHealAnimation(targetId, heal);
  }

  /**
   * Animate status effect being applied
   */
  animateStatusEffect(targetId: string, statusEffect: string): string {
    return animationManager.addStatusEffectAnimation(targetId, statusEffect);
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
