import { 
  Attributes, 
  CreatureGroup, 
  CREATURE_GROUPS, 
  CreatureConstructorParams,
  CreaturePosition,
  CreatureState,
  DEFAULT_ATTRIBUTES
} from './types';
import { CreatureStateManager } from './state';
import { CreaturePositionManager } from './position';
import { CreatureCombatManager } from './combat';
import { CreatureRelationshipsManager } from './relationships';
import { ICreature, ICreatureStateManager, ICreaturePositionManager, ICreatureCombatManager, ICreatureRelationshipsManager } from './interfaces';
import { Item } from '../items';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { generateCreatureId } from '../utils/idGeneration';
import creatureServices from './services';

// --- Refactored Base Creature Class ---
export abstract class Creature implements ICreature {
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
  equipment: {
    mainHand?: any;
    offHand?: any;
    armor?: any;
  };
  vitality: number;
  mana: number;
  fortune: number;
  naturalArmor: number;
  group: CreatureGroup;

  // Manager instances - now using interfaces
  private stateManager: ICreatureStateManager;
  private positionManager: ICreaturePositionManager;
  private combatManager: ICreatureCombatManager;
  private relationshipsManager: ICreatureRelationshipsManager;

  constructor(params: CreatureConstructorParams) {
    this.id = params.id ?? generateCreatureId();
    this.name = params.name;
    this.image = params.image;
    this.attributes = { ...DEFAULT_ATTRIBUTES, ...params.attributes };
    this.actions = params.actions;
    this.quickActions = params.quickActions ?? 1;
    this.mapWidth = params.mapWidth ?? 1;
    this.mapHeight = params.mapHeight ?? 1;
    this.size = params.size;
    this.inventory = params.inventory ?? [];
    this.equipment = params.equipment ?? {};
    this.vitality = params.vitality;
    this.mana = params.mana;
    this.fortune = params.fortune;
    this.naturalArmor = params.naturalArmor ?? 3;
    this.group = params.group;

    // Initialize managers
    const initialPosition: CreaturePosition = {
      x: params.x,
      y: params.y,
      facing: params.facing ?? 0
    };

    this.stateManager = new CreatureStateManager(
      params.attributes.movement,
      params.actions,
      params.quickActions ?? 1,
      params.vitality,
      params.mana,
      params.fortune,
      initialPosition
    );

    this.positionManager = new CreaturePositionManager(initialPosition);
    this.combatManager = new CreatureCombatManager(
      this.attributes,
      this.equipment,
      this.naturalArmor,
      this.size
    );
    this.relationshipsManager = new CreatureRelationshipsManager(this.group);
  }

  // --- Abstract Methods ---
  abstract get kind(): "hero" | "monster" | "mercenary";

  // --- Position Delegation ---
  get x(): number { return this.positionManager.getX(); }
  get y(): number { return this.positionManager.getY(); }
  get facing(): number { return this.positionManager.getFacing(); }
  
  set x(value: number) { this.positionManager.setPosition(value, this.y); }
  set y(value: number) { this.positionManager.setPosition(this.x, value); }
  set facing(value: number) { this.positionManager.setFacing(value); }

  // --- State Delegation ---
  get remainingMovement(): number { return this.stateManager.getState().remainingMovement; }
  get remainingActions(): number { return this.stateManager.getState().remainingActions; }
  get remainingQuickActions(): number { return this.stateManager.getState().remainingQuickActions; }
  get remainingVitality(): number { return this.stateManager.getState().remainingVitality; }
  get remainingMana(): number { return this.stateManager.getState().remainingMana; }
  get remainingFortune(): number { return this.stateManager.getState().remainingFortune; }
  get hasMovedWhileEngaged(): boolean { return this.stateManager.getState().hasMovedWhileEngaged; }

  // --- Backward Compatibility Getters/Setters ---
  get movement(): number { 
    return this.combatManager.getEffectiveMovement(this.stateManager.isWounded(this.size)); 
  }
  get combat(): number { 
    return this.combatManager.getEffectiveCombat(this.stateManager.isWounded(this.size)); 
  }
  get ranged(): number { 
    return this.combatManager.getEffectiveRanged(this.stateManager.isWounded(this.size)); 
  }
  get strength(): number { 
    return this.combatManager.getEffectiveStrength(this.stateManager.isWounded(this.size)); 
  }
  get agility(): number { 
    return this.combatManager.getEffectiveAgility(this.stateManager.isWounded(this.size)); 
  }
  get courage(): number { 
    return this.combatManager.getEffectiveCourage(this.stateManager.isWounded(this.size)); 
  }
  get intelligence(): number { 
    return this.combatManager.getEffectiveIntelligence(this.stateManager.isWounded(this.size)); 
  }
  get perception(): number { 
    return this.combatManager.getEffectivePerception(this.stateManager.isWounded(this.size)); 
  }
  get dexterity(): number { 
    return this.combatManager.getEffectiveDexterity(this.stateManager.isWounded(this.size)); 
  }

  set movement(value: number) { this.attributes.movement = value; }
  set combat(value: number) { this.attributes.combat = value; }
  set ranged(value: number) { this.attributes.ranged = value; }
  set strength(value: number) { this.attributes.strength = value; }
  set agility(value: number) { this.attributes.agility = value; }
  set courage(value: number) { this.attributes.courage = value; }
  set intelligence(value: number) { this.attributes.intelligence = value; }
  set perception(value: number) { this.attributes.perception = value; }
  set dexterity(value: number) { this.attributes.dexterity = value; }

  // --- State Methods ---
  isAlive(): boolean { return this.stateManager.isAlive(); }
  isDead(): boolean { return this.stateManager.isDead(); }
  isWounded(): boolean { return this.stateManager.isWounded(this.size); }
  hasMoved(): boolean { return this.stateManager.hasMoved(); }
  hasActionsRemaining(): boolean { return this.stateManager.hasActionsRemaining(); }
  hasMana(amount: number): boolean { return this.stateManager.hasMana(amount); }
  hasTakenActionsThisTurn(): boolean { return this.stateManager.hasTakenActionsThisTurn(); }
  hasFortune(amount: number): boolean { return this.stateManager.hasFortune(amount); }
  setRemainingFortune(value: number): void { this.stateManager.setRemainingFortune(value); }

  // --- Combat Methods ---
  getArmorValue(): number { return this.combatManager.getArmorValue(); }
  getMainWeapon(): any { return this.combatManager.getMainWeapon(); }
  hasRangedWeapon(): boolean { return this.combatManager.hasRangedWeapon(); }
  hasShield(): boolean { return this.combatManager.hasShield(); }
  getAttackBonus(): number { return this.combatManager.getAttackBonus(); }
  getWeaponDamage(): number { return this.combatManager.getWeaponDamage(); }
  getAttackRange(): number { return this.combatManager.getAttackRange(); }
  getMaxAttackRange(): number { return this.combatManager.getMaxAttackRange(); }
  getZoneOfControlRange(): number { return this.combatManager.getZoneOfControlRange(); }

  // --- Combat State Management ---
  private isInCombat: boolean = false;
  
  checkCombatState(allCreatures: any[]): boolean {
    const hostileCreatures = this.getHostileCreatures(allCreatures);
    
    for (const enemy of hostileCreatures) {
      const distance = calculateDistanceBetween(this.x, this.y, enemy.x, enemy.y);
      if (distance <= 12) {
        return true;
      }
    }
    
    return false;
  }

  updateCombatState(allCreatures: any[]): void {
    this.isInCombat = this.checkCombatState(allCreatures);
  }

  getCombatState(): boolean {
    return this.isInCombat;
  }

  // Get all enemies within combat range (12 tiles)
  getEnemiesInCombatRange(allCreatures: any[]): any[] {
    const hostileCreatures = this.getHostileCreatures(allCreatures);
    
    return hostileCreatures.filter(enemy => {
      const distance = calculateDistanceBetween(this.x, this.y, enemy.x, enemy.y);
      return distance <= 12;
    });
  }

  // --- Position Methods ---
  getFacingDegrees(): number { return this.positionManager.getFacingDegrees(); }
  getFacingArrow(): string { return this.positionManager.getFacingArrow(); }
  getFacingName(): string { return this.positionManager.getFacingName(); }
  getFacingShortName(): string { return this.positionManager.getFacingShortName(); }
  faceDirection(direction: number): void { this.positionManager.faceDirection(direction); }
  faceTowards(targetX: number, targetY: number): void { this.positionManager.faceTowards(targetX, targetY); }
  getDimensions(): { w: number; h: number } { return this.positionManager.getDimensions(this.size); }

  // --- Relationship Methods ---
  isHeroGroup(): boolean { return this.relationshipsManager.isHeroGroup(); }
  isPlayerControlled(): boolean { return this.relationshipsManager.isPlayerControlled(); }
  isAIControlled(): boolean { return this.relationshipsManager.isAIControlled(); }
  isHostileTo(other: any): boolean { return this.relationshipsManager.isHostileTo(other.group); }
  isFriendlyTo(other: any): boolean { return this.relationshipsManager.isFriendlyTo(other.group); }

  // --- State Modifiers ---
  takeDamage(damage: number): number { return this.stateManager.takeDamage(damage); }
  useMovement(points: number): void { this.stateManager.useMovement(points); }
  useAction(): void { this.stateManager.useAction(); }
  useQuickAction(): void { this.stateManager.useQuickAction(); }
  useMana(amount: number): boolean { return this.stateManager.useMana(amount); }
  setMovedWhileEngaged(value: boolean): void { this.stateManager.setMovedWhileEngaged(value); }
  setRemainingMovement(value: number): void { this.stateManager.setRemainingMovement(value); }
  setRemainingActions(value: number): void { this.stateManager.setRemainingActions(value); }
  setRemainingQuickActions(value: number): void { this.stateManager.setRemainingQuickActions(value); }
  resetTurn(): void { 
    this.stateManager.resetTurn(); 
    this.stateManager.recordTurnStartPosition(this.positionManager.getPosition());
  }
  resetRemainingActions(): void { this.stateManager.resetRemainingActions(); }

  // --- Zone of Control ---
  isInZoneOfControl(x: number, y: number): boolean {
    return this.combatManager.isInZoneOfControl(x, y, this.x, this.y);
  }

  // --- Creature Filtering ---
  getHostileCreatures(allCreatures: any[]): any[] { return this.relationshipsManager.getHostileCreatures(allCreatures); }
  getFriendlyCreatures(allCreatures: any[]): any[] { return this.relationshipsManager.getFriendlyCreatures(allCreatures); }

  // --- Engagement ---
  isEngaged(hostileCreatures: any[]): boolean {
    return this.relationshipsManager.isEngaged(hostileCreatures, this.x, this.y, this.getZoneOfControlRange());
  }

  getEngagingCreatures(allCreatures: any[]): any[] {
    return this.relationshipsManager.getEngagingCreatures(allCreatures, this.x, this.y, this.getZoneOfControlRange());
  }

  canMoveToWhenEngaged(newX: number, newY: number, engagingCreatures: any[]): boolean {
    return this.relationshipsManager.canMoveToWhenEngaged(newX, newY, engagingCreatures, this.hasMovedWhileEngaged);
  }

  // Convenience method to check engagement status with all creatures
  isEngagedWithAll(allCreatures: any[]): boolean {
    const hostileCreatures = this.getHostileCreatures(allCreatures);
    return this.isEngaged(hostileCreatures);
  }

  // --- Turn Start Position ---
  get turnStartX(): number { return this.stateManager.getTurnStartPosition().x; }
  get turnStartY(): number { return this.stateManager.getTurnStartPosition().y; }
  get turnStartFacing(): number { return this.stateManager.getTurnStartPosition().facing; }

  wasBehindTargetAtTurnStart(target: any): boolean {
    return this.combatManager.wasBehindTargetAtTurnStart(
      target.x, target.y, target.turnStartFacing, this.turnStartX, this.turnStartY
    );
  }

  // --- Group Actions ---
  resetGroupActions(allCreatures: any[]): void { this.relationshipsManager.resetGroupActions(allCreatures); }

  // --- Movement and Combat Delegation ---
  getReachableTiles(allCreatures: any[], mapData: any, cols: number, rows: number, mapDefinition?: any): any {
    return creatureServices.getMovementService().getReachableTiles(this, allCreatures, mapData, cols, rows, mapDefinition);
  }

  moveTo(path: Array<{x: number; y: number}>, allCreatures: any[] = []): { success: boolean; message?: string } {
    return creatureServices.getMovementService().moveTo(this, path, allCreatures);
  }

  attack(target: any, allCreatures: any[] = [], mapDefinition?: any): any {
    const result = creatureServices.getCombatExecutor().executeCombat(this, target, allCreatures, mapDefinition);
    
    return {
      hit: result.success,
      damage: result.damage,
      message: result.message,
      targetDefeated: result.targetDefeated,
      toHitMessage: result.toHitMessage,
      blockMessage: result.blockMessage,
      damageMessage: result.damageMessage
    };
  }

  // --- Cloning ---
  clone(overrides?: Partial<Creature>): Creature {
    const params = {
      name: this.name,
      x: this.x,
      y: this.y,
      image: this.image,
      attributes: { ...this.attributes },
      actions: this.actions,
      quickActions: this.quickActions,
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      size: this.size,
      facing: this.facing,
      inventory: [...this.inventory],
      equipment: { ...this.equipment },
      vitality: this.vitality,
      mana: this.mana,
      fortune: this.fortune,
      remainingVitality: this.remainingVitality,
      naturalArmor: this.naturalArmor,
      hasMovedWhileEngaged: this.hasMovedWhileEngaged,
      group: this.group,
      ...overrides
    };

    // Use abstract method to create the appropriate instance
    return this.createInstance(params);
  }

  // --- Abstract Factory Method ---
  protected abstract createInstance(params: any): Creature;
}
