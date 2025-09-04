// --- Shared Creature Interfaces ---
// This file contains interfaces that can be imported by other modules
// without creating circular dependencies

import { Item, Weapon, RangedWeapon, Armor, Shield, EquipmentSlots } from '../items';
import { MovementResult } from '../utils/movement';
import { CreatureState, CreaturePosition, CreaturePositionOrUndefined } from './types';
import { CreatureGroup } from './CreatureGroup';
import { StatusEffectManager, StatusEffect, Attributes } from '../statusEffects';
import { QuestMap } from '../maps/types';
import { CombatResult } from '../utils/combat/types';
import { PathfindingResult } from '../utils/pathfinding/types';
import { Skill } from '../skills';

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
  skills: Skill[];
  running: boolean;
  
  // Position
  x: number | undefined;
  y: number | undefined;
  facing: number | undefined;
  
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
  getEnemiesInCombatRange(allCreatures: ICreature[]): ICreature[];
  
  // Relationships
  isPlayerControlled(): boolean;
  isAIControlled(): boolean;
  isHostileTo(other: ICreature): boolean;
  isFriendlyTo(other: ICreature): boolean;
  
  // Movement
  getReachableTiles(allCreatures: ICreature[], mapDefinition: QuestMap, cols: number, rows: number): PathfindingResult;
  moveTo(path: Array<{x: number; y: number}>, allCreatures?: ICreature[], mapDefinition?: QuestMap): MovementResult;
  enterTile(x: number, y: number, mapDefinition: QuestMap): void;
  getVision(x: number, y: number, mapDefinition: QuestMap): number;
  
  // Combat
  attack(target: ICreature, allCreatures?: ICreature[], mapDefinition?: QuestMap, offhand?: boolean): CombatResult;
  
  // Actions
  canAct(): boolean;
  performAction(action: 'run' | 'disengage' | 'search', allCreatures: ICreature[]): { success: boolean, message: string };
  
  // State modifiers
  takeDamage(damage: number): boolean;
  useMovement(points: number): void;
  useAction(): void;
  canUseQuickAction(): boolean;
  useQuickAction(): void;
  useMana(amount: number): boolean;
  setMovedWhileEngaged(value: boolean): void;
  restoreMana(amount: number): void;
  startTurn(): string[];
  endTurn(): void;
  resetRemainingActions(): void;
  
  // Zone of control
  isInZoneOfControl(x: number, y: number): boolean;
  
  // Creature filtering
  getHostileCreatures(allCreatures: ICreature[]): ICreature[];
  getFriendlyCreatures(allCreatures: ICreature[]): ICreature[];
  
  // Turn start position
  get turnStartX(): number | undefined;
  get turnStartY(): number | undefined;
  get turnStartFacing(): number | undefined;
  
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
  setRemainingMovement(value: number): void;
  recordTurnEndPosition(): void;
  getFacingShortName(): string | undefined;
  getAllSkills(): Array<{ name: string; type: string; description?: string }>;
}

// --- Manager Interfaces ---

export interface ICreatureStateManager {
  getState(): CreatureState;
  getTurnStartPosition(): CreaturePositionOrUndefined;
  isAlive(): boolean;
  isDead(): boolean;
  hasMoved(effectiveMovement?: number): boolean;
  hasActionsRemaining(): boolean;
  hasMana(amount: number): boolean;
  hasFortune(amount: number): boolean;
  hasTakenActionsThisTurn(): boolean;
  takeDamage(damage: number): boolean;
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
  recordTurnStartPosition(position: CreaturePositionOrUndefined): void;
  canPushCreature(targetId: string): boolean;
  recordPushedCreature(targetId: string): void;
  updateGetters(
    getMaxMovement: () => number,
    getMaxActions: () => number,
    getMaxQuickActions: () => number,
    getMaxVitality: () => number,
    getMaxMana: () => number,
    getMaxFortune: () => number
  ): void;
}

export interface ICreaturePositionManager {
  getPosition(): CreaturePositionOrUndefined;
  getX(): number | undefined;
  getY(): number | undefined;
  getFacing(): number | undefined;
  isOnMap(): boolean;
  setPosition(x: number, y: number): void;
  setFacing(facing: number): void;
  removeFromMap(): void;
  getFacingDegrees(): number | undefined;
  getFacingArrow(): string | undefined;
  getFacingName(): string | undefined;
  getFacingShortName(): string | undefined;
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
}

// --- Movement Interface ---

export interface ICreatureMovement {
  getReachableTiles(creature: ICreature, allCreatures: ICreature[], mapDefinition: QuestMap, cols: number, rows: number): PathfindingResult;
  moveTo(creature: ICreature, path: Array<{x: number; y: number}>, allCreatures?: ICreature[], mapDefinition?: QuestMap): MovementResult;
  enterTile(creature: ICreature, x: number, y: number, mapDefinition: QuestMap): void;
}

// --- Combat Interface ---

export interface ICombatExecutor {
  executeCombat(attacker: ICreature, target: ICreature, allCreatures: ICreature[], mapDefinition?: QuestMap, offhand?: boolean): CombatResult;
}
