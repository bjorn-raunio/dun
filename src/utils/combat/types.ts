import { BaseValidationResult } from '../types';

// --- Combat Result Types ---

export interface CombatResult {
  success: boolean;
  message: string;
  damage: number;
  targetDefeated: boolean;
  toHitMessage?: string;
  blockMessage?: string;
  damageMessage?: string;
  shieldBlockMessage?: string;
}

export interface CombatValidationResult extends BaseValidationResult { }

// --- Combat Phase Types ---

export interface ToHitResult {
  hit: boolean;
  toHitMessage: string;
  attackerRoll: number;
  defenderRoll: number;
  attackerDoubleCritical: boolean;
  defenderDoubleCritical: boolean;
  criticalHit: boolean;
  attackerModifiers: string[];
  defenderModifiers: string[];
}

export interface RangedToHitResult {
  hit: boolean;
  toHitMessage: string;
  toHitRoll: number;
  attackerDoubleCritical: boolean;
  criticalHit: boolean;
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
