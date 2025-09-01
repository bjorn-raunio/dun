import { StatusEffectType, StatusEffect } from './types';
import { Creature } from '../creatures/index';
import { createStatusEffect } from './manager';

export interface StatusEffectPreset {
  icon: string;
  createEffect: (name?: string, duration?: number, value?: number) => StatusEffect;
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
    icon: "☠️",
    createEffect: (): StatusEffect => {
        return createStatusEffect('poison', 'poison', null, {
            name: "Poison",
            description: "-1 to all attributes",
            attributeModifiers: {
              ...standardAttributeModifiers
            }
          });
    }
  },

  wounded: {
    icon: "🩸",
    createEffect: (): StatusEffect => {
        return createStatusEffect('wounded', 'wounded', null, {
            name: "Wounded",
            description: "-1 to all attributes",
            attributeModifiers: {
              ...standardAttributeModifiers
            }
          });
    }
  },

  stunned: {
    icon: "💫",
    createEffect: (): StatusEffect => {
      return createStatusEffect('stunned', 'stunned', null, {
        name: "Stunned",
        description: "-1 to all attributes",
        attributeModifiers: {
          ...standardAttributeModifiers
        },
        onTurnStart: (creature: Creature) => {          
          const recoveryRoll = Math.floor(Math.random() * 6) + 1;
          if (recoveryRoll >= 4) {
            creature.removeStatusEffect('stunned');
          }
        }
      });
    }
  },

  knockedDown: {
    icon: "🔄",
    createEffect: (): StatusEffect => {
      return createStatusEffect('knockedDown', 'knockedDown', null, {
        name: "Knocked Down",
        description: "Cannot move, perform actions, or quick actions",
        movementModifier: -999, // Effectively prevents movement
        actionModifier: -999, // Effectively prevents actions
        quickActionModifier: -999, // Effectively prevents quick actions
        attributeModifiers: {
          ...standardAttributeModifiers
        }
      });
    }
  },

  strength: {
    icon: "💪",
    createEffect: (name?: string, duration: number | null = null, value: number = 1): StatusEffect => {
      return createStatusEffect('strength', 'strength', duration, {
        name: name ?? "Strength",
        description: `+${value} to strength`,
        attributeModifiers: {
          strength: value
        }
      });
    }
  },
};

// Helper functions that use the presets
export function getStatusEffectIcon(type: StatusEffectType): string {
  return STATUS_EFFECT_PRESETS[type].icon;
}


