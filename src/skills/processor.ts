import { Skill } from './types';
import { Attributes, StatusEffect } from '../statusEffects';
import { EquipmentSlots } from '../items/equipment';

// --- Skill Processor ---
// This class handles calculating effective attributes based on creature skills

export class SkillProcessor {

  /**
   * Calculate the effective value of an attribute considering skill modifiers, equipment modifiers, and status effects
   */
  static getEffectiveAttributeWithEquipment(
    baseValue: number,
    attributeName: keyof Attributes,
    skills: Skill[],
    equipment: EquipmentSlots,
    statusEffects: StatusEffect[] = []
  ): number {
    let effectiveValue = baseValue;

    // Apply skill modifiers (all are flat)
    const skillModifiers = this.getAttributeModifiers(attributeName, skills);
    for (const modifier of skillModifiers) {
      effectiveValue += modifier.value;
    }

    // Apply equipment modifiers
    if (equipment.mainHand && equipment.mainHand.attributeModifiers) {
      const modifier = equipment.mainHand.attributeModifiers[attributeName];
      if (modifier) {
        effectiveValue += modifier;
      }
    }

    if (equipment.offHand && equipment.offHand.attributeModifiers) {
      const modifier = equipment.offHand.attributeModifiers[attributeName];
      if (modifier) {
        effectiveValue += modifier;
      }
    }

    if (equipment.armor && equipment.armor.attributeModifiers) {
      const modifier = equipment.armor.attributeModifiers[attributeName];
      if (modifier) {
        effectiveValue += modifier;
      }
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

    return effectiveValue;
  }

  /**
   * Get all modifiers for a specific attribute from the creature's skills
   */
  private static getAttributeModifiers(
    attributeName: keyof Attributes,
    skills: Skill[]
  ): Array<{ attribute: keyof Attributes; value: number }> {
    const modifiers: Array<{ attribute: keyof Attributes; value: number }> = [];

    for (const skill of skills) {
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
  static getSkillEffectsSummary(skills: Skill[]): string[] {
    const effects: string[] = [];

    for (const skill of skills) {
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
  static hasSkill(creatureSkills: Skill[], skillName: string): boolean {
    return Object.values(creatureSkills).some(skill =>
      skill.name.toLowerCase() === skillName.toLowerCase()
    );
  }

  /**
   * Get all skills of a specific type
   */
  static getSkillsByType(creatureSkills: Skill[], type: string): Skill[] {
    return Object.values(creatureSkills).filter(skill => skill.type === type);
  }
}
