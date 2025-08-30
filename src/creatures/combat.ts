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

  // --- Equipment-based Combat Methods ---

  getArmorValue(): number {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getEffectiveArmor(this.naturalArmor);
  }

  getMainWeapon(): any {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getMainWeapon();
  }

  hasRangedWeapon(): boolean {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.hasRangedWeapon();
  }

  hasShield(): boolean {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.hasShield();
  }

  getAttackBonus(): number {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getAttackBonus(this.attributes.combat, this.attributes.ranged);
  }

  getWeaponDamage(): number {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getWeaponDamage();
  }

  getAttackRange(): number {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getAttackRange();
  }

  getMaxAttackRange(): number {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getMaxAttackRange();
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

  getEffectiveAttribute(baseValue: number, isWounded: boolean): number {
    return isWounded ? Math.max(1, baseValue - 1) : baseValue;
  }

  getEffectiveMovement(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.movement, isWounded);
  }

  getEffectiveCombat(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.combat, isWounded);
  }

  getEffectiveRanged(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.ranged, isWounded);
  }

  getEffectiveStrength(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.strength, isWounded);
  }

  getEffectiveAgility(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.agility, isWounded);
  }

  getEffectiveCourage(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.courage, isWounded);
  }

  getEffectiveIntelligence(isWounded: boolean): number {
    return this.getEffectiveAttribute(this.attributes.intelligence, isWounded);
  }
}
