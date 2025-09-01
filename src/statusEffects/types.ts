import { Creature } from '../creatures/index';

// --- Status Effect Types ---
export type StatusEffectType = 
  | "poison" 
  | "wounded" 
  | "stunned"
  | "knockedDown"
  | "strength";

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  name: string;
  description: string;
  duration: number | null; // null means permanent
  remainingTurns: number | null; // null for permanent effects
  
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
  hasEffect(type: StatusEffectType): boolean;
  getEffect(type: StatusEffectType): StatusEffect | null;
  clearAllEffects(): void;
}

// --- Core Creature Types (needed for status effects) ---
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
