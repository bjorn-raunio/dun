import { StatusEffect, StatusEffectType, StatusEffectManager } from './types';
import { generateId } from '../utils/idGeneration';
import { 
  getStatusEffectName, 
  getStatusEffectDescription, 
  getStatusEffectIcon, 
  CommonStatusEffects
} from './presets/statusEffectPresets';
import { Creature } from './index';

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

  /**
   * Get a specific effect (including automatic effects)
   */
  getEffect(type: StatusEffectType): StatusEffect | null {
    // Check manual effects first
    const manualEffect = Array.from(this.effects.values()).find(effect => effect.type === type);
    if (manualEffect) {
      return manualEffect;
    }

    // Check automatic effects
    if (type === 'wounded' && this.creature.isWounded()) {
      return this.getWoundedEffect();
    }

    return null;
  }

  getWoundedEffect(): StatusEffect {
    const woundedEffect = CommonStatusEffects.wounded(this.creature, undefined);
    woundedEffect.id = this.creature.id + '-wounded';
    return woundedEffect;
  }

  clearAllEffects(): void {
    this.effects.clear();
  }

  private updateEffectModifiers(effect: StatusEffect): void {
    // Apply stack-based modifiers
    if (effect.attributeModifiers) {
      // Multiply modifiers by stack count
      Object.keys(effect.attributeModifiers).forEach(key => {
        const attrKey = key as keyof typeof effect.attributeModifiers;
        if (effect.attributeModifiers![attrKey]) {
          effect.attributeModifiers![attrKey] = effect.attributeModifiers![attrKey]! * effect.stackCount;
        }
      });
    }
    
    // Apply other stack-based modifiers
    if (effect.movementModifier) {
      effect.movementModifier = effect.movementModifier * effect.stackCount;
    }
    if (effect.actionModifier) {
      effect.actionModifier = effect.actionModifier * effect.stackCount;
    }
    if (effect.quickActionModifier) {
      effect.quickActionModifier = effect.quickActionModifier * effect.stackCount;
    }
    if (effect.damageModifier) {
      effect.damageModifier = effect.damageModifier * effect.stackCount;
    }
    if (effect.armorModifier) {
      effect.armorModifier = effect.armorModifier * effect.stackCount;
    }
    if (effect.accuracyModifier) {
      effect.accuracyModifier = effect.accuracyModifier * effect.stackCount;
    }
  }
}

// Factory function to create common status effects
export function createStatusEffect(
  type: StatusEffectType,
  duration: number | null = null,
  stackCount: number = 1,
  maxStacks: number = 1,
  overrides: Partial<StatusEffect> = {}
): StatusEffect {
  const baseEffect: StatusEffect = {
    id: generateId('status-effect'),
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

// Re-export the helper functions for external use
export { 
  getStatusEffectName, 
  getStatusEffectDescription, 
  getStatusEffectIcon 
} from './presets/statusEffectPresets';




