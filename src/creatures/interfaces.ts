// --- Shared Creature Interfaces ---
// This file contains interfaces that can be imported by other modules
// without creating circular dependencies

import { Item, Weapon, RangedWeapon, Armor, Shield } from '../items';
import { MovementResult } from '../game/movement';
import { StatusEffectManager } from './types';

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
  isHostileTo(other: any): boolean;
  isFriendlyTo(other: any): boolean;
  
  // Movement
  getReachableTiles(allCreatures: any[], mapData: any, cols: number, rows: number, mapDefinition?: any): any;
  moveTo(path: Array<{x: number; y: number}>, allCreatures?: any[], mapData?: any, mapDefinition?: any): MovementResult;
  
  // Combat
  attack(target: any, allCreatures?: any[], mapDefinition?: any, mapData?: any): any;
  
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
  getHostileCreatures(allCreatures: any[]): any[];
  getFriendlyCreatures(allCreatures: any[]): any[];
  
  // Engagement
  isEngaged(hostileCreatures: any[]): boolean;
  getEngagingCreatures(allCreatures: any[]): any[];
  
  // Turn start position
  get turnStartX(): number;
  get turnStartY(): number;
  get turnStartFacing(): number;
  
  // Group actions
  resetGroupActions(allCreatures: any[]): void;
  
  // Cloning
  clone(overrides?: Partial<any>): any;
  
  // Status Effects
  getStatusEffectManager(): StatusEffectManager;
  addStatusEffect(effect: any): void;
  removeStatusEffect(effectId: string): void;
  hasStatusEffect(type: string): boolean;
  getStatusEffect(type: string): any;
  getActiveStatusEffects(): any[];
  
  // Health Management
  heal(amount: number): void;
}

// --- Manager Interfaces ---

export interface ICreatureStateManager {
  getState(): any;
  getTurnStartPosition(): any;
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
  recordTurnStartPosition(position: any): void;
}

export interface ICreaturePositionManager {
  getPosition(): any;
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
  getMainWeapon(): any;
  hasRangedWeapon(): boolean;
  hasShield(): boolean;
  getAttackBonus(): number;
  getWeaponDamage(): number;
  getAttackRange(): number;
  getMaxAttackRange(): number;
  getZoneOfControlRange(): number;
  isInZoneOfControl(x: number, y: number, creatureX: number, creatureY: number): boolean;
  wasBehindTargetAtTurnStart(targetX: number, targetY: number, targetTurnStartFacing: number, attackerTurnStartX: number, attackerTurnStartY: number): boolean;
  getEffectiveMovement(isWounded: boolean, statusEffects?: any[]): number;
  getEffectiveCombat(isWounded: boolean, statusEffects?: any[]): number;
  getEffectiveRanged(isWounded: boolean, statusEffects?: any[]): number;
  getEffectiveStrength(isWounded: boolean, statusEffects?: any[]): number;
  getEffectiveAgility(isWounded: boolean, statusEffects?: any[]): number;
  getEffectiveCourage(isWounded: boolean, statusEffects?: any[]): number;
  getEffectiveIntelligence(isWounded: boolean, statusEffects?: any[]): number;
  getEffectivePerception(isWounded: boolean, statusEffects?: any[]): number;
  getEffectiveDexterity(isWounded: boolean, statusEffects?: any[]): number;
}

export interface ICreatureRelationshipsManager {
  isHeroGroup(): boolean;
  isPlayerControlled(): boolean;
  isAIControlled(): boolean;
  isHostileTo(otherGroup: string): boolean;
  isFriendlyTo(otherGroup: string): boolean;
  getHostileCreatures(allCreatures: any[]): any[];
  getFriendlyCreatures(allCreatures: any[]): any[];
  isEngaged(hostileCreatures: any[], positionX: number, positionY: number, zoneOfControlRange: number): boolean;
  getEngagingCreatures(allCreatures: any[], positionX: number, positionY: number, zoneOfControlRange: number): any[];
  resetGroupActions(allCreatures: any[]): void;
}

// --- Movement Interface ---

export interface ICreatureMovement {
  getReachableTiles(creature: any, allCreatures: any[], mapData: any, cols: number, rows: number, mapDefinition?: any): any;
  moveTo(creature: any, path: Array<{x: number; y: number}>, allCreatures?: any[], mapData?: any, mapDefinition?: any): MovementResult;
}

// --- Combat Interface ---

export interface ICombatExecutor {
  executeCombat(attacker: any, target: any, allCreatures: any[], mapDefinition?: any, mapData?: any): any;
}
