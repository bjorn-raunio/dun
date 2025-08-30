// --- Shared Creature Interfaces ---
// This file contains interfaces that can be imported by other modules
// without creating circular dependencies

import { Item, Weapon, RangedWeapon, Armor, Shield } from '../items';

// --- Core Creature Interfaces ---

export interface ICreature {
  // Core properties
  id: string;
  name: string;
  image?: string;
  group: string;
  size: number;
  
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
  moveTo(path: Array<{x: number; y: number}>, allCreatures?: any[]): { success: boolean; message?: string };
  
  // Combat
  attack(target: any, allCreatures?: any[], mapDefinition?: any): any;
  
  // State modifiers
  takeDamage(damage: number): number;
  useMovement(points: number): void;
  useAction(): void;
  useQuickAction(): void;
  useMana(amount: number): boolean;
  setMovedWhileEngaged(value: boolean): void;
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
  canMoveToWhenEngaged(newX: number, newY: number, engagingCreatures: any[]): boolean;
  
  // Turn start position
  get turnStartX(): number;
  get turnStartY(): number;
  get turnStartFacing(): number;
  
  // Group actions
  resetGroupActions(allCreatures: any[]): void;
  
  // Cloning
  clone(overrides?: Partial<any>): any;
}

// --- Manager Interfaces ---

export interface ICreatureStateManager {
  getState(): any;
  getTurnStartPosition(): any;
  isAlive(): boolean;
  isDead(): boolean;
  isWounded(size: number): boolean;
  hasMoved(): boolean;
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
  resetRemainingActions(): void;
  setRemainingMovement(value: number): void;
  setRemainingActions(value: number): void;
  setRemainingQuickActions(value: number): void;
  setRemainingFortune(value: number): void;
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
  getEffectiveMovement(isWounded: boolean): number;
  getEffectiveCombat(isWounded: boolean): number;
  getEffectiveRanged(isWounded: boolean): number;
  getEffectiveStrength(isWounded: boolean): number;
  getEffectiveAgility(isWounded: boolean): number;
  getEffectiveCourage(isWounded: boolean): number;
  getEffectiveIntelligence(isWounded: boolean): number;
  getEffectivePerception(isWounded: boolean): number;
  getEffectiveDexterity(isWounded: boolean): number;
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
  canMoveToWhenEngaged(newX: number, newY: number, engagingCreatures: any[], hasMovedWhileEngaged: boolean): boolean;
  resetGroupActions(allCreatures: any[]): void;
}

// --- Movement Interface ---

export interface ICreatureMovement {
  getReachableTiles(creature: any, allCreatures: any[], mapData: any, cols: number, rows: number, mapDefinition?: any): any;
  moveTo(creature: any, path: Array<{x: number; y: number}>, allCreatures?: any[]): { success: boolean; message?: string };
}

// --- Combat Interface ---

export interface ICombatExecutor {
  executeCombat(attacker: any, target: any, allCreatures: any[], mapDefinition?: any): any;
}
