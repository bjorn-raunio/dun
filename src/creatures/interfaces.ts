// --- Shared Creature Interfaces ---
// This file contains interfaces that can be imported by other modules
// without creating circular dependencies

import { Item, Weapon, RangedWeapon, Armor, Shield, EquipmentSlots } from '../items';
import { MovementResult } from '../game/movement';
import { CreatureState, CreaturePosition } from './types';
import { CreatureGroup } from './CreatureGroup';
import { StatusEffectManager, StatusEffect, Attributes } from '../statusEffects';
import { MapDefinition } from '../maps/types';
import { CombatResult } from '../utils/combat/types';
import { PathfindingResult } from '../utils/pathfinding/types';

// --- Core Creature Interfaces ---

export interface ICreature {
  // Core properties
  id: string;
  name: string;
  image?: string;
  attributes: Attributes;
  actions: number;
  quickActions: number;
  mapWidth: number;
  mapHeight: number;
  size: number;
  inventory: Item[];
  equipment: EquipmentSlots;
  vitality: number;
  mana: number;
  fortune: number;
  naturalArmor: number;
  group: CreatureGroup; // CHANGED from string
  skills: { [key: string]: { name: string; type: string; description?: string } };
  running: boolean;
  
  // Position
  x: number;
  y: number;
  facing: number;
  
  // Position methods
  faceDirection(direction: number): void;
  
  // State properties
  remainingMovement: number;
  remainingActions: number;
  remainingQuickActions: number;
  remainingVitality: number;
  remainingMana: number;
  remainingFortune: number;
  hasMovedWhileEngaged: boolean;
  
  // State methods
  isAlive(): boolean;
  isDead(): boolean;
  isWounded(): boolean;
  hasMoved(): boolean;
  hasActionsRemaining(): boolean;
  hasMana(amount: number): boolean;
  hasFortune(amount: number): boolean;
  hasTakenActionsThisTurn(): boolean;
  
  // Attribute getters
  get agility(): number;
  get combat(): number;
  get movement(): number;
  get intelligence(): number;
  get strength(): number;
  get ranged(): number;
  get courage(): number;
  get perception(): number;
  get dexterity(): number;
  get effectiveActions(): number;
  get effectiveQuickActions(): number;
  
  // Combat
  getArmorValue(): number;
  getMainWeapon(): Weapon | RangedWeapon;
  hasRangedWeapon(): boolean;
  hasShield(): boolean;
  getAttackBonus(): number;
  getWeaponDamage(): number;
  getAttackRange(): number;
  getMaxAttackRange(): number;
  getZoneOfControlRange(): number;
  getCombatState(): boolean;
  updateCombatState(allCreatures: ICreature[]): void;
  getEnemiesInCombatRange(allCreatures: ICreature[]): ICreature[];
  
  // Relationships
  isPlayerControlled(): boolean;
  isAIControlled(): boolean;
  isHostileTo(other: ICreature): boolean;
  isFriendlyTo(other: ICreature): boolean;
  
  // Movement
  getReachableTiles(allCreatures: ICreature[], mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: MapDefinition): PathfindingResult;
  moveTo(path: Array<{x: number; y: number}>, allCreatures?: ICreature[], mapData?: { tiles: string[][] }, mapDefinition?: MapDefinition): MovementResult;
  
  // Combat
  attack(target: ICreature, allCreatures?: ICreature[], mapDefinition?: MapDefinition, mapData?: { tiles: string[][] }): CombatResult;
  
  // Actions
  run(): { success: boolean, message: string };
  search(): boolean;
  canRun(): boolean;
  canSearch(): boolean;
  disengage(): { success: boolean, message: string };
  canDisengage(): boolean;
  
  // State modifiers
  takeDamage(damage: number): number;
  useMovement(points: number): void;
  useAction(): void;
  canUseQuickAction(): boolean;
  useQuickAction(): void;
  useMana(amount: number): boolean;
  setMovedWhileEngaged(value: boolean): void;
  restoreMana(amount: number): void;
  startTurn(): void;
  endTurn(): void;
  resetRemainingActions(): void;
  
  // Zone of control
  isInZoneOfControl(x: number, y: number): boolean;
  
  // Creature filtering
  getHostileCreatures(allCreatures: ICreature[]): ICreature[];
  getFriendlyCreatures(allCreatures: ICreature[]): ICreature[];
  
  // Engagement
  isEngaged(hostileCreatures: ICreature[]): boolean;
  getEngagingCreatures(allCreatures: ICreature[]): ICreature[];
  
  // Turn start position
  get turnStartX(): number;
  get turnStartY(): number;
  get turnStartFacing(): number;
  
  // Cloning
  clone(overrides?: Partial<ICreature>): ICreature;
  
  // Status Effects
  getStatusEffectManager(): StatusEffectManager;
  addStatusEffect(effect: StatusEffect): void;
  removeStatusEffect(effectId: string): void;
  removeAllStatusEffects(): void;
  hasStatusEffect(type: string): boolean;
  getStatusEffect(type: string): StatusEffect | null;
  getActiveStatusEffects(): StatusEffect[];
  
  // Health Management
  heal(amount: number): void;
  
  // Utility methods
  getDimensions(): { w: number; h: number };
  isEngagedWithAll(allCreatures: ICreature[]): boolean;
  setRemainingMovement(value: number): void;
  recordTurnEndPosition(): void;
  getFacingShortName(): string;
  getAllSkills(): Array<{ name: string; type: string; description?: string }>;
}

// --- Manager Interfaces ---

export interface ICreatureStateManager {
  getState(): CreatureState;
  getTurnStartPosition(): CreaturePosition;
  isAlive(): boolean;
  isDead(): boolean;
  hasMoved(effectiveMovement?: number): boolean;
  hasActionsRemaining(): boolean;
  hasMana(amount: number): boolean;
  hasFortune(amount: number): boolean;
  hasTakenActionsThisTurn(): boolean;
  takeDamage(damage: number): number;
  useMovement(points: number): void;
  useAction(): void;
  canUseQuickAction(): boolean;
  useQuickAction(): void;
  useMana(amount: number): boolean;
  setMovedWhileEngaged(value: boolean): void;
  startTurn(): void;
  endTurn(): void;
  resetRemainingActions(): void;
  setRemainingMovement(value: number): void;
  setRemainingActions(value: number): void;
  setRemainingQuickActions(value: number): void;
  setRemainingFortune(value: number): void;
  setRemainingVitality(value: number): void;
  setRemainingMana(value: number): void;
  recordTurnStartPosition(position: CreaturePosition): void;
}

export interface ICreaturePositionManager {
  getPosition(): CreaturePosition;
  getX(): number;
  getY(): number;
  getFacing(): number;
  setPosition(x: number, y: number): void;
  setFacing(facing: number): void;
  getFacingDegrees(): number;
  getFacingArrow(): string;
  getFacingName(): string;
  getFacingShortName(): string;
  faceDirection(direction: number): void;
  faceTowards(targetX: number, targetY: number): void;
  getDimensions(size: number): { w: number; h: number };
}

export interface ICreatureCombatManager {
  getArmorValue(): number;
  getMainWeapon(): Weapon | RangedWeapon;
  hasRangedWeapon(): boolean;
  hasShield(): boolean;
  getAttackBonus(): number;
  getWeaponDamage(): number;
  getAttackRange(): number;
  getMaxAttackRange(): number;
  getZoneOfControlRange(): number;
  isInZoneOfControl(x: number, y: number, creatureX: number, creatureY: number): boolean;
  wasBehindTargetAtTurnStart(targetX: number, targetY: number, targetTurnStartFacing: number, attackerTurnStartX: number, attackerTurnStartY: number): boolean;
}

export interface ICreatureRelationshipsManager {
  isPlayerControlled(): boolean;
  isAIControlled(): boolean;
  isHostileTo(otherGroup: CreatureGroup): boolean; // CHANGED from string
  isFriendlyTo(otherGroup: CreatureGroup): boolean; // CHANGED from string
  getHostileCreatures(allCreatures: ICreature[]): ICreature[];
  getFriendlyCreatures(allCreatures: ICreature[]): ICreature[];
  isEngaged(hostileCreatures: ICreature[], positionX: number, positionY: number, zoneOfControlRange: number): boolean;
  getEngagingCreatures(allCreatures: ICreature[], positionX: number, positionY: number, zoneOfControlRange: number): ICreature[];
}

// --- Movement Interface ---

export interface ICreatureMovement {
  getReachableTiles(creature: ICreature, allCreatures: ICreature[], mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: MapDefinition): PathfindingResult;
  moveTo(creature: ICreature, path: Array<{x: number; y: number}>, allCreatures?: ICreature[], mapData?: { tiles: string[][] }, mapDefinition?: MapDefinition): MovementResult;
}

// --- Combat Interface ---

export interface ICombatExecutor {
  executeCombat(attacker: ICreature, target: ICreature, allCreatures: ICreature[], mapDefinition?: MapDefinition, mapData?: { tiles: string[][] }): CombatResult;
}
