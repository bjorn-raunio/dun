import { Attributes, StatusEffect } from '../statusEffects';
import { Skills } from '../skills';
import { EquipmentSystem } from '../items/equipment';
import { Weapon, RangedWeapon, Armor, Shield } from '../items/types';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { isInBackArc } from '../utils/geometry';
import { SkillProcessor } from '../skills';

// --- Creature Combat Management ---

export class CreatureCombatManager {
  constructor(
    private getAttributes: () => Attributes,
    private getEquipment: () => {
      mainHand?: Weapon | RangedWeapon;
      offHand?: Weapon | RangedWeapon | Shield;
      armor?: Armor;
    },
    private getNaturalArmor: () => number,
    private getSize: () => number,
    private getSkills: () => Skills
  ) {}

  // --- Equipment Access Consolidation ---
  
  /**
   * Get EquipmentSystem instance - consolidated to eliminate repeated instantiation
   */
  private getEquipmentSystem(): EquipmentSystem {
    return new EquipmentSystem(this.getEquipment());
  }

  // --- Equipment-based Combat Methods ---

  getArmorValue(): number {
    return this.getEquipmentSystem().getEffectiveArmor(this.getNaturalArmor());
  }

  getMainWeapon(): Weapon | RangedWeapon {
    return this.getEquipmentSystem().getMainWeapon();
  }

  hasRangedWeapon(): boolean {
    return this.getEquipmentSystem().hasRangedWeapon();
  }

  hasShield(): boolean {
    return this.getEquipmentSystem().hasShield();
  }

  getAttackBonus(): number {
    const attributes = this.getAttributes();
    return this.getEquipmentSystem().getAttackBonus(attributes.combat, attributes.ranged);
  }

  getWeaponDamage(): number {
    return this.getEquipmentSystem().getWeaponDamage();
  }

  getAttackRange(): number {
    return this.getEquipmentSystem().getAttackRange();
  }

  getMaxAttackRange(): number {
    return this.getEquipmentSystem().getMaxAttackRange();
  }

  // --- Zone of Control ---

  getZoneOfControlRange(): number {
    return 1; // Can be overridden by subclasses for different creature types
  }

  isInZoneOfControl(x: number, y: number, creatureX: number, creatureY: number): boolean {
    const distance = calculateDistanceBetween(creatureX, creatureY, x, y);
    return distance <= this.getZoneOfControlRange();
  }

  // --- Back Arc Detection ---

  wasBehindTargetAtTurnStart(
    targetX: number, 
    targetY: number, 
    targetTurnStartFacing: number, 
    attackerTurnStartX: number, 
    attackerTurnStartY: number
  ): boolean {
    return isInBackArc(targetX, targetY, targetTurnStartFacing, attackerTurnStartX, attackerTurnStartY);
  }

  // --- Effective Attributes ---

  /**
   * Generic method to get effective attribute value with skill modifiers, status effects, and wounding penalty
   */
  private getEffectiveAttribute(
    attributeName: keyof Attributes,
    isWounded: boolean,
    statusEffects: StatusEffect[] = []
  ): number {
    const attributes = this.getAttributes();
    const baseValue = attributes[attributeName] ?? 0;
    return SkillProcessor.getEffectiveAttribute(baseValue, attributeName, this.getSkills(), isWounded, statusEffects);
  }

  /**
   * Get effective movement attribute
   */
  getEffectiveMovement(isWounded: boolean, statusEffects: StatusEffect[] = []): number {
    return this.getEffectiveAttribute("movement", isWounded, statusEffects);
  }

  /**
   * Get effective combat attribute
   */
  getEffectiveCombat(isWounded: boolean, statusEffects: StatusEffect[] = []): number {
    return this.getEffectiveAttribute("combat", isWounded, statusEffects);
  }

  /**
   * Get effective ranged attribute
   */
  getEffectiveRanged(isWounded: boolean, statusEffects: StatusEffect[] = []): number {
    return this.getEffectiveAttribute("ranged", isWounded, statusEffects);
  }

  /**
   * Get effective strength attribute
   */
  getEffectiveStrength(isWounded: boolean, statusEffects: StatusEffect[] = []): number {
    return this.getEffectiveAttribute("strength", isWounded, statusEffects);
  }

  /**
   * Get effective agility attribute
   */
  getEffectiveAgility(isWounded: boolean, statusEffects: StatusEffect[] = []): number {
    return this.getEffectiveAttribute("agility", isWounded, statusEffects);
  }

  /**
   * Get effective courage attribute
   */
  getEffectiveCourage(isWounded: boolean, statusEffects: StatusEffect[] = []): number {
    return this.getEffectiveAttribute("courage", isWounded, statusEffects);
  }

  /**
   * Get effective intelligence attribute
   */
  getEffectiveIntelligence(isWounded: boolean, statusEffects: StatusEffect[] = []): number {
    return this.getEffectiveAttribute("intelligence", isWounded, statusEffects);
  }

  getEffectivePerception(isWounded: boolean, statusEffects: StatusEffect[] = []): number {
    return this.getEffectiveAttribute("perception", isWounded, statusEffects);
  }

  getEffectiveDexterity(isWounded: boolean, statusEffects: StatusEffect[] = []): number {
    return this.getEffectiveAttribute("dexterity", isWounded, statusEffects);
  }
}
