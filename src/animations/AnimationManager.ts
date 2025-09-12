import { AnimationState, AnimationType, AnimationData, AnimationConfig, AnimationManager, AnimationEvent } from './types';
import { applyEasing, applyMovementEasing } from './easing';
import { GAME_SETTINGS } from '../utils/constants';

export class GameAnimationManager implements AnimationManager {
  public animations: Map<string, AnimationState> = new Map();
  public config: AnimationConfig;
  public enabled: boolean = GAME_SETTINGS.ANIMATIONS.ENABLED;

  constructor() {
    this.config = {
      movement: {
        duration: GAME_SETTINGS.ANIMATIONS.MOVEMENT_DURATION,
        easing: 'linear' // Linear for constant speed
      },
      attack: {
        duration: GAME_SETTINGS.ANIMATIONS.ATTACK_DURATION,
        easing: 'ease-in-out',
        hitDelay: 0.6 // Show hit effect at 60% progress
      },
      spell_cast: {
        duration: GAME_SETTINGS.ANIMATIONS.SPELL_CAST_DURATION,
        easing: 'ease-in-out',
        effectDelay: 0.8 // Show spell effect at 80% progress
      },
      damage: {
        duration: GAME_SETTINGS.ANIMATIONS.DAMAGE_DURATION,
        easing: 'bounce',
        bounceHeight: 2 // 2 tiles high
      },
      heal: {
        duration: GAME_SETTINGS.ANIMATIONS.HEAL_DURATION,
        easing: 'ease-out',
        bounceHeight: 1.5 // 1.5 tiles high
      },
      status_effect: {
        duration: GAME_SETTINGS.ANIMATIONS.STATUS_EFFECT_DURATION,
        easing: 'ease-in-out'
      },
      death: {
        duration: GAME_SETTINGS.ANIMATIONS.DEATH_DURATION,
        easing: 'ease-out'
      }
    };
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      // Clear all animations when disabled
      this.clearAnimations();
    }
  }

  addAnimation(animation: Omit<AnimationState, 'id' | 'startTime' | 'progress' | 'isComplete'>): string {
    // If animations are disabled, return immediately without creating animation
    if (!this.enabled) {
      return '';
    }
    
    const id = `${animation.type}_${animation.data.creatureId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    
    // Get duration from config
    const duration = this.config[animation.type].duration;
    
    const newAnimation: AnimationState = {
      ...animation,
      duration,
      id,
      startTime,
      progress: 0,
      isComplete: false
    };

    this.animations.set(id, newAnimation);
    
    // Emit animation start event
    this.emitAnimationEvent({
      type: 'animation_start',
      animationId: id,
      animationType: animation.type,
      data: animation.data,
      timestamp: startTime
    });

    return id;
  }

  updateAnimations(currentTime: number): void {
    // If animations are disabled, don't update any animations
    if (!this.enabled) {
      return;
    }
    
    const animationsToRemove: string[] = [];

    for (const [id, animation] of Array.from(this.animations.entries())) {
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      
      animation.progress = progress;
      animation.isComplete = progress >= 1;

      // Check for special animation events
      this.checkAnimationEvents(animation, progress);

      if (animation.isComplete) {
        animationsToRemove.push(id);
        
        // Emit animation complete event
        this.emitAnimationEvent({
          type: 'animation_complete',
          animationId: id,
          animationType: animation.type,
          data: animation.data,
          timestamp: currentTime
        });
      }
    }

    // Remove completed animations
    animationsToRemove.forEach(id => this.animations.delete(id));
  }

  private checkAnimationEvents(animation: AnimationState, progress: number): void {
    const config = this.config[animation.type];
    
    if (animation.type === 'attack' && 'hitDelay' in config) {
      const hitDelay = config.hitDelay as number;
      if (progress >= hitDelay && !animation.data.hitTriggered) {
        animation.data.hitTriggered = true;
        this.emitAnimationEvent({
          type: 'animation_hit',
          animationId: animation.id,
          animationType: animation.type,
          data: animation.data,
          timestamp: performance.now()
        });
      }
    }
    
    if (animation.type === 'spell_cast' && 'effectDelay' in config) {
      const effectDelay = config.effectDelay as number;
      if (progress >= effectDelay && !animation.data.effectTriggered) {
        animation.data.effectTriggered = true;
        this.emitAnimationEvent({
          type: 'animation_effect',
          animationId: animation.id,
          animationType: animation.type,
          data: animation.data,
          timestamp: performance.now()
        });
      }
    }
  }

  private emitAnimationEvent(event: AnimationEvent): void {
    // Dispatch custom event that can be listened to by game systems
    window.dispatchEvent(new CustomEvent('gameAnimationEvent', { detail: event }));
  }

  removeAnimation(id: string): void {
    this.animations.delete(id);
  }

  clearAnimations(): void {
    this.animations.clear();
  }

  getAnimationProgress(id: string): number {
    const animation = this.animations.get(id);
    return animation ? animation.progress : 0;
  }

  isAnimationComplete(id: string): boolean {
    const animation = this.animations.get(id);
    return animation ? animation.isComplete : true;
  }

  // Helper methods for specific animation types
  addMovementAnimation(creatureId: string, startPos: { x: number; y: number }, endPos: { x: number; y: number }): string {
    // Calculate distance for constant speed movement
    const distance = Math.sqrt(
      Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2)
    );
    
    // Base speed: 1 tile per 200ms (5 tiles per second)
    const baseSpeed = 200; // ms per tile
    const duration = Math.max(distance * baseSpeed, 100); // Minimum 100ms
    
    return this.addAnimation({
      type: 'movement',
      duration: duration,
      data: {
        creatureId,
        startPosition: startPos,
        endPosition: endPos
      }
    });
  }

  addAttackAnimation(attackerId: string, targetId: string, attackType: 'melee' | 'ranged'): string {
    return this.addAnimation({
      type: 'attack',
      duration: this.config.attack.duration,
      data: {
        creatureId: attackerId,
        targetId,
        attackType
      }
    });
  }

  addSpellCastAnimation(casterId: string, targetId: string | undefined, spellName: string): string {
    return this.addAnimation({
      type: 'spell_cast',
      duration: this.config.spell_cast.duration,
      data: {
        creatureId: casterId,
        targetId,
        spellName
      }
    });
  }

  addDamageAnimation(targetId: string, damage: number): string {
    return this.addAnimation({
      type: 'damage',
      duration: this.config.damage.duration,
      data: {
        creatureId: targetId,
        damage
      }
    });
  }

  addHealAnimation(targetId: string, heal: number): string {
    return this.addAnimation({
      type: 'heal',
      duration: this.config.heal.duration,
      data: {
        creatureId: targetId,
        heal
      }
    });
  }

  addStatusEffectAnimation(targetId: string, statusEffect: string): string {
    return this.addAnimation({
      type: 'status_effect',
      duration: this.config.status_effect.duration,
      data: {
        creatureId: targetId,
        statusEffect
      }
    });
  }

  addDeathAnimation(creatureId: string): string {
    return this.addAnimation({
      type: 'death',
      duration: this.config.death.duration,
      data: {
        creatureId
      }
    });
  }

  // Get all animations for a specific creature
  getCreatureAnimations(creatureId: string): AnimationState[] {
    return Array.from(this.animations.values()).filter(anim => 
      anim.data.creatureId === creatureId || anim.data.targetId === creatureId
    );
  }

  // Check if a creature is currently animating
  isCreatureAnimating(creatureId: string): boolean {
    return this.getCreatureAnimations(creatureId).some(anim => !anim.isComplete);
  }
}
