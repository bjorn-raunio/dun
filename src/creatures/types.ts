import { Item, EquipmentSlots } from '../items';
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



// --- Core Creature Types ---

// Default values for optional attributes
export const DEFAULT_ATTRIBUTES: Partial<Attributes> = {
  perception: 0,
  dexterity: 0,
};

export type CreatureGroup = "player" | "enemy" | "neutral";

export const CREATURE_GROUPS = {
  PLAYER: "player" as const,
  ENEMY: "enemy" as const,
  NEUTRAL: "neutral" as const,
} as const;

export interface CreaturePosition {
  x: number;
  y: number;
  facing: number;
}

export interface CreatureState {
  remainingMovement: number;
  remainingActions: number;
  remainingQuickActions: number;
  remainingVitality: number;
  remainingMana: number;
  remainingFortune: number;
  hasMovedWhileEngaged: boolean;
}

export interface CreatureConstructorParams {
  id?: string;
  name: string;
  x: number;
  y: number;
  image?: string;
  attributes: Attributes;
  actions: number;
  quickActions?: number;
  mapWidth?: number;
  mapHeight?: number;
  size: number;
  facing?: number;
  inventory?: Item[];
  equipment?: EquipmentSlots;
  vitality: number;
  mana: number;
  fortune: number;
  naturalArmor?: number;
  group: CreatureGroup;
  skills?: Skills | Skill[];
}
