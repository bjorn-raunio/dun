// Import item types for the equipment interface
import { Item, Weapon, RangedWeapon, Armor, Shield, EquipmentSlots } from '../items';
import { Creature } from './index';
import { CombatResult } from '../utils/combat/types';

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
  onTurnStart?: (creature: Creature) => void;
  onTurnEnd?: (creature: Creature) => void;
  onCombatStart?: (creature: Creature) => void;
  onCombatEnd?: (creature: Creature) => void;
  onDeath?: (creature: Creature) => void;
  
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
  condition?: (attacker: Creature, target: Creature, combatResult: CombatResult) => boolean;
  effect: (attacker: Creature, target: Creature, combatResult: CombatResult) => void;
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
  equipment?: EquipmentSlots;
  vitality: number;
  mana: number;
  fortune: number;
  naturalArmor?: number;
  group: CreatureGroup;
  skills?: Skills | Skill[];
}
