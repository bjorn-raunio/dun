import { DiceRoll } from '../dice';
import { BaseValidationResult } from '../types';

// --- Combat Result Types ---

export interface CombatResult {
  success: boolean;
  damage: number;
  targetDefeated: boolean;
}

export interface CombatValidationResult extends BaseValidationResult { }

// --- Combat Phase Types ---

export interface ToHitResult {
  hit: boolean;
  attackerRoll: DiceRoll;
  defenderRoll: DiceRoll;
}

export interface RangedToHitResult {
  hit: boolean;
  attackerRoll: DiceRoll;
}

export interface BlockResult {
  blockMessage: string;
  blockSuccess: boolean;
}

export interface DamageResult {
  damage: number;
  damageMessage: string;
  diceRolls: number[];
  armorValue: number;
}

// --- Combat Calculation Types ---

export interface CombatModifiers {
  backAttack: boolean;
  elevation: number;
  weaponModifier: number;
  shieldBonus: number;
}

export interface CombatRolls {
  attacker: number;
  defender: number;
  attackerDoubleCritical: boolean;
  defenderDoubleCritical: boolean;
  criticalHit: boolean;
}
