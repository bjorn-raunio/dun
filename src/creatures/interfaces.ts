// --- Shared Creature Interfaces ---
// This file contains interfaces that can be imported by other modules
// without creating circular dependencies

import { Item, Weapon, RangedWeapon, Armor, Shield } from '../items';
import { MovementResult } from '../game/movement';
import { StatusEffectManager, StatusEffect, CreatureState, CreaturePosition } from './types';
import { MapDefinition } from '../maps/types';
import { CombatResult } from '../utils/combat/types';
import { PathfindingResult } from '../utils/pathfinding/types';

// --- Core Creature Interfaces ---

export interface ICreature {
  // Core properties
  id: string;
  name: string;
  image?: string;
  group: string;
  size: number;
  skills: { [key: string]: { name: string; type: string; description?: string } };
  
  // Position
  x: number;
  y: number;
  facing: number;
  
  // State
  isAlive(): boolean;
  isDead(): boolean;
  isWounded(): boolean;
  hasMoved(): boolean;
  hasActionsRemaining(): boolean;
  hasMana(amount: number): boolean;
  hasFortune(amount: number): boolean;
  hasTakenActionsThisTurn(): boolean;
  
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
  
  // Relationships
  isHeroGroup(): boolean;
  isPlayerControlled(): boolean;
  isAIControlled(): boolean;
  isHostileTo(other: ICreature): boolean;
  isFriendlyTo(other: ICreature): boolean;
  
  // Movement
  getReachableTiles(allCreatures: ICreature[], mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: MapDefinition): PathfindingResult;
  moveTo(path: Array<{x: number; y: number}>, allCreatures?: ICreature[], mapData?: { tiles: string[][] }, mapDefinition?: MapDefinition): MovementResult;
  
  // Combat
  attack(target: ICreature, allCreatures?: ICreature[], mapDefinition?: MapDefinition, mapData?: { tiles: string[][] }): CombatResult;
  
  // State modifiers
  takeDamage(damage: number): number;
  useMovement(points: number): void;
  useAction(): void;
  useQuickAction(): void;
  useMana(amount: number): boolean;
  setMovedWhileEngaged(value: boolean): void;
  setRemainingVitality(value: number): void;
  resetTurn(): void;
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
  
  // Group actions
  resetGroupActions(allCreatures: ICreature[]): void;
  
  // Cloning
  clone(overrides?: Partial<ICreature>): ICreature;
  
  // Status Effects
  getStatusEffectManager(): StatusEffectManager;
  addStatusEffect(effect: StatusEffect): void;
  removeStatusEffect(effectId: string): void;
  hasStatusEffect(type: string): boolean;
  getStatusEffect(type: string): StatusEffect | null;
  getActiveStatusEffects(): StatusEffect[];
  
  // Health Management
  heal(amount: number): void;
}

// --- Manager Interfaces ---

export interface ICreatureStateManager {
  getState(): CreatureState;
  getTurnStartPosition(): CreaturePosition;
  isAlive(): boolean;
  isDead(): boolean;
  isWounded(size: number): boolean;
  hasMoved(effectiveMovement?: number): boolean;
  hasActionsRemaining(): boolean;
  hasMana(amount: number): boolean;
  hasFortune(amount: number): boolean;
  hasTakenActionsThisTurn(): boolean;
  takeDamage(damage: number): number;
  useMovement(points: number): void;
  useAction(): void;
  useQuickAction(): void;
  useMana(amount: number): boolean;
  setMovedWhileEngaged(value: boolean): void;
  resetTurn(): void;
  recordTurnEndPosition(): void;
  resetRemainingActions(): void;
  setRemainingMovement(value: number): void;
  setRemainingActions(value: number): void;
  setRemainingQuickActions(value: number): void;
  setRemainingFortune(value: number): void;
  setRemainingVitality(value: number): void;
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
  getEffectiveMovement(isWounded: boolean, statusEffects?: StatusEffect[]): number;
  getEffectiveCombat(isWounded: boolean, statusEffects?: StatusEffect[]): number;
  getEffectiveRanged(isWounded: boolean, statusEffects?: StatusEffect[]): number;
  getEffectiveStrength(isWounded: boolean, statusEffects?: StatusEffect[]): number;
  getEffectiveAgility(isWounded: boolean, statusEffects?: StatusEffect[]): number;
  getEffectiveCourage(isWounded: boolean, statusEffects?: StatusEffect[]): number;
  getEffectiveIntelligence(isWounded: boolean, statusEffects?: StatusEffect[]): number;
  getEffectivePerception(isWounded: boolean, statusEffects?: StatusEffect[]): number;
  getEffectiveDexterity(isWounded: boolean, statusEffects?: StatusEffect[]): number;
}

export interface ICreatureRelationshipsManager {
  isHeroGroup(): boolean;
  isPlayerControlled(): boolean;
  isAIControlled(): boolean;
  isHostileTo(otherGroup: string): boolean;
  isFriendlyTo(otherGroup: string): boolean;
  getHostileCreatures(allCreatures: ICreature[]): ICreature[];
  getFriendlyCreatures(allCreatures: ICreature[]): ICreature[];
  isEngaged(hostileCreatures: ICreature[], positionX: number, positionY: number, zoneOfControlRange: number): boolean;
  getEngagingCreatures(allCreatures: ICreature[], positionX: number, positionY: number, zoneOfControlRange: number): ICreature[];
  resetGroupActions(allCreatures: ICreature[]): void;
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
