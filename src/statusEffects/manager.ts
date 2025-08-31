import { StatusEffect, StatusEffectType, StatusEffectManager } from './types';
import { generateId } from '../utils/idGeneration';
import { 
  getStatusEffectName, 
  getStatusEffectDescription, 
  getStatusEffectIcon, 
  CommonStatusEffects
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
      // If stacking is allowed and not at max stacks, increase stack count
      if (effect.stackCount < effect.maxStacks) {
        existingEffect.stackCount = Math.min(existingEffect.stackCount + 1, effect.maxStacks);
        
        // If the new effect has a longer duration, extend the existing effect
        if (effect.duration && existingEffect.remainingTurns) {
          existingEffect.remainingTurns = Math.max(existingEffect.remainingTurns, effect.duration);
        }
        
        // Update modifiers based on stack count
        this.updateEffectModifiers(existingEffect);
        return;
      } else {
        // At max stacks, remove old effect to replace with new one
        this.removeEffect(existingEffect.id);
      }
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
   * Get all active effects including automatic effects like wounded status
   * This is the main method that should be used to get the complete status effect state
   */
  getAllActiveEffects(): StatusEffect[] {
    const manualEffects = this.getActiveEffects();
    const automaticEffects: StatusEffect[] = [];
    // Check if creature should have wounded status effect
    if (this.creature.isWounded()) {      
      automaticEffects.push(this.getWoundedEffect());
    }
    return [...manualEffects, ...automaticEffects];
  }

  /**
   * Check if creature has a specific effect (including automatic effects)
   */
  hasEffect(type: StatusEffectType): boolean {
    // Check manual effects first
    if (this.getEffect(type) !== null) {
      return true;
    }

    // Check automatic effects
    if (type === 'wounded' && this.creature.isWounded()) {
      return true;
    }

    return false;
  }

  getEffect(type: StatusEffectType): StatusEffect | null {
    // First check manual effects
    for (const effect of Array.from(this.effects.values())) {
      if (effect.type === type) {
        return effect;
      }
    }

    // Then check automatic effects
    if (type === 'wounded' && this.creature.isWounded()) {
      return this.getWoundedEffect();
    }

    return null;
  }

  clearAllEffects(): void {
    this.effects.clear();
  }

  /**
   * Get the wounded status effect for this creature
   * This is an automatic effect that's generated based on creature state
   */
  private getWoundedEffect(): StatusEffect {
    const woundedEffect = CommonStatusEffects.wounded(this.creature, undefined);
    return {
      ...woundedEffect,
      id: `wounded_${this.creature.id}`,
      isAutomatic: true,
      remainingTurns: null, // Permanent until healed
      duration: null
    };
  }

  /**
   * Update effect modifiers based on stack count
   * This allows effects to scale with the number of stacks
   */
  private updateEffectModifiers(effect: StatusEffect): void {
    if (effect.stackCount <= 1) return;

    // For now, we'll just multiply the modifiers by stack count
    // In the future, this could be more sophisticated
    if (effect.attributeModifiers) {
      Object.keys(effect.attributeModifiers).forEach(key => {
        const attrKey = key as keyof typeof effect.attributeModifiers;
        if (effect.attributeModifiers && effect.attributeModifiers[attrKey] !== undefined) {
          effect.attributeModifiers[attrKey] = (effect.attributeModifiers[attrKey] || 0) * effect.stackCount;
        }
      });
    }

    if (effect.movementModifier) {
      effect.movementModifier *= effect.stackCount;
    }

    if (effect.actionModifier) {
      effect.actionModifier *= effect.stackCount;
    }

    if (effect.quickActionModifier) {
      effect.quickActionModifier *= effect.stackCount;
    }

    if (effect.damageModifier) {
      effect.damageModifier *= effect.stackCount;
    }

    if (effect.armorModifier) {
      effect.armorModifier *= effect.stackCount;
    }

    if (effect.accuracyModifier) {
      effect.accuracyModifier *= effect.stackCount;
    }
  }
}

/**
 * Factory function to create status effects
 */
export function createStatusEffect(
  type: StatusEffectType,
  duration: number | null = null,
  stackCount: number = 1,
  maxStacks: number = 1,
  overrides: Partial<StatusEffect> = {}
): StatusEffect {
  const baseEffect: StatusEffect = {
    id: generateId(),
    type,
    name: getStatusEffectName(type),
    description: getStatusEffectDescription(type),
    duration,
    remainingTurns: duration,
    stackCount,
    maxStacks,
    icon: getStatusEffectIcon(type),
    ...overrides
  };

  return baseEffect;
}

// Re-export the helper functions for backward compatibility
export {
  getStatusEffectName,
  getStatusEffectDescription,
  getStatusEffectIcon
} from './presets';
