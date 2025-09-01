import { CombatResult } from '../utils/combat/types';
import { Attributes } from '../statusEffects';

// --- Skill Types ---
export type SkillType = "combat" | "stealth" | "academic" | "natural";

export interface Skill {
  name: string;
  type: SkillType;
  description?: string;
  attributeModifiers?: Array<{
    attribute: keyof Attributes;
    value: number;
  }>;
  
  // Combat triggers
  combatTriggers?: CombatTrigger[];
}

// --- Combat Trigger Types ---
export type CombatTriggerType = 
  | "onAttackHit"
  | "onAttackMiss" 
  | "onDoubleCritical"
  | "onCriticalHit"
  | "onTargetDefeated"
  | "onBackAttack"
  | "onFirstBlood"
  | "onLowHealth"
  | "onDoubleResult";

export interface CombatTrigger {
  type: CombatTriggerType;
  condition?: (attacker: any, target: any, combatResult: CombatResult) => boolean;
  effect: (attacker: any, target: any, combatResult: CombatResult) => void;
  description: string;
}

export interface Skills {
  [key: string]: Skill;
}
