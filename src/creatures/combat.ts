import { Attributes } from './types';
import { EquipmentSystem } from '../items/equipment';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { isInBackArc } from '../utils/geometry';

// --- Creature Combat Management ---

export class CreatureCombatManager {
  constructor(
    private attributes: Attributes,
    private equipment: any,
    private naturalArmor: number,
    private size: number
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

  getMainWeapon(): any {
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
   * Generic method to get effective attribute value with wounding penalty
   */
  private getEffectiveAttribute(baseValue: number, isWounded: boolean): number {
    return isWounded ? Math.max(1, baseValue - 1) : baseValue;
  }

  /**
   * Get effective movement attribute
   */
  getEffectiveMovement(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.movement, isWounded);
  }

  /**
   * Get effective combat attribute
   */
  getEffectiveCombat(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.combat, isWounded);
  }

  /**
   * Get effective ranged attribute
   */
  getEffectiveRanged(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.ranged, isWounded);
  }

  /**
   * Get effective strength attribute
   */
  getEffectiveStrength(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.strength, isWounded);
  }

  /**
   * Get effective agility attribute
   */
  getEffectiveAgility(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.agility, isWounded);
  }

  /**
   * Get effective courage attribute
   */
  getEffectiveCourage(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.courage, isWounded);
  }

  /**
   * Get effective intelligence attribute
   */
  getEffectiveIntelligence(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.intelligence, isWounded);
  }

  getEffectivePerception(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.perception ?? 0, isWounded);
  }

  getEffectiveDexterity(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.dexterity ?? 0, isWounded);
  }
}
