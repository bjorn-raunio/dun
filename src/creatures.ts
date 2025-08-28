import { Item, Weapon, RangedWeapon, Armor, Shield, createWeapon, createRangedWeapon, createArmor, createShield } from './items';

// --- Base Creature Class ---
export abstract class Creature {
  id: string;
  name: string;
  x: number;
  y: number;
  image?: string;
  movement: number;
  remainingMovement: number;
  attacks: number;
  remainingAttacks: number;
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
  combat: number;
  ranged: number;
  strength: number;
  agility: number;
  vitality: number;
  naturalArmor: number;

  constructor(params: {
    id: string;
    name: string;
    x: number;
    y: number;
    image?: string;
    movement: number;
    attacks: number;
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
    combat: number;
    ranged: number;
    strength: number;
    agility: number;
    vitality: number;
    naturalArmor?: number;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.x = params.x;
    this.y = params.y;
    this.image = params.image;
    this.movement = params.movement;
    this.remainingMovement = params.movement;
    this.attacks = params.attacks;
    this.remainingAttacks = params.attacks;
    this.mapWidth = params.mapWidth ?? 1;
    this.mapHeight = params.mapHeight ?? 1;
    this.size = params.size;
    this.facing = params.facing ?? 0; // Default facing North
    this.inventory = params.inventory ?? [];
    this.equipment = params.equipment ?? {};
    this.combat = params.combat;
    this.ranged = params.ranged;
    this.strength = params.strength;
    this.agility = params.agility;
    this.vitality = params.vitality;
    this.naturalArmor = params.naturalArmor ?? 3;
  }

  // Get the creature's kind (implemented by subclasses)
  abstract get kind(): "hero" | "monster";

  // Check if creature is alive
  isAlive(): boolean {
    return this.vitality > 0;
  }

  // Check if creature is dead
  isDead(): boolean {
    return this.vitality <= 0;
  }

  // Check if creature has moved this turn
  hasMoved(): boolean {
    return this.remainingMovement !== this.movement;
  }

  // Check if creature has attacks remaining
  hasAttacksRemaining(): boolean {
    return this.remainingAttacks > 0;
  }

  // Get current armor value (equipped armor or natural armor)
  getArmorValue(): number {
    return this.equipment.armor?.armor ?? this.naturalArmor;
  }

  // Get main weapon (prioritizes main hand, then off hand)
  getMainWeapon(): Weapon | RangedWeapon | undefined {
    if (this.equipment.mainHand instanceof Weapon || this.equipment.mainHand instanceof RangedWeapon) {
      return this.equipment.mainHand;
    }
    if (this.equipment.offHand instanceof Weapon || this.equipment.offHand instanceof RangedWeapon) {
      return this.equipment.offHand;
    }
    return undefined;
  }

  // Check if creature has a ranged weapon equipped
  hasRangedWeapon(): boolean {
    return this.equipment.mainHand instanceof RangedWeapon || 
           this.equipment.offHand instanceof RangedWeapon;
  }

  // Get attack bonus based on weapon type
  getAttackBonus(): number {
    return this.hasRangedWeapon() ? this.ranged : this.combat;
  }

  // Get weapon damage
  getWeaponDamage(): number {
    const weapon = this.getMainWeapon();
    return weapon ? (weapon as any).damage as number : 1;
  }

  // Get attack range
  getAttackRange(): number {
    const main = this.equipment.mainHand;
    const offHand = this.equipment.offHand;
    
    if (main instanceof Weapon) {
      return Math.max(1, main.reach ?? 1);
    } else if (main instanceof RangedWeapon) {
      return Math.max(1, main.range.normal);
    } else if (offHand instanceof RangedWeapon) {
      return Math.max(1, offHand.range.normal);
    }
    
    return 1; // Default melee range
  }

  // Take damage and return new vitality
  takeDamage(damage: number): number {
    this.vitality = Math.max(0, this.vitality - damage);
    return this.vitality;
  }

  // Reset movement and attacks for new turn
  resetTurn(): void {
    this.remainingMovement = this.movement;
    this.remainingAttacks = this.attacks;
  }

  // Move to new position
  moveTo(x: number, y: number): void {
    // Face the direction of movement
    if (x !== this.x || y !== this.y) {
      this.faceTowards(x, y);
    }
    this.x = x;
    this.y = y;
  }

  // Use movement points
  useMovement(points: number): void {
    this.remainingMovement = Math.max(0, this.remainingMovement - points);
  }

  // Use attack
  useAttack(): void {
    if (this.remainingAttacks > 0) {
      this.remainingAttacks--;
    }
  }

  // Roll 2d6 for combat
  private roll2d6(): number {
    return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  }

  // Roll Xd6 for damage calculation
  private rollXd6(count: number): number[] {
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * 6) + 1);
    }
    return results;
  }

  // Calculate melee damage using Xd6 system
  private calculateMeleeDamage(attackerStrength: number, weaponDamage: number, defenderArmor: number): { damage: number; rolls: number[]; hits: number } {
    const totalDice = attackerStrength + weaponDamage;
    const rolls = this.rollXd6(totalDice);
    const hits = rolls.filter(roll => roll >= defenderArmor).length;
    return { damage: hits, rolls, hits };
  }

  // Perform an attack against a target creature
  attack(target: Creature): { hit: boolean; damage: number; message: string; targetDefeated: boolean } {
    // Face the target when attacking
    this.faceTowards(target.x, target.y);
    
    // Check if we have attacks remaining
    if (!this.hasAttacksRemaining()) {
      return {
        hit: false,
        damage: 0,
        message: `${this.name} has no attacks remaining.`,
        targetDefeated: false
      };
    }

    // Determine weapon and attack bonus
    const isRanged = this.hasRangedWeapon();
    const atkBonus = this.getAttackBonus();
    const weaponDamage = this.getWeaponDamage();

    // 2d6 combat system
    const attackerRoll = this.roll2d6();
    const defenderRoll = this.roll2d6();
    const attackerTotal = attackerRoll + atkBonus;
    const defenderTotal = defenderRoll + target.combat;
    const hit = attackerTotal > defenderTotal;

    let damageDealt = 0;
    let damageDetails = "";
    let targetDefeated = false;

    if (hit) {
      if (!isRanged) {
        // Melee attack - calculate damage using Xd6 system
        const defenderArmor = target.getArmorValue();
        const damageResult = this.calculateMeleeDamage(this.strength, weaponDamage, defenderArmor);
        damageDealt = damageResult.damage;
        damageDetails = ` Damage: ${damageResult.damage} (${this.strength}+${weaponDamage}=${this.strength + weaponDamage}d6: [${damageResult.rolls.join(',')}] vs armor ${defenderArmor} = ${damageResult.hits} hits).`;
      } else {
        // Ranged attack - simple damage
        damageDealt = weaponDamage;
        damageDetails = ` Damage: ${weaponDamage}.`;
      }

      // Apply damage to target
      const newVitality = target.takeDamage(damageDealt);
      targetDefeated = newVitality === 0;
    }

    // Use the attack
    this.useAttack();

    // Build combat message
    const message = `${this.name} attacks ${target.name}: 2d6 ${attackerRoll} + ${atkBonus} = ${attackerTotal} vs 2d6 ${defenderRoll} + ${target.combat} = ${defenderTotal} → ${hit ? "HIT" : "MISS"}.${damageDetails}`;

    return {
      hit,
      damage: damageDealt,
      message,
      targetDefeated
    };
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
    const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
    return arrows[this.facing];
  }

  // Get facing direction as name
  getFacingName(): string {
    const names = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    return names[this.facing];
  }

  // Get facing direction as short name
  getFacingShortName(): string {
    const names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return names[this.facing];
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
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      image: this.image,
      movement: this.movement,
      attacks: this.attacks,
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      size: this.size,
      facing: this.facing,
      inventory: [...this.inventory],
      equipment: { ...this.equipment },
      combat: this.combat,
      ranged: this.ranged,
      strength: this.strength,
      agility: this.agility,
      vitality: this.vitality,
      naturalArmor: this.naturalArmor,
      ...overrides
    };

    if (this instanceof Hero) {
      return new Hero(params);
    } else if (this instanceof Monster) {
      return new Monster(params);
    }
    
    throw new Error("Unknown creature type");
  }
}

// --- Hero Class ---
export class Hero extends Creature {
  get kind(): "hero" {
    return "hero";
  }

  constructor(params: {
    id: string;
    name: string;
    x: number;
    y: number;
    image?: string;
    movement: number;
    attacks: number;
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
    combat: number;
    ranged: number;
    strength: number;
    agility: number;
    vitality: number;
    naturalArmor?: number;
  }) {
    super(params);
  }

  // Hero-specific methods can be added here
  // For example: special abilities, experience, leveling, etc.
}

// --- Monster Class ---
export class Monster extends Creature {
  get kind(): "monster" {
    return "monster";
  }

  constructor(params: {
    id: string;
    name: string;
    x: number;
    y: number;
    image?: string;
    movement: number;
    attacks: number;
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
    combat: number;
    ranged: number;
    strength: number;
    agility: number;
    vitality: number;
    naturalArmor?: number;
  }) {
    super(params);
  }

  // Monster-specific methods can be added here
  // For example: AI behavior, special abilities, etc.
}

// --- Monster Presets and Factory Functions ---
export type MonsterPreset = {
  name: string;
  image: string;
  movement: number;
  attacks: number;
  mapWidth?: number;
  mapHeight?: number;
  size: number; // 1=small, 2=medium, 3=large, 4=huge
  facing?: number; // 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
  inventory?: Array<{ type: "weapon" | "ranged_weapon" | "armor" | "shield"; preset: string; id?: string }>;
  equipment?: {
    mainHand?: { type: "weapon" | "ranged_weapon"; preset: string; id?: string };
    offHand?: { type: "weapon" | "ranged_weapon" | "shield"; preset: string; id?: string };
    armor?: { type: "armor"; preset: string; id?: string };
  };
  combat: number;
  ranged: number;
  strength: number;
  agility: number;
  vitality: number;
  naturalArmor?: number;
};

export const monsterPresets: Record<string, MonsterPreset> = {
  bandit: {
    name: "Bandit",
    image: "creature_bandit.png",
    movement: 6,
    attacks: 1,
    size: 2, // medium
    facing: 0, // North
    inventory: [
      { type: "weapon", preset: "scimitar" },
      { type: "armor", preset: "leather" }
    ],
    equipment: {
      mainHand: { type: "weapon", preset: "dagger" },
      armor: { type: "armor", preset: "leather" }
    },
    combat: 3,
    ranged: 1,
    strength: 2,
    agility: 3,
    vitality: 4,
    naturalArmor: 3,
  },
  goblin: {
    name: "Goblin",
    image: "creature_bandit.png", // Using bandit image as placeholder
    movement: 7,
    attacks: 1,
    size: 1, // small
    facing: 0, // North
    inventory: [
      { type: "weapon", preset: "dagger" }
    ],
    equipment: {
      mainHand: { type: "weapon", preset: "dagger" }
    },
    combat: 2,
    ranged: 1,
    strength: 1,
    agility: 4,
    vitality: 3,
    naturalArmor: 2,
  },
  orc: {
    name: "Orc",
    image: "creature_knight.png", // Using knight image as placeholder
    movement: 6,
    attacks: 1,
    size: 2, // medium
    facing: 0, // North
    inventory: [
      { type: "weapon", preset: "broadsword" },
      { type: "armor", preset: "leather" }
    ],
    equipment: {
      mainHand: { type: "weapon", preset: "broadsword" },
      armor: { type: "armor", preset: "leather" }
    },
    combat: 4,
    ranged: 1,
    strength: 3,
    agility: 2,
    vitality: 5,
    naturalArmor: 3,
  },
};

export function createMonster(presetId: string, overrides?: Partial<Monster> & { id: string; x: number; y: number }): Monster {
  const p = monsterPresets[presetId];
  if (!p) {
    throw new Error(`Monster preset "${presetId}" not found`);
  }

  // Create inventory items
  const inventory: Item[] = [];
  if (p.inventory) {
    for (const itemDef of p.inventory) {
      const itemId = itemDef.id ?? `${itemDef.type}-${Math.random().toString(36).slice(2, 8)}`;
      switch (itemDef.type) {
        case "weapon":
          inventory.push(createWeapon(itemDef.preset, { id: itemId }));
          break;
        case "ranged_weapon":
          inventory.push(createRangedWeapon(itemDef.preset, { id: itemId }));
          break;
        case "armor":
          inventory.push(createArmor(itemDef.preset, { id: itemId }));
          break;
        case "shield":
          inventory.push(createShield(itemDef.preset, { id: itemId }));
          break;
      }
    }
  }

  // Create equipment
  const equipment: Monster["equipment"] = {};
  if (p.equipment) {
    if (p.equipment.mainHand) {
      const itemId = p.equipment.mainHand.id ?? `${p.equipment.mainHand.type}-${Math.random().toString(36).slice(2, 8)}`;
      if (p.equipment.mainHand.type === "weapon") {
        equipment.mainHand = createWeapon(p.equipment.mainHand.preset, { id: itemId });
      } else if (p.equipment.mainHand.type === "ranged_weapon") {
        equipment.mainHand = createRangedWeapon(p.equipment.mainHand.preset, { id: itemId });
      }
    }
    if (p.equipment.offHand) {
      const itemId = p.equipment.offHand.id ?? `${p.equipment.offHand.type}-${Math.random().toString(36).slice(2, 8)}`;
      if (p.equipment.offHand.type === "weapon") {
        equipment.offHand = createWeapon(p.equipment.offHand.preset, { id: itemId });
      } else if (p.equipment.offHand.type === "ranged_weapon") {
        equipment.offHand = createRangedWeapon(p.equipment.offHand.preset, { id: itemId });
      } else if (p.equipment.offHand.type === "shield") {
        equipment.offHand = createShield(p.equipment.offHand.preset, { id: itemId });
      }
    }
    if (p.equipment.armor) {
      const itemId = p.equipment.armor.id ?? `armor-${Math.random().toString(36).slice(2, 8)}`;
      equipment.armor = createArmor(p.equipment.armor.preset, { id: itemId });
    }
  }

  return new Monster({
    id: overrides?.id ?? `${presetId}-${Math.random().toString(36).slice(2, 8)}`,
    name: overrides?.name ?? p.name,
    x: overrides?.x ?? 0,
    y: overrides?.y ?? 0,
    image: overrides?.image ?? p.image,
    movement: overrides?.movement ?? p.movement,
    attacks: overrides?.attacks ?? p.attacks,
    mapWidth: overrides?.mapWidth ?? p.mapWidth ?? 1,
    mapHeight: overrides?.mapHeight ?? p.mapHeight ?? 1,
    size: overrides?.size ?? p.size,
    facing: overrides?.facing ?? p.facing ?? 0,
    inventory: overrides?.inventory ?? inventory,
    equipment: overrides?.equipment ?? equipment,
    combat: overrides?.combat ?? p.combat,
    ranged: overrides?.ranged ?? p.ranged,
    strength: overrides?.strength ?? p.strength,
    agility: overrides?.agility ?? p.agility,
    vitality: overrides?.vitality ?? p.vitality,
    naturalArmor: overrides?.naturalArmor ?? p.naturalArmor ?? 3,
  });
}

// Type alias for union type
export type CreatureInstance = Hero | Monster;
