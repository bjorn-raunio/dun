import { Attributes } from '../statusEffects';
import { EquipmentSystem } from '../items/equipment';
import { Weapon, RangedWeapon, Armor, Shield, BaseWeapon } from '../items';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { isInBackArc } from '../utils/geometry';
import { Skill } from '../skills';
import { ICreatureCombatManager } from './interfaces';

// --- Creature Combat Management ---

export class CreatureCombatManager implements ICreatureCombatManager {
  private equipmentSystem: EquipmentSystem | null = null;

  constructor(
    private getAttributes: () => Attributes,
    private getEquipment: () => {
      mainHand?: BaseWeapon;
      offHand?: BaseWeapon | Shield;
      armor?: Armor;
    },
    private getNaturalArmor: () => number,
    private getSize: () => number,
    private getSkills: () => Skill[]
  ) { }

  // --- Equipment Access Consolidation ---

  /**
   * Get EquipmentSystem instance - cached to prevent creating new unarmed weapons
   */
  public getEquipmentSystem(): EquipmentSystem {
    if (!this.equipmentSystem) {
      this.equipmentSystem = new EquipmentSystem(this.getEquipment());
    }
    return this.equipmentSystem;
  }

  /**
   * Invalidate the cached EquipmentSystem - call this when equipment changes
   */
  invalidateEquipmentCache(): void {
    this.equipmentSystem = null;
  }

  // --- Equipment-based Combat Methods ---

  getArmorValue(): number {
    return this.getEquipmentSystem().getEffectiveArmor(this.getNaturalArmor());
  }

  getMainWeapon(): BaseWeapon {
    return this.getEquipmentSystem().getMainWeapon();
  }

  getOffHandWeapon(): BaseWeapon {
    return this.getEquipmentSystem().getOffHandWeapon();
  }

  getUnarmedWeapon(): BaseWeapon {
    return this.getEquipmentSystem().getUnarmedWeapon();
  }

  getMaxAttackRange(): number {
    let max = 1;
    if(!this.getMainWeapon().isBroken()) {
      max = this.getMainWeapon().getValidRange().max;
    }
    if(!this.getOffHandWeapon().isBroken()) {
      max = Math.max(max, this.getOffHandWeapon().getValidRange().max);
    }
    return max;
  }

  hasShield(): boolean {
    return this.getEquipmentSystem().hasShield();
  }

  getShield(): Shield | undefined {
    return this.getEquipmentSystem().getShield();
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
