// Import item types for the equipment interface
import { Item, Weapon, RangedWeapon, Armor, Shield } from '../items';

// --- Status Effect Types ---
export type StatusEffectType = 
  | "poison" 
  | "wounded" 
  | "stunned"
  | "knockedDown";

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  name: string;
  description: string;
  duration: number | null; // null means permanent
  remainingTurns: number | null; // null for permanent effects
  stackCount: number;
  maxStacks: number;
  
  // Effect modifiers
  attributeModifiers?: Partial<Attributes>;
  movementModifier?: number;
  actionModifier?: number;
  quickActionModifier?: number;
  
  // Combat modifiers
  damageModifier?: number;
  armorModifier?: number;
  accuracyModifier?: number;
  
  // Special effects
  onTurnStart?: (creature: any) => void;
  onTurnEnd?: (creature: any) => void;
  onCombatStart?: (creature: any) => void;
  onCombatEnd?: (creature: any) => void;
  onDeath?: (creature: any) => void;
  
  // Visual properties
  icon?: string;
  
  // Internal properties
  isAutomatic?: boolean; // Marks effects that are automatically generated (e.g., wounded status)
}

export interface StatusEffectManager {
  effects: Map<string, StatusEffect>;
  addEffect(effect: StatusEffect): void;
  removeEffect(effectId: string): void;
  updateEffects(): void;
  getActiveEffects(): StatusEffect[];
  getAllActiveEffects(): StatusEffect[]; // Includes automatic effects like wounded
  hasEffect(type: StatusEffectType): boolean;
  getEffect(type: StatusEffectType): StatusEffect | null;
  clearAllEffects(): void;
}

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
  condition?: (attacker: any, target: any, combatResult: any) => boolean;
  effect: (attacker: any, target: any, combatResult: any) => void;
  description: string;
}

export interface Skills {
  [key: string]: Skill;
}

// --- Core Creature Types ---

export interface Attributes {
  movement: number;
  combat: number;
  ranged: number;
  strength: number;
  agility: number;
  courage: number;
  intelligence: number;
  perception?: number;
  dexterity?: number;
}

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
  equipment?: {
    mainHand?: Weapon | RangedWeapon;
    offHand?: Weapon | RangedWeapon | Shield;
    armor?: Armor;
  };
  vitality: number;
  mana: number;
  fortune: number;
  naturalArmor?: number;
  group: CreatureGroup;
  skills?: Skills | Skill[];
}
