import { Creature } from '../creatures/index';
import { CombatTrigger, CombatTriggerType } from './types';
import { CombatResult } from '../utils/combat/types';
import { applyStatusEffect } from '../statusEffects';
import { STATUS_EFFECT_PRESETS } from '../statusEffects';

// --- Combat Skill Trigger System ---
// This system handles triggering skills during combat based on specific events

/**
 * Helper function to detect if a combat roll resulted in doubles
 * @param roll1 First die roll
 * @param roll2 Second die roll
 * @returns true if both dice show the same number
 */
export function isDoubleResult(roll1: number, roll2: number): boolean {
  return roll1 === roll2 && roll1 > 0;
}

/**
 * Helper function to get the double result value
 * @param roll1 First die roll
 * @param roll2 Second die roll
 * @returns The double value (e.g., 2 for 2&2, 3 for 3&3) or null if not doubles
 */
export function getDoubleResultValue(roll1: number, roll2: number): number | null {
  return isDoubleResult(roll1, roll2) ? roll1 : null;
}

export class CombatSkillTriggerManager {
  /**
   * Process all combat triggers for a creature during combat
   */
  static processCombatTriggers(
    attacker: Creature,
    target: Creature,
    combatResult: CombatResult,
    triggerType: CombatTriggerType
  ): void {
    const skills = attacker.skills || {};
    
    for (const skill of Object.values(skills)) {
      if (skill.combatTriggers) {
        for (const trigger of skill.combatTriggers) {
          if (trigger.type === triggerType) {
            // Check if there's a condition and if it's met
            if (!trigger.condition || trigger.condition(attacker, target, combatResult)) {
              // Add a message to combatResult.messages
              if (combatResult && combatResult.messages) {
                combatResult.messages.push(
                  `${attacker.name}'s skill ${skill.name} activates`
                );
              }
              // Execute the trigger effect
              trigger.effect(attacker, target, combatResult);
            }
          }
        }
      }
    }
  }

  /**
   * Process triggers for a specific combat event
   */
  static processAttackHit(attacker: Creature, target: Creature, combatResult: CombatResult): void {
    this.processCombatTriggers(attacker, target, combatResult, 'onAttackHit');
  }

  /**
   * Process double result triggers using dice array
   * This is the preferred method when you have access to the dice results
   */
  static processDoubleResultFromDice(
    attacker: Creature, 
    target: Creature, 
    combatResult: CombatResult,
    dice: number[]
  ): void {
    if (dice && dice.length === 2) {
      const [die1, die2] = dice;
      if (isDoubleResult(die1, die2)) {
        // Process the double result triggers
        this.processCombatTriggers(attacker, target, combatResult, 'onDoubleResult');
      }
    }
  }

  static processAttackMiss(attacker: Creature, target: Creature, combatResult: CombatResult): void {
    this.processCombatTriggers(attacker, target, combatResult, 'onAttackMiss');
  }

  static processDoubleCritical(attacker: Creature, target: Creature, combatResult: CombatResult): void {
    this.processCombatTriggers(attacker, target, combatResult, 'onDoubleCritical');
  }

  static processCriticalHit(attacker: Creature, target: Creature, combatResult: CombatResult): void {
    this.processCombatTriggers(attacker, target, combatResult, 'onCriticalHit');
  }

  static processTargetDefeated(attacker: Creature, target: Creature, combatResult: CombatResult): void {
    this.processCombatTriggers(attacker, target, combatResult, 'onTargetDefeated');
  }

  static processBackAttack(attacker: Creature, target: Creature, combatResult: CombatResult): void {
    this.processCombatTriggers(attacker, target, combatResult, 'onBackAttack');
  }

  static processFirstBlood(attacker: Creature, target: Creature, combatResult: CombatResult): void {
    this.processCombatTriggers(attacker, target, combatResult, 'onFirstBlood');
  }

  static processLowHealth(attacker: Creature, target: Creature, combatResult: CombatResult): void {
    this.processCombatTriggers(attacker, target, combatResult, 'onLowHealth');
  }

  static processDoubleResult(attacker: Creature, target: Creature, combatResult: CombatResult): void {
    this.processCombatTriggers(attacker, target, combatResult, 'onDoubleResult');
  }
}

// --- Predefined Combat Trigger Effects ---
// These are reusable effects that can be used by multiple skills

export const CombatTriggerEffects = {

  /**
   * Apply a status effect to the target on double result
   */
  applyStatusEffectOnDoubleResult: (
    statusEffectType: string,
    duration: number | null,
    description: string
  ) => ({
    type: 'onDoubleResult' as CombatTriggerType,
    effect: (attacker: Creature, target: Creature, combatResult: CombatResult) => {
      // Create and apply the status effect to the target
      if (statusEffectType === 'stunned') {
        const stunnedEffect = STATUS_EFFECT_PRESETS.stunned.createEffect();
        applyStatusEffect(target, stunnedEffect, (msg: string) => {
          if (combatResult && combatResult.messages) {
            combatResult.messages.push(msg);
          }
        });
      }
    },
    description
  }),
};
