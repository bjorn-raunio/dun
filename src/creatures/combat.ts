import { Attributes } from './types';
import { EquipmentSystem } from '../items/equipment';
import { Weapon, RangedWeapon } from '../items/types';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { isInBackArc } from '../utils/geometry';
import { SkillProcessor } from './skillProcessor';

// --- Creature Combat Management ---

export class CreatureCombatManager {
  constructor(
    private attributes: Attributes,
    private equipment: any,
    private naturalArmor: number,
    private size: number,
    private skills: any = {}
  ) {}

  // --- Equipment Access Consolidation ---
  
  /**
   * Get EquipmentSystem instance - consolidated to eliminate repeated instantiation
   */
  private getEquipment(): EquipmentSystem {
    return new EquipmentSystem(this.equipment);
  }

  // --- Equipment-based Combat Methods ---

  getArmorValue(): number {
    return this.getEquipment().getEffectiveArmor(this.naturalArmor);
  }

  getMainWeapon(): Weapon | RangedWeapon {
    return this.getEquipment().getMainWeapon();
  }

  hasRangedWeapon(): boolean {
    return this.getEquipment().hasRangedWeapon();
  }

  hasShield(): boolean {
    return this.getEquipment().hasShield();
  }

  getAttackBonus(): number {
    return this.getEquipment().getAttackBonus(this.attributes.combat, this.attributes.ranged);
  }

  getWeaponDamage(): number {
    return this.getEquipment().getWeaponDamage();
  }

  getAttackRange(): number {
    return this.getEquipment().getAttackRange();
  }

  getMaxAttackRange(): number {
    return this.getEquipment().getMaxAttackRange();
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
    statusEffects: any[] = []
  ): number {
    const baseValue = this.attributes[attributeName] ?? 0;
    return SkillProcessor.getEffectiveAttribute(baseValue, attributeName, this.skills, isWounded, statusEffects);
  }

  /**
   * Get effective movement attribute
   */
  getEffectiveMovement(isWounded: boolean, statusEffects: any[] = []): number {
    return this.getEffectiveAttribute("movement", isWounded, statusEffects);
  }

  /**
   * Get effective combat attribute
   */
  getEffectiveCombat(isWounded: boolean, statusEffects: any[] = []): number {
    return this.getEffectiveAttribute("combat", isWounded, statusEffects);
  }

  /**
   * Get effective ranged attribute
   */
  getEffectiveRanged(isWounded: boolean, statusEffects: any[] = []): number {
    return this.getEffectiveAttribute("ranged", isWounded, statusEffects);
  }

  /**
   * Get effective strength attribute
   */
  getEffectiveStrength(isWounded: boolean, statusEffects: any[] = []): number {
    return this.getEffectiveAttribute("strength", isWounded, statusEffects);
  }

  /**
   * Get effective agility attribute
   */
  getEffectiveAgility(isWounded: boolean, statusEffects: any[] = []): number {
    return this.getEffectiveAttribute("agility", isWounded, statusEffects);
  }

  /**
   * Get effective courage attribute
   */
  getEffectiveCourage(isWounded: boolean, statusEffects: any[] = []): number {
    return this.getEffectiveAttribute("courage", isWounded, statusEffects);
  }

  /**
   * Get effective intelligence attribute
   */
  getEffectiveIntelligence(isWounded: boolean, statusEffects: any[] = []): number {
    return this.getEffectiveAttribute("intelligence", isWounded, statusEffects);
  }

  getEffectivePerception(isWounded: boolean, statusEffects: any[] = []): number {
    return this.getEffectiveAttribute("perception", isWounded, statusEffects);
  }

  getEffectiveDexterity(isWounded: boolean, statusEffects: any[] = []): number {
    return this.getEffectiveAttribute("dexterity", isWounded, statusEffects);
  }
}
