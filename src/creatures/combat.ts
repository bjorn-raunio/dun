import { Attributes } from '../statusEffects';
import { Skills } from '../skills';
import { EquipmentSystem } from '../items/equipment';
import { Weapon, RangedWeapon, Armor, Shield } from '../items/types';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { isInBackArc } from '../utils/geometry';

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


}
