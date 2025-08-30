import { Item, Weapon, RangedWeapon, Armor, Shield } from '../items';
import { EquipmentSystem } from '../items/equipment';
import { calculateDistance, isInBackArc } from '../utils/geometry';
import { DIRECTION_ARROWS, DIRECTION_NAMES, DIRECTION_SHORT_NAMES } from '../utils/constants';

// --- Attributes System ---
export interface Attributes {
  movement: number;
  combat: number;
  ranged: number;
  strength: number;
  agility: number;
  courage: number;
  intelligence: number;
}

// --- Group System ---
export type CreatureGroup = "hero" | "enemy" | "neutral";

export const CREATURE_GROUPS = {
  HERO: "hero" as const,
  ENEMY: "enemy" as const,
  NEUTRAL: "neutral" as const,
} as const;

// --- ID Generation ---
let creatureIdCounter = 0;
export function generateCreatureId(): string {
  return `creature-${++creatureIdCounter}`;
}

// --- Base Creature Class ---
export abstract class Creature {
  id: string;
  name: string;
  x: number;
  y: number;
  image?: string;
  attributes: Attributes;
  remainingMovement: number;
  actions: number;
  remainingActions: number;
  quickActions: number;
  remainingQuickActions: number;
  mapWidth: number;
  mapHeight: number;
  size: number; // 1=small, 2=medium, 3=large, 4=huge
  facing: number; // 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
  inventory: Item[];
  equipment: {
    mainHand?: Weapon | RangedWeapon;
    offHand?: Weapon | RangedWeapon | Shield;
    armor?: Armor;
  };
  vitality: number;
  mana: number;
  remainingMana: number;
  fortune: number;
  remainingVitality: number;
  naturalArmor: number;
  hasMovedWhileEngaged: boolean; // Track if creature has moved while engaged this turn
  group: CreatureGroup; // Which group this creature belongs to

  // New properties for turn start position tracking
  turnStartX: number;
  turnStartY: number;
  turnStartFacing: number;

  constructor(params: {
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
    size: number; // 1=small, 2=medium, 3=large, 4=huge
    facing?: number; // 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
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
  }) {
    this.id = params.id ?? generateCreatureId();
    this.name = params.name;
    this.x = params.x;
    this.y = params.y;
    this.image = params.image;
    this.attributes = params.attributes;
    this.remainingMovement = params.attributes.movement;
    this.actions = params.actions;
    this.remainingActions = params.actions;
    this.quickActions = params.quickActions ?? 1;
    this.remainingQuickActions = params.quickActions ?? 1;
    this.mapWidth = params.mapWidth ?? 1;
    this.mapHeight = params.mapHeight ?? 1;
    this.size = params.size;
    this.facing = params.facing ?? 0; // Default facing North
    this.inventory = params.inventory ?? [];
    this.equipment = params.equipment ?? {};
    this.vitality = params.vitality;
    this.mana = params.mana;
    this.remainingMana = params.mana; // Initialize remainingMana to full mana
    this.fortune = params.fortune;
    this.remainingVitality = params.vitality; // Initialize remainingVitality to full vitality
    this.naturalArmor = params.naturalArmor ?? 3;
    this.hasMovedWhileEngaged = false;
    this.group = params.group;

    // Initialize new properties
    this.turnStartX = this.x;
    this.turnStartY = this.y;
    this.turnStartFacing = this.facing;
  }

  // Getter methods for backward compatibility
  get movement(): number { return this.getEffectiveAttribute(this.attributes.movement); }
  get combat(): number { return this.getEffectiveAttribute(this.attributes.combat); }
  get ranged(): number { return this.getEffectiveAttribute(this.attributes.ranged); }
  get strength(): number { return this.getEffectiveAttribute(this.attributes.strength); }
  get agility(): number { return this.getEffectiveAttribute(this.attributes.agility); }
  get courage(): number { return this.getEffectiveAttribute(this.attributes.courage); }
  get intelligence(): number { return this.getEffectiveAttribute(this.attributes.intelligence); }

  // Setter methods for backward compatibility
  set movement(value: number) { this.attributes.movement = value; }
  set combat(value: number) { this.attributes.combat = value; }
  set ranged(value: number) { this.attributes.ranged = value; }
  set strength(value: number) { this.attributes.strength = value; }
  set agility(value: number) { this.attributes.agility = value; }
  set courage(value: number) { this.attributes.courage = value; }
  set intelligence(value: number) { this.attributes.intelligence = value; }

  // Get the creature's kind (implemented by subclasses)
  abstract get kind(): "hero" | "monster" | "mercenary";

  // Check if creature is alive
  isAlive(): boolean {
    return this.remainingVitality > 0;
  }

  // Check if creature is dead
  isDead(): boolean {
    return this.remainingVitality <= 0;
  }

  // Check if creature is wounded based on size and vitality
  isWounded(): boolean {
    if (this.size < 4) {
      // Creatures with size less than 4 are wounded when they have 1 or less remaining vitality
      return this.remainingVitality <= 1;
    } else {
      // Creatures with size 4 are wounded when they have 5 or less remaining vitality
      return this.remainingVitality <= 5;
    }
  }

  // Get effective attribute value considering wounded status
  private getEffectiveAttribute(baseValue: number): number {
    return this.isWounded() ? Math.max(1, baseValue - 1) : baseValue;
  }

  // Check if creature has moved this turn
  hasMoved(): boolean {
    // Dead creatures cannot have moved
    if (this.isDead()) {
      return false;
    }
    return this.remainingMovement !== this.movement;
  }

  // Check if creature has actions remaining
  hasActionsRemaining(): boolean {
    // Dead creatures cannot have actions remaining
    if (this.isDead()) {
      return false;
    }
    return this.remainingActions > 0;
  }

  // Get current armor value (equipped armor or natural armor)
  getArmorValue(): number {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getEffectiveArmor(this.naturalArmor);
  }

  // Get main weapon (prioritizes main hand, then off hand)
  getMainWeapon(): Weapon | RangedWeapon | undefined {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getMainWeapon();
  }

  // Check if creature has a ranged weapon equipped
  hasRangedWeapon(): boolean {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.hasRangedWeapon();
  }

  // Check if creature has a shield equipped
  hasShield(): boolean {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.hasShield();
  }

  // Get attack bonus based on weapon type
  getAttackBonus(): number {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getAttackBonus(this.combat, this.ranged);
  }

  // Get weapon damage
  getWeaponDamage(): number {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getWeaponDamage();
  }

  // Get attack range
  getAttackRange(): number {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getAttackRange();
  }

  getMaxAttackRange(): number {
    const equipment = new EquipmentSystem(this.equipment);
    return equipment.getMaxAttackRange();
  }

  // Get zone of control range (default is 1 tile around the creature)
  getZoneOfControlRange(): number {
    return 1; // Can be overridden by subclasses for different creature types
  }

  // Check if a position is within this creature's zone of control
  isInZoneOfControl(x: number, y: number): boolean {
    const distance = calculateDistance(this.x, this.y, x, y, 'chebyshev');
    return distance <= this.getZoneOfControlRange();
  }

  // Get hostile creatures (opposite kind)
  getHostileCreatures(allCreatures: Creature[]): Creature[] {
    return allCreatures.filter(creature => 
      creature !== this && 
      creature.isAlive() && 
      creature.kind !== this.kind
    );
  }

  // --- Group System Methods ---

  // Check if this creature belongs to the hero group
  isHeroGroup(): boolean {
    return this.group === CREATURE_GROUPS.HERO;
  }

  // Check if this creature is player-controlled
  isPlayerControlled(): boolean {
    return this.isHeroGroup();
  }

  // Check if this creature is AI-controlled
  isAIControlled(): boolean {
    return !this.isPlayerControlled();
  }

  // Check if another creature is hostile to this creature
  isHostileTo(other: Creature): boolean {
    
    // Creatures of the same group are not hostile to each other
    if (this.group === other.group) {
      return false;
    }
    
    // All other groups are hostile to each other
    return true;
  }

  // Check if another creature is friendly to this creature
  isFriendlyTo(other: Creature): boolean {
    return !this.isHostileTo(other);
  }

  // Get all hostile creatures (from different groups)
  getHostileCreaturesByGroup(allCreatures: Creature[]): Creature[] {
    return allCreatures.filter(creature => 
      creature !== this && 
      creature.isAlive() && 
      this.isHostileTo(creature)
    );
  }

  // Get all friendly creatures (from same group)
  getFriendlyCreaturesByGroup(allCreatures: Creature[]): Creature[] {
    return allCreatures.filter(creature => 
      creature !== this && 
      creature.isAlive() && 
      this.isFriendlyTo(creature)
    );
  }

  // Check if this creature is engaged by any hostile creatures
  isEngaged(hostileCreatures: Creature[]): boolean {
    return this.getEngagingCreatures(hostileCreatures).length > 0;
  }

  // Get all creatures that are engaging this creature
  getEngagingCreatures(allCreatures: Creature[]): Creature[] {
    // Find all hostile creatures in our zone of control
    const hostileInZone = allCreatures.filter(creature => 
      creature !== this && 
      creature.isAlive() && 
      this.isHostileTo(creature) && // Must be hostile
      creature.isInZoneOfControl(this.x, this.y) // They are in our zone
    );
    
    // All hostile creatures in our zone of control engage us
    return hostileInZone;
  }

  // Check if a movement is allowed for an engaged creature
  canMoveToWhenEngaged(newX: number, newY: number, engagingCreatures: Creature[]): boolean {
    // If not engaged, movement is unrestricted
    if (engagingCreatures.length === 0) {
      return true;
    }

    // If engaged, can only move within the zone of control of engaging creatures
    const withinZoneOfControl = engagingCreatures.every(engager => 
      engager.isInZoneOfControl(newX, newY)
    );
    
    if (!withinZoneOfControl) {
      return false;
    }
    
    // If engaged, can only move one tile per round
    return !this.hasMovedWhileEngaged;
  }

  // Convenience method to check engagement status with all creatures
  isEngagedWithAll(allCreatures: Creature[]): boolean {
    const hostileCreatures = this.getHostileCreatures(allCreatures);
    return this.isEngaged(hostileCreatures);
  }

  // Get engaging creatures from all creatures
  getEngagingCreaturesFromAll(allCreatures: Creature[]): Creature[] {
    return this.getEngagingCreatures(allCreatures);
  }

  // Take damage and return new remainingVitality
  takeDamage(damage: number): number {
    this.remainingVitality = Math.max(0, this.remainingVitality - damage);
    return this.remainingVitality;
  }

  // Reset movement and actions for new turn
  resetTurn(): void {
    // If creature is dead, set movement, actions, and quick actions to 0
    if (this.isDead()) {
      this.remainingMovement = 0;
      this.remainingActions = 0;
      this.remainingQuickActions = 0;
    } else {
      this.remainingMovement = this.movement;
      this.remainingActions = this.actions;
      this.remainingQuickActions = this.quickActions;
    }
    this.remainingMana = this.mana; // Reset mana to full
    this.hasMovedWhileEngaged = false;
    
    // Record the position at the start of this turn
    this.recordTurnStartPosition();
  }
  
  // Record the current position as the turn start position
  recordTurnStartPosition(): void {
    this.turnStartX = this.x;
    this.turnStartY = this.y;
    this.turnStartFacing = this.facing;
  }
  
  // Check if this creature was behind the target at the start of their turn
  wasBehindTargetAtTurnStart(target: Creature): boolean {
    // Check if this creature was positioned in the back arc at turn start
    return isInBackArc(target.x, target.y, target.turnStartFacing, this.turnStartX, this.turnStartY);
  }

  // Use movement points
  useMovement(points: number): void {
    // Dead creatures cannot use movement
    if (this.isDead()) {
      return;
    }
    this.remainingMovement = Math.max(0, this.remainingMovement - points);
  }

  // Use action
  useAction(): void {
    // Dead creatures cannot use actions
    if (this.isDead()) {
      return;
    }
    if (this.remainingActions > 0) {
      this.remainingActions--;
    }
  }

  // Use quick action
  useQuickAction(): void {
    // Dead creatures cannot use quick actions
    if (this.isDead()) {
      return;
    }
    if (this.remainingQuickActions > 0) {
      this.remainingQuickActions--;
    }
  }

  // Use mana
  useMana(amount: number): boolean {
    if (this.remainingMana >= amount) {
      this.remainingMana -= amount;
      return true;
    }
    return false;
  }

  // Check if creature has enough mana
  hasMana(amount: number): boolean {
    return this.remainingMana >= amount;
  }

  // Check if creature has taken any actions this turn (moved or used actions)
  hasTakenActionsThisTurn(): boolean {
    // Dead creatures cannot have taken actions
    if (this.isDead()) {
      return false;
    }
    return this.hasMoved() || this.remainingActions < this.actions || this.remainingQuickActions < this.quickActions;
  }

  // Reset remaining movement and actions to 0 (for group-based turn management)
  resetRemainingActions(): void {
    this.remainingMovement = 0;
    this.remainingActions = 0;
    this.remainingQuickActions = 0;
  }

  // Reset other creatures in the same group when this creature acts
  resetGroupActions(allCreatures: Creature[]): void {
    const friendlyCreatures = this.getFriendlyCreaturesByGroup(allCreatures);
    
    // Reset remaining movement and actions for all friendly creatures that have already acted
    friendlyCreatures.forEach(creature => {
      if (creature.hasTakenActionsThisTurn()) {
        creature.resetRemainingActions();
      }
    });
  }

  // Get creature dimensions
  getDimensions(): { w: number; h: number } {
    if (this.size >= 3) { // large (3) or huge (4)
      return { w: 2, h: 2 };
    }
    return { w: 1, h: 1 };
  }

  // Get facing direction as degrees (for CSS transform)
  getFacingDegrees(): number {
    return this.facing * 45; // 0=0°, 1=45°, 2=90°, etc.
  }

  // Get facing direction as arrow character
  getFacingArrow(): string {
    return DIRECTION_ARROWS[this.facing as keyof typeof DIRECTION_ARROWS];
  }

  // Get facing direction as name
  getFacingName(): string {
    return DIRECTION_NAMES[this.facing as keyof typeof DIRECTION_NAMES];
  }

  // Get facing direction as short name
  getFacingShortName(): string {
    return DIRECTION_SHORT_NAMES[this.facing as keyof typeof DIRECTION_SHORT_NAMES];
  }

  // Change facing direction
  faceDirection(direction: number): void {
    this.facing = ((direction % 8) + 8) % 8; // Ensure 0-7 range
  }

  // Face towards a specific point
  faceTowards(targetX: number, targetY: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    
    if (dx === 0 && dy === 0) return; // Already at target
    
    // Calculate angle and convert to 8-direction facing
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const direction = Math.round((angle + 90) / 45) % 8; // +90 to align North=0
    this.faceDirection(direction);
  }

  // Clone creature (useful for creating variations)
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

    // Import dynamically to avoid circular dependencies
    const { Hero } = require('./hero');
    const { Monster } = require('./monster');
    const { Mercenary } = require('./mercenary');

    if (this instanceof Hero) {
      return new Hero(params);
    } else if (this instanceof Monster) {
      return new Monster(params);
    } else if (this instanceof Mercenary) {
      return new Mercenary(params);
    }
    
    throw new Error("Unknown creature type");
  }

  // Get reachable tiles (delegates to CreatureMovement)
  getReachableTiles(allCreatures: Creature[], mapData: { tiles: string[][] }, cols: number, rows: number, mapDefinition?: any): { tiles: Array<{x: number; y: number}>; costMap: Map<string, number>; pathMap: Map<string, Array<{x: number; y: number}>> } {
    const { CreatureMovement } = require('./movement');
    return CreatureMovement.getReachableTiles(this, allCreatures, mapData, cols, rows, mapDefinition);
  }

  // Move to new position through a path (delegates to CreatureMovement)
  moveTo(path: Array<{x: number; y: number}>, allCreatures: Creature[] = []): { success: boolean; message?: string } {
    const { CreatureMovement } = require('./movement');
    return CreatureMovement.moveTo(this, path, allCreatures);
  }

  // Attack target (delegates to executeCombat)
  attack(target: Creature, allCreatures: Creature[] = [], mapDefinition?: any): { hit: boolean; damage: number; message: string; targetDefeated: boolean; toHitMessage?: string; blockMessage?: string; damageMessage?: string } {
    const { executeCombat } = require('../utils/combatUtils');
    const result = executeCombat(this, target, allCreatures, mapDefinition);
    
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
}
