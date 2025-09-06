import { Weapon, RangedWeapon, Armor, Shield, BaseWeapon } from '../index';

// --- Combat Calculator ---

export class CombatCalculator {
  /**
   * Get effective armor value (equipped armor or natural armor)
   */
  static getEffectiveArmor(naturalArmor: number, armor?: Armor): number {
    return naturalArmor + (armor?.armor ?? 0);
  }
  
  /**
   * Get shield block value
   */
  static getShieldBlockValue(shield?: Shield, isBackAttack: boolean = false): number {
    // Shields don't have block value during back attacks
    if (isBackAttack || !shield) {
      return 0;
    }
    return shield.block;
  }
}
