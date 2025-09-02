import { Attributes } from '../statusEffects';
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
  
  // Combat triggers  
  combatTriggers?: CombatTrigger[];
}

export interface CombatTrigger {
  event: CombatEventName;
  type?: "melee" | "ranged";
  effect: (data: CombatEventData) => void;
}