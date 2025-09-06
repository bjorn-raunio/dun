import { Creature } from '../creatures/index';

// --- Status Effect Types ---
export type StatusEffectType = 
  | "diseased" 
  | "poisoned" 
  | "wounded" 
  | "stunned"
  | "afraid"
  | "stationary"
  | "knockedDown"
  | "darkness"
  | "totalDarkness"
  | "strength"
  | "speed"
  | "heroism";

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  name: string;
  description: string;
  duration: number | null; // null means permanent
  remainingTurns: number | null; // null for permanent effects
  priority: number; // Priority level for ordering and conflict resolution
  
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
  onTurnStart?: (creature: Creature) => string[];
  onTurnEnd?: (creature: Creature) => void;
  onCombatStart?: (creature: Creature) => void;
  onCombatEnd?: (creature: Creature) => void;
  onDeath?: (creature: Creature) => void;
  
  // Visual properties
  icon: string;
  
  // Internal properties
  isAutomatic?: boolean; // Marks effects that are automatically generated (e.g., wounded status)
  showMessage?: boolean; // Whether to show a message when this effect is applied (default: true)
}

export interface StatusEffectManager {
  effects: Map<string, StatusEffect>;
  addEffect(effect: StatusEffect): void;
  removeEffect(effectId: string): void;
  updateEffects(): void;
  getActiveEffects(): StatusEffect[];
  getActiveEffectsByPriority(): StatusEffect[]; // Returns effects sorted by priority (highest first)
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
