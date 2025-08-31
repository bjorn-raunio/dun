import { BaseValidationResult } from '../types';

// --- Combat Result Types ---

export interface CombatResult {
  success: boolean;
  damage: number;
  targetDefeated: boolean;
  messages: string[]; // Array containing to hit, block, and damage messages (if applicable)
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
  attackerDice: number[];  // Individual dice results for attacker
  defenderDice: number[];  // Individual dice results for defender
}

export interface RangedToHitResult {
  hit: boolean;
  toHitMessage: string;
  attackerDoubleCritical: boolean;
  criticalHit: boolean;
  attackerDice: number[];  // Individual dice results for attacker
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
