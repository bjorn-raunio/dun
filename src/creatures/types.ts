import { Item, EquipmentSlots, NaturalWeapon } from '../items';
import { CombatResult } from '../utils/combat/types';
import { Attributes } from '../statusEffects';
import { CreatureGroup } from './CreatureGroup';
import { Skill } from '../skills';

// --- Core Creature Types ---

// Default values for optional attributes
export const DEFAULT_ATTRIBUTES: Partial<Attributes> = {
  perception: 0,
  dexterity: 0,
};



export interface CreaturePosition {
  x: number;
  y: number;
  facing: number;
}

export type CreaturePositionOrUndefined = CreaturePosition | undefined;

export interface CreatureState {
  remainingMovement: number;
  remainingActions: number;
  remainingQuickActions: number;
  remainingVitality: number;
  remainingMana: number;
  remainingFortune: number;
  hasMovedWhileEngaged: boolean;
  pushedCreatures: Set<string>; // Track IDs of creatures pushed this turn
}

export interface CreatureConstructorParams {
  id?: string;
  name: string;
  position?: CreaturePositionOrUndefined;
  image?: string;
  attributes: Attributes;
  actions: number;
  quickActions?: number;
  mapWidth?: number;
  mapHeight?: number;
  size: number;
  inventory?: Item[];
  equipment?: EquipmentSlots;
  vitality: number;
  mana: number;
  fortune: number;
  naturalArmor?: number;
  group: CreatureGroup; // CHANGED from CreatureGroupType
  skills?: Skill[];
  naturalWeapons?: NaturalWeapon[];
}

export type CreatureAction = 'run' | 'disengage' | 'search';