import { StatusEffect, StatusEffectType, StatusEffectManager } from './types';
import { generateId } from '../utils/idGeneration';
import { 
  getStatusEffectIcon
} from './presets';
import { Creature } from '../creatures/index';

export class CreatureStatusEffectManager implements StatusEffectManager {
  effects: Map<string, StatusEffect> = new Map();
  private creature: Creature;

  constructor(creature: Creature) {
    this.creature = creature;
  }

  addEffect(effect: StatusEffect): void {
    // Check if effect of same type already exists
    const existingEffect = this.getEffect(effect.type);
    
    if (existingEffect) {
      // Remove existing effect to replace with new one
      this.removeEffect(existingEffect.id);
    }

    // Add new effect
    this.effects.set(effect.id, effect);
  }

  removeEffect(effectId: string): void {
    this.effects.delete(effectId);
  }

  updateEffects(): void {
    const effectsToRemove: string[] = [];
    
    Array.from(this.effects.entries()).forEach(([effectId, effect]) => {
      if (effect.remainingTurns !== null) {
        effect.remainingTurns--;
        if (effect.remainingTurns <= 0) {
          effectsToRemove.push(effectId);
        }
      }
    });
    
    // Remove expired effects
    effectsToRemove.forEach(effectId => this.removeEffect(effectId));
  }

  getActiveEffects(): StatusEffect[] {
    return Array.from(this.effects.values());
  }

  /**
   * Check if creature has a specific effect
   */
  hasEffect(type: StatusEffectType): boolean {
    // Check manual effects first
    if (this.getEffect(type) !== null) {
      return true;
    }

    return false;
  }

  getEffect(type: StatusEffectType): StatusEffect | null {
    for (const effect of Array.from(this.effects.values())) {
      if (effect.type === type) {
        return effect;
      }
    }

    return null;
  }

  clearAllEffects(): void {
    this.effects.clear();
  }
}

/**
 * Factory function to create status effects
 */
export function createStatusEffect(
  id: string,
  type: StatusEffectType,
  duration: number | null = null,
  overrides: Partial<StatusEffect> = {},  
): StatusEffect {
  const baseEffect: StatusEffect = {
    id: id,
    type,
    name: '', // Name must be set explicitly in overrides
    description: '', // Description must be set explicitly in overrides
    duration,
    remainingTurns: duration,
    icon: getStatusEffectIcon(type),
    ...overrides
  };

  return baseEffect;
}

// Re-export the helper functions for backward compatibility
export {
  getStatusEffectIcon
} from './presets';
