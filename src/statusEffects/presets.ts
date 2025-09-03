import { StatusEffectType, StatusEffect } from './types';
import { Creature } from '../creatures/index';
import { createStatusEffect } from './manager';
import { displayDiceRoll, displayDiceSum } from '../utils/dice';

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
    icon: "/icons/poisoned.png",
    createEffect: (): StatusEffect => {
        return createStatusEffect('poison', 'poison', null, {
            name: "Poison",
            attributeModifiers: {
              ...standardAttributeModifiers
            }
          });
    }
  },

  wounded: {
    icon: "/icons/wounded.png",
    createEffect: (): StatusEffect => {
        return createStatusEffect('wounded', 'wounded', null, {
            name: "Wounded",
            attributeModifiers: {
              ...standardAttributeModifiers
            }
          });
    }
  },

  stunned: {
    icon: "/icons/stunned.png",
    createEffect: (): StatusEffect => {
      return createStatusEffect('stunned', 'stunned', null, {
        name: "Stunned",
        priority: 1,
        attributeModifiers: {
          ...standardAttributeModifiers
        },
        onTurnStart: (creature: Creature) => {          
          const recoveryRoll = Math.floor(Math.random() * 6) + 1;
          if (recoveryRoll >= 4) {
            creature.removeStatusEffect('stunned');
            return [`${creature.name} recovers from stun ${displayDiceRoll([recoveryRoll])}`];
          }
          return [`${creature.name} fails to recover from stun ${displayDiceRoll([recoveryRoll])}`];
        }
      });
    }
  },

  knockedDown: {
    icon: "/icons/knockedDown.png",
    createEffect: (): StatusEffect => {
      return createStatusEffect('knockedDown', 'knockedDown', null, {
        name: "Knocked Down",
        movementModifier: -999, // Effectively prevents movement
        actionModifier: -999, // Effectively prevents actions
        quickActionModifier: -999, // Effectively prevents quick actions
        attributeModifiers: {
          ...standardAttributeModifiers
        },
        onTurnStart: (creature: Creature) => {  
          const result = creature.performAttributeTest("agility");
          if (result.success) {
            creature.removeStatusEffect('knockedDown');
            creature.addStatusEffect(STATUS_EFFECT_PRESETS.stunned.createEffect());
            return [`${creature.name} stands up: ${displayDiceSum(result, result.modifier)}`];
          }
          return [`${creature.name} fails to stand up: ${displayDiceSum(result, result.modifier)}`];
        }
      });
    }
  },

  strength: {
    icon: "/icons/strength.png",
    createEffect: (name?: string, duration: number | null = null, value: number = 1): StatusEffect => {
      return createStatusEffect('strength', 'strength', duration, {
        name: name ?? "Strength",
        description: `+${value} strength`,
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


