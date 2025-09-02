import {
  CreatureAction,
  CreatureConstructorParams,
  CreaturePosition,
  CreatureState,
  DEFAULT_ATTRIBUTES
} from './types';
import { Skill } from '../skills';
import { CreatureGroup } from './CreatureGroup';
import {
  Attributes,
  StatusEffect,
  StatusEffectType,
  CreatureStatusEffectManager,
  STATUS_EFFECT_PRESETS
} from '../statusEffects';
import { CreatureStateManager } from './state';
import { CreaturePositionManager } from './position';
import { CreatureCombatManager } from './combat';
import { CreatureRelationshipsManager } from './relationships';
import { SkillProcessor } from '../skills';
import { ICreature, ICreatureStateManager, ICreaturePositionManager, ICreatureCombatManager, ICreatureRelationshipsManager } from './interfaces';
import { Item, Weapon, RangedWeapon, Armor, Shield, EquipmentSlots } from '../items';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { generateCreatureId } from '../utils/idGeneration';
import creatureServices from './services';
import { MovementResult } from '../game/movement';
import { QuestMap } from '../maps/types';
import { CombatResult } from '../utils/combat/types';
import { PathfindingResult } from '../utils/pathfinding/types';
import { calculateAttributeRoll, displayDiceRoll } from '../utils';
import { validateAction} from '../validation';

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
  equipment: EquipmentSlots;
  vitality: number;
  mana: number;
  fortune: number;
  naturalArmor: number;
  group: CreatureGroup;
  skills: Skill[];
  running: boolean;

  // Manager instances - now using interfaces
  private stateManager: ICreatureStateManager;
  private positionManager: ICreaturePositionManager;
  private combatManager: ICreatureCombatManager;
  private relationshipsManager: ICreatureRelationshipsManager;
  private statusEffectManager: CreatureStatusEffectManager;

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
    this.equipment = params.equipment ?? { mainHand: undefined, offHand: undefined, armor: undefined };
    this.vitality = params.vitality;
    this.mana = params.mana;
    this.fortune = params.fortune;
    this.naturalArmor = params.naturalArmor ?? 3;
    this.group = params.group;
    this.running = false;
    this.skills = params.skills ?? [];

    // Initialize managers
    const initialPosition: CreaturePosition | undefined = params.position;

    this.stateManager = new CreatureStateManager(
      () => this.attributes.movement,
      () => this.actions,
      () => this.quickActions,
      () => this.vitality,
      () => this.mana,
      () => this.fortune,
      initialPosition
    );

    this.positionManager = new CreaturePositionManager(initialPosition);
    this.combatManager = new CreatureCombatManager(
      () => this.attributes,
      () => this.equipment,
      () => this.naturalArmor,
      () => this.size,
      () => this.skills
    );
    this.relationshipsManager = new CreatureRelationshipsManager(this.group);

    // Initialize status effect manager
    this.statusEffectManager = new CreatureStatusEffectManager(this);

    // Add this creature to its group
    this.group.addCreature(this);
  }

  // --- Abstract Methods ---
  abstract get kind(): "hero" | "monster" | "mercenary";

  // --- Position Delegation ---
  get x(): number | undefined { return this.positionManager.getX(); }
  get y(): number | undefined { return this.positionManager.getY(); }
  get facing(): number | undefined { return this.positionManager.getFacing(); }

  set x(value: number | undefined) {
    if (value !== undefined) {
      const currentY = this.positionManager.getY() ?? 0;
      this.positionManager.setPosition(value, currentY);
    } else {
      this.positionManager.removeFromMap();
    }
  }
  set y(value: number | undefined) {
    if (value !== undefined) {
      const currentX = this.positionManager.getX() ?? 0;
      this.positionManager.setPosition(currentX, value);
    } else {
      this.positionManager.removeFromMap();
    }
  }
  set facing(value: number | undefined) {
    if (value !== undefined) {
      this.positionManager.setFacing(value);
    }
  }

  // --- State Delegation ---
  private getModifiedRemaining(baseValue: number, modifierType: 'movementModifier' | 'actionModifier' | 'quickActionModifier'): number {
    const statusEffects = this.getActiveStatusEffects();

    // Apply status effect modifiers
    let modifiedValue = baseValue;
    for (const effect of statusEffects) {
      const modifier = effect[modifierType];
      if (modifier) {
        modifiedValue += modifier;
      }
    }
    if (this.isDead()) {
      modifiedValue = 0;
    }

    return Math.max(0, modifiedValue);
  }

  get remainingMovement(): number {
    const baseRemaining = this.stateManager.getState().remainingMovement;
    return this.getModifiedRemaining(baseRemaining, 'movementModifier');
  }

  get remainingActions(): number {
    const baseRemaining = this.stateManager.getState().remainingActions;
    return this.getModifiedRemaining(baseRemaining, 'actionModifier');
  }

  get remainingQuickActions(): number {
    const baseRemaining = this.stateManager.getState().remainingQuickActions;
    return this.getModifiedRemaining(baseRemaining, 'quickActionModifier');
  }
  get remainingVitality(): number { return this.stateManager.getState().remainingVitality; }
  get remainingMana(): number { return this.stateManager.getState().remainingMana; }
  get remainingFortune(): number { return this.stateManager.getState().remainingFortune; }
  get hasMovedWhileEngaged(): boolean { return this.stateManager.getState().hasMovedWhileEngaged; }

  // --- Backward Compatibility Getters/Setters ---
  get movement(): number {
    return this.getEffectiveAttribute('movement');
  }
  get combat(): number {
    return this.getEffectiveAttribute('combat');
  }
  get ranged(): number {
    return this.getEffectiveAttribute('ranged');
  }
  get strength(): number {
    return this.getEffectiveAttribute('strength');
  }
  get agility(): number {
    return this.getEffectiveAttribute('agility');
  }
  get courage(): number {
    return this.getEffectiveAttribute('courage');
  }
  get intelligence(): number {
    return this.getEffectiveAttribute('intelligence');
  }
  get perception(): number {
    return this.getEffectiveAttribute('perception');
  }
  get dexterity(): number {
    return this.getEffectiveAttribute('dexterity');
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

  // --- State methods ---
  isAlive(): boolean { return this.stateManager.isAlive(); }
  isDead(): boolean { return this.stateManager.isDead(); }
  isWounded(): boolean { return this.hasStatusEffect("wounded"); }
  hasMoved(): boolean {
    // Check if the creature has moved considering status effects
    return this.effectiveMovement > 0 && this.stateManager.hasMoved(this.effectiveMovement);
  }
  hasActionsRemaining(): boolean {
    // Check if the creature has any effective actions remaining (considering status effects)
    return this.effectiveActions > 0 && this.stateManager.hasActionsRemaining();
  }
  hasMana(amount: number): boolean { return this.stateManager.hasMana(amount); }
  hasFortune(amount: number): boolean { return this.stateManager.hasFortune(amount); }
  hasTakenActionsThisTurn(): boolean { return this.stateManager.hasTakenActionsThisTurn(); }
  setRemainingFortune(value: number): void { this.stateManager.setRemainingFortune(value); }

  // --- Push Tracking ---
  canPushCreature(targetId: string): boolean { return this.stateManager.canPushCreature(targetId); }
  recordPushedCreature(targetId: string): void { this.stateManager.recordPushedCreature(targetId); }

  // --- Combat Methods ---
  getArmorValue(): number { return this.combatManager.getArmorValue(); }
  getMainWeapon(): Weapon | RangedWeapon { return this.combatManager.getMainWeapon(); }
  hasRangedWeapon(): boolean { return this.combatManager.hasRangedWeapon(); }
  hasShield(): boolean { return this.combatManager.hasShield(); }
  getAttackBonus(): number { return this.combatManager.getAttackBonus(); }
  getWeaponDamage(): number { return this.combatManager.getWeaponDamage(); }
  getAttackRange(): number { return this.combatManager.getAttackRange(); }
  getMaxAttackRange(): number { return this.combatManager.getMaxAttackRange(); }
  getZoneOfControlRange(): number { return this.combatManager.getZoneOfControlRange(); }

  // --- Skill Management ---

  /**
   * Get all skills the creature has
   */
  getSkills(): Skill[] {
    return this.skills;
  }

  /**
   * Check if the creature has a specific skill
   */
  hasSkill(skillName: string): boolean {
    return Object.values(this.skills).some(skill =>
      skill.name.toLowerCase() === skillName.toLowerCase()
    );
  }

  /**
   * Get skills of a specific type
   */
  getSkillsByType(type: string): Skill[] {
    return Object.values(this.skills).filter(skill => skill.type === type);
  }

  /**
   * Get a summary of all skill effects
   */
  getSkillEffectsSummary(): string[] {
    const effects: string[] = [];

    for (const skill of Object.values(this.skills)) {
      if (skill.attributeModifiers) {
        for (const modifier of skill.attributeModifiers) {
          const sign = modifier.value >= 0 ? "+" : "";
          effects.push(`${skill.name}: ${sign}${modifier.value} ${modifier.attribute}`);
        }
      }
    }

    return effects;
  }

  // --- Combat State Management ---
  // Combat state is now managed at the group level
  getCombatState(): boolean {
    return this.group.isInCombat();
  }

  // Get all enemies within combat range (12 tiles)
  getEnemiesInCombatRange(allCreatures: ICreature[]): ICreature[] {
    const hostileCreatures = this.getHostileCreatures(allCreatures);

    return hostileCreatures.filter(enemy => {
      if (this.x === undefined || this.y === undefined || enemy.x === undefined || enemy.y === undefined) {
        return false;
      }
      const distance = calculateDistanceBetween(this.x, this.y, enemy.x, enemy.y);
      return distance <= 12;
    });
  }

  // --- Position Methods ---
  getFacingDegrees(): number | undefined { return this.positionManager.getFacingDegrees(); }
  getFacingArrow(): string | undefined { return this.positionManager.getFacingArrow(); }
  getFacingName(): string | undefined { return this.positionManager.getFacingName(); }
  getFacingShortName(): string | undefined { return this.positionManager.getFacingShortName(); }
  faceDirection(direction: number): void { this.positionManager.faceDirection(direction); }
  faceTowards(targetX: number, targetY: number): void { this.positionManager.faceTowards(targetX, targetY); }
  getDimensions(): { w: number; h: number } { return this.positionManager.getDimensions(this.size); }

  // --- Relationship Methods ---
  isPlayerControlled(): boolean { return this.relationshipsManager.isPlayerControlled(); }
  isAIControlled(): boolean { return this.relationshipsManager.isAIControlled(); }
  isHostileTo(other: ICreature): boolean { return this.relationshipsManager.isHostileTo(other.group); }
  isFriendlyTo(other: ICreature): boolean { return this.relationshipsManager.isFriendlyTo(other.group); }

  // --- State Modifiers ---
  takeDamage(damage: number): number {
    const takenDamage = this.stateManager.takeDamage(damage);
    this.updateWoundedStatus();
    if (this.isDead()) {
      this.removeAllStatusEffects();
    }
    return takenDamage;
  }
  useMovement(points: number): void { this.stateManager.useMovement(points); }
  useAction(): void { this.stateManager.useAction(); }
  canUseQuickAction(): boolean { return this.stateManager.canUseQuickAction(); }
  useQuickAction(): void { this.stateManager.useQuickAction(); }
  useMana(amount: number): boolean { return this.stateManager.useMana(amount); }
  setMovedWhileEngaged(value: boolean): void { this.stateManager.setMovedWhileEngaged(value); }
  setRemainingMovement(value: number): void { this.stateManager.setRemainingMovement(value); }
  setRemainingActions(value: number): void { this.stateManager.setRemainingActions(value); }
  setRemainingQuickActions(value: number): void { this.stateManager.setRemainingQuickActions(value); }

  canAct(): boolean {
    return this.isAlive() && (
      this.remainingActions > 0 ||
      this.remainingQuickActions > 0 ||
      this.remainingMovement > 0
    );
  }

  performAction(action: CreatureAction, allCreatures: ICreature[]): { success: boolean, message: string } {
    switch(action) {
      case 'run':
        return this.run(allCreatures);
      case 'disengage':
        return this.disengage(allCreatures);
      case 'search':
        return this.search();
    }
  }

  private run(allCreatures: ICreature[]): { success: boolean, message: string } {
    if (!validateAction(this, 'run', allCreatures)) {
      return { success: false, message: '' };
    }

    this.useAction();
    this.running = true;
    const roll = calculateAttributeRoll(0);
    if (roll.fumble) {
      this.setRemainingMovement(Math.floor(this.remainingMovement / 2));
    } else {
      if (roll.total > this.effectiveMovement) {
        roll.total = this.effectiveMovement;
      }
      this.setRemainingMovement(this.remainingMovement + roll.total);
    }
    return { success: true, message: `${this.name} runs ${displayDiceRoll(roll.dice)}${roll.fumble ? ' (Fumble)' : ''}` };
  }

  private disengage(allCreatures: ICreature[]): { success: boolean, message: string } {
    if (!validateAction(this, 'disengage', allCreatures)) {
      return { success: false, message: '' };
    }
    this.endTurn();
    return { success: true, message: `${this.name} disengages` };
  }

  private search(): { success: boolean, message: string } {
    if (!validateAction(this, 'search', [])) {
      return { success: false, message: '' };
    }

    // Use an action to search (could reveal hidden items, traps, or enemies)
    this.useAction();

    return { success: true, message: `${this.name} searches` };
  }

  performAttributeTest(attributeName: keyof Attributes, modifier: number = 0): { success: boolean, modifier: number, total: number; dice: number[], fumble: boolean, criticalSuccess: boolean } {
    const attributeValue = this.getEffectiveAttribute(attributeName);
    const totalModifier = attributeValue + modifier;
    const testResult = calculateAttributeRoll(totalModifier);
    if (testResult.fumble) {
      return { success: false, modifier: totalModifier, ...testResult };
    }
    if (testResult.total >= 10) {
      return { success: true, modifier: totalModifier, ...testResult };
    }
    return { success: false, modifier: totalModifier, ...testResult };
  }

  startTurn(): string[] {
    this.running = false;
    this.stateManager.startTurn();

    const messages: string[] = [];

    // Process status effects at turn start
    this.statusEffectManager.updateEffects();

    // Apply turn-start effects
    const activeEffects = this.statusEffectManager.getActiveEffects();
    activeEffects.forEach(effect => {
      if (effect.onTurnStart) {
        messages.push(...effect.onTurnStart(this));
      }
    });

    return messages;
  }

  endTurn(): void {
    // Reset turn state first
    this.stateManager.endTurn();
  }

  recordTurnEndPosition(): void {
    this.stateManager.recordTurnStartPosition(this.positionManager.getPosition());
  }
  resetRemainingActions(): void { this.stateManager.resetRemainingActions(); }

  // --- Zone of Control ---
  isInZoneOfControl(x: number, y: number): boolean {
    if (this.x === undefined || this.y === undefined) return false;
    return this.combatManager.isInZoneOfControl(x, y, this.x, this.y);
  }

  // --- Creature Filtering ---
  getHostileCreatures(allCreatures: ICreature[]): ICreature[] { return this.relationshipsManager.getHostileCreatures(allCreatures); }
  getFriendlyCreatures(allCreatures: ICreature[]): ICreature[] { return this.relationshipsManager.getFriendlyCreatures(allCreatures); }

  // --- Turn Start Position ---
  get turnStartX(): number | undefined { return this.stateManager.getTurnStartPosition()?.x; }
  get turnStartY(): number | undefined { return this.stateManager.getTurnStartPosition()?.y; }
  get turnStartFacing(): number | undefined { return this.stateManager.getTurnStartPosition()?.facing; }

  wasBehindTargetAtTurnStart(target: ICreature): boolean {
    if (target.x === undefined || target.y === undefined || target.facing === undefined ||
      this.turnStartX === undefined || this.turnStartY === undefined) {
      return false;
    }
    return this.combatManager.wasBehindTargetAtTurnStart(
      target.x, target.y, target.facing, this.turnStartX, this.turnStartY
    );
  }

  // --- Movement and Combat Delegation ---
  getReachableTiles(allCreatures: ICreature[], mapDefinition: QuestMap, cols: number, rows: number): PathfindingResult {
    return creatureServices.getMovementService().getReachableTiles(this, allCreatures, mapDefinition, cols, rows);
  }

  moveTo(path: Array<{ x: number; y: number }>, allCreatures: ICreature[] = [], mapDefinition?: QuestMap): MovementResult {
    if (!this.positionManager) {
      return { 
        status: 'failed', 
        message: 'No position manager',
        cost: 0,
        tilesMoved: 0,
        totalPathLength: 0
      };
    }
    if(this.positionManager.getX() === undefined || this.positionManager.getY() === undefined) {
      path = [path[0], ...path];
    }
    return creatureServices.getMovementService().moveTo(this, path, allCreatures, mapDefinition);
  }

  attack(target: ICreature, allCreatures: ICreature[] = [], mapDefinition?: QuestMap): CombatResult {
    if (this.x === undefined || this.y === undefined) {
      return { success: false, damage: 0, targetDefeated: false, messages: ["Creature is not on the map"] };
    }
    const result = creatureServices.getCombatExecutor().executeCombat(this, target, allCreatures, mapDefinition);

    return {
      success: result.success,
      damage: result.damage,
      targetDefeated: result.targetDefeated,
      messages: result.messages
    };
  }

  // --- Skills ---
  getSkill(skillName: string): Skill | undefined {
    return this.skills.find(skill => skill.name === skillName);
  }

  getAllSkills(): Skill[] {
    return this.skills;
  }

  // --- Status Effects ---
  getStatusEffectManager(): CreatureStatusEffectManager {
    return this.statusEffectManager;
  }

  addStatusEffect(effect: StatusEffect): void {
    this.statusEffectManager.addEffect(effect);
  }

  removeStatusEffect(effectId: string): void {
    this.statusEffectManager.removeEffect(effectId);
  }

  removeAllStatusEffects(): void {
    this.statusEffectManager.clearAllEffects();
  }

  hasStatusEffect(type: StatusEffectType): boolean {
    return this.statusEffectManager.hasEffect(type);
  }

  getStatusEffect(type: StatusEffectType): StatusEffect | null {
    return this.statusEffectManager.getEffect(type);
  }

  getActiveStatusEffects(): StatusEffect[] {
    return this.statusEffectManager.getActiveEffects();
  }

  // --- Health Management ---
  heal(amount: number): void {
    const newVitality = Math.min(this.remainingVitality + amount, this.vitality);
    this.stateManager.setRemainingVitality(newVitality);
    this.updateWoundedStatus();
  }

  restoreMana(amount: number): void {
    const newMana = Math.min(this.remainingMana + amount, this.mana);
    this.stateManager.setRemainingMana(newMana);
  }

  private updateWoundedStatus(): void {
    const remainingVitality = this.stateManager.getState().remainingVitality;
    let wounded = false;
    if (remainingVitality > 0) {
      if (this.size < 4) {
        if (remainingVitality <= 1) {
          wounded = true;
        }
      } else {
        if (remainingVitality <= 5) {
          wounded = true;
        }
      }
    }
    if (wounded) {
      this.addStatusEffect(STATUS_EFFECT_PRESETS.wounded.createEffect());
    } else {
      this.removeStatusEffect("wounded");
    }
  }

  // --- Cloning ---
  clone(overrides?: Partial<Creature>): Creature {
    const params = {
      id: this.id,
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
      skills: { ...this.skills },
      running: this.running,
      ...overrides
    };

    // Use abstract method to create the appropriate instance
    return this.createInstance(params);
  }

  // --- Abstract Factory Method ---
  protected abstract createInstance(params: CreatureConstructorParams): Creature;

  /**
   * Generic method to get effective value with status effect modifiers
   */
  private getEffectiveValue(
    baseValue: number,
    modifierType: 'actionModifier' | 'quickActionModifier' | 'movementModifier'
  ): number {
    const statusEffects = this.getActiveStatusEffects();
    let effectiveValue = baseValue;

    for (const effect of statusEffects) {
      const modifier = effect[modifierType];
      if (modifier) {
        effectiveValue += modifier;
      }
    }

    return Math.max(0, effectiveValue);
  }

  // Get effective actions and quick actions with status effect modifiers
  get effectiveActions(): number {
    return this.getEffectiveValue(this.actions, 'actionModifier');
  }

  get effectiveQuickActions(): number {
    return this.getEffectiveValue(this.quickActions, 'quickActionModifier');
  }

  // Get effective movement with status effect modifiers
  get effectiveMovement(): number {
    return this.getEffectiveAttribute('movement');
  }

  /**
   * Get the effective value of an attribute considering skill modifiers and status effects
   */
  private getEffectiveAttribute(attributeName: keyof Attributes): number {
    return SkillProcessor.getEffectiveAttribute(
      this.attributes[attributeName] ?? 0,
      attributeName,
      this.skills,
      this.getActiveStatusEffects()
    );
  }
}
