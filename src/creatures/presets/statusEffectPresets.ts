import { StatusEffectType, StatusEffect } from '../types';
import { Creature } from '../index';
import { createStatusEffect } from '../statusEffects';

export interface StatusEffectPreset {
  name: string;
  description: string;
  icon: string;
  createEffect: (creature: Creature, duration?: number, stacks?: number) => StatusEffect;
}

const standardAttributeModifiers = {
    movement: -1,
    combat: -1,
    ranged: -1,
    strength: -1,
    agility: -1,
    courage: -1,
    intelligence: -1,
    perception: -1,
    dexterity: -1
}

export const STATUS_EFFECT_PRESETS: Record<StatusEffectType, StatusEffectPreset> = {
  poison: {
    name: "Poison",
    description: "-1 to all attributes",
    icon: "☠️",
    createEffect: (creature: Creature, duration: number | null = null): StatusEffect => {
        return createStatusEffect('poison', duration, 1, 1, {
            attributeModifiers: {
              ...standardAttributeModifiers
            }
          });
    }
  },

  wounded: {
    name: "Wounded",
    description: "-1 to all attributes",
    icon: "🩸",
    createEffect: (creature: Creature, duration: number | null = null): StatusEffect => {
        return createStatusEffect('wounded', duration, 1, 1, {
            attributeModifiers: {
              ...standardAttributeModifiers
            }
          });
    }
  },

  stunned: {
    name: "Stunned",
    description: "-1 to all attributes",
    icon: "💫",
    createEffect: (creature: Creature, duration: number | null = null): StatusEffect => {
      return createStatusEffect('stunned', duration, 1, 1, {
        attributeModifiers: {
          ...standardAttributeModifiers
        },
        onTurnStart: (creature: Creature) => {
          // Roll d6 for stun recovery - recover on 4+
          const recoveryRoll = Math.floor(Math.random() * 6) + 1;
          if (recoveryRoll >= 4) {
            // Remove the stun effect
            const statusEffectManager = creature.getStatusEffectManager();
            const stunnedEffect = statusEffectManager.getEffect('stunned');
            if (stunnedEffect) {
              statusEffectManager.removeEffect(stunnedEffect.id);
            }
          }
        }
      });
    }
  },

  knockedDown: {
    name: "Knocked Down",
    description: "Cannot move, perform actions, or quick actions",
    icon: "🔄",
    createEffect: (creature: Creature, duration: number | null = null): StatusEffect => {
      return createStatusEffect('knockedDown', duration, 1, 1, {
        movementModifier: -999, // Effectively prevents movement
        actionModifier: -999, // Effectively prevents actions
        quickActionModifier: -999, // Effectively prevents quick actions
        attributeModifiers: {
          ...standardAttributeModifiers
        }
      });
    }
  },
};

// Helper functions that use the presets
export function getStatusEffectName(type: StatusEffectType): string {
  return STATUS_EFFECT_PRESETS[type].name;
}

export function getStatusEffectDescription(type: StatusEffectType): string {
  return STATUS_EFFECT_PRESETS[type].description;
}

export function getStatusEffectIcon(type: StatusEffectType): string {
  return STATUS_EFFECT_PRESETS[type].icon;
}

/**
 * CommonStatusEffects is now an alias for the preset factory functions
 * This maintains backward compatibility while using the unified system
 */
export const CommonStatusEffects = {
  poison: STATUS_EFFECT_PRESETS.poison.createEffect,
  wounded: STATUS_EFFECT_PRESETS.wounded.createEffect,
  stunned: STATUS_EFFECT_PRESETS.stunned.createEffect,
  knockedDown: STATUS_EFFECT_PRESETS.knockedDown.createEffect,
};
