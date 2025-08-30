// Import item types for the equipment interface
import { Item, Weapon, RangedWeapon, Armor, Shield } from '../items';

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

export type CreatureGroup = "hero" | "enemy" | "neutral";

export const CREATURE_GROUPS = {
  HERO: "hero" as const,
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
}
