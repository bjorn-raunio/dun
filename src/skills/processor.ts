import { Skill, Skills } from './types';
import { Attributes, StatusEffect } from '../statusEffects';

// --- Skill Processor ---
// This class handles calculating effective attributes based on creature skills

export class SkillProcessor {
  /**
   * Calculate the effective value of an attribute considering skill modifiers and status effects
   */
  static getEffectiveAttribute(
    baseValue: number,
    attributeName: keyof Attributes,
    skills: Skills,
    isWounded: boolean = false,
    statusEffects: StatusEffect[] = []
  ): number {
    let effectiveValue = baseValue;

    // Apply skill modifiers (all are flat)
    const modifiers = this.getAttributeModifiers(attributeName, skills);

    for (const modifier of modifiers) {
      effectiveValue += modifier.value;
    }

    // Apply status effect modifiers
    for (const effect of statusEffects) {
      if (effect.attributeModifiers) {
        let modifier = effect.attributeModifiers[attributeName];
        if (modifier) {
          effectiveValue += modifier;
        }
      }
    }

    // Apply wounding penalty (minimum of 1)
    if (isWounded) {
      effectiveValue = Math.max(1, effectiveValue - 1);
    }

    return effectiveValue;
  }

  /**
   * Get all modifiers for a specific attribute from the creature's skills
   */
  private static getAttributeModifiers(
    attributeName: keyof Attributes,
    skills: Skills
  ): Array<{ attribute: keyof Attributes; value: number }> {
    const modifiers: Array<{ attribute: keyof Attributes; value: number }> = [];

    for (const skill of Object.values(skills)) {
      if (skill.attributeModifiers) {
        for (const modifier of skill.attributeModifiers) {
          if (modifier.attribute === attributeName) {
            modifiers.push(modifier);
          }
        }
      }
    }

    return modifiers;
  }

  /**
   * Get a summary of all skill effects for a creature
   */
  static getSkillEffectsSummary(skills: Skills): string[] {
    const effects: string[] = [];

    for (const skill of Object.values(skills)) {
      if (skill.attributeModifiers) {
        for (const modifier of skill.attributeModifiers) {
          const sign = modifier.value >= 0 ? "+" : "";
          effects.push(`${skill.name}: ${sign}${modifier.value} ${modifier.attribute}`);
        }
      }
    }

    return effects;
  }

  /**
   * Check if a creature has a specific skill
   */
  static hasSkill(creatureSkills: Skills, skillName: string): boolean {
    return Object.values(creatureSkills).some(skill =>
      skill.name.toLowerCase() === skillName.toLowerCase()
    );
  }

  /**
   * Get all skills of a specific type
   */
  static getSkillsByType(creatureSkills: Skills, type: string): Skill[] {
    return Object.values(creatureSkills).filter(skill => skill.type === type);
  }
}
