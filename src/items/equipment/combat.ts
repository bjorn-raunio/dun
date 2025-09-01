import { Weapon, RangedWeapon, Armor, Shield } from '../types';

// --- Combat Calculator ---

export class CombatCalculator {
  /**
   * Get effective armor value (equipped armor or natural armor)
   */
  static getEffectiveArmor(naturalArmor: number, armor?: Armor): number {
    return naturalArmor + (armor?.armor ?? 0);
  }

  /**
   * Get weapon damage value
   */
  static getWeaponDamage(weapon: Weapon | RangedWeapon): number {
    return weapon.damage ?? 0;
  }

  /**
   * Get weapon range information
   */
  static getWeaponRange(
    mainHand?: Weapon | RangedWeapon, 
    offHand?: Weapon | RangedWeapon | Shield,
    rangeType: 'normal' | 'long' | 'info' = 'normal'
  ): number | { rangeTiles: number; isRanged: boolean } {
    let rangeTiles = 1;
    let isRanged = false;
    
    if (mainHand instanceof Weapon) {
      rangeTiles = Math.max(1, mainHand.reach ?? 1);
    } else if (mainHand instanceof RangedWeapon) {
      isRanged = true;
      rangeTiles = Math.max(1, mainHand.range);
    } else if (offHand instanceof RangedWeapon) {
      isRanged = true;
      rangeTiles = Math.max(1, offHand.range);
    }
    
    if (rangeType === 'info') {
      return { rangeTiles, isRanged };
    }
    
    return rangeTiles;
  }

  /**
   * Get attack bonus based on weapon type and modifiers
   */
  static getAttackBonus(
    weapon: Weapon | RangedWeapon,
    combatBonus: number, 
    rangedBonus: number
  ): number {
    // Determine base bonus by weapon type
    const baseBonus = weapon instanceof RangedWeapon ? rangedBonus : combatBonus;
    const weaponModifier = weapon instanceof Weapon ? (weapon.combatModifier ?? 0) : 0;
    return baseBonus + weaponModifier;
  }

  /**
   * Get armor modifier from weapon
   */
  static getWeaponArmorModifier(weapon: Weapon | RangedWeapon): number {
    return weapon.armorModifier ?? 0;
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
