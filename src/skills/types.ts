import { WeaponAttackType } from '../items';
import { Attributes } from '../statusEffects';
import { DiceRoll } from '../utils';
import { CombatEventData, CombatEventName } from '../utils/combat/execution';

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
  darkVision?: number;
  
  // Combat triggers  
  combatTriggers?: CombatTrigger[];
}

export interface CombatTrigger {
  events: CombatEventName[];
  type?: WeaponAttackType;
  effect: (data: CombatEventData) => void;
  validator?: (roll: DiceRoll) => boolean;
}