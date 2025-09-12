import { StatusEffect } from "../statusEffects";
import { DamageAttack } from "../utils/combat/execution";

export type SpellType = "projectile" | "damage" | "control" | "protection" | "enhancement" | "healing";
export type TargetType = "self" | "ally" | "enemy" | "ground";

export class SpellEffect {
  readonly damage?: DamageAttack;
  readonly aoeDamage?: DamageAttack;
  readonly heal?: number;
  readonly areaOfEffect?: number;
  readonly statusEffect?: StatusEffect;
}

export class Spell {
  readonly name: string;
  readonly type: SpellType;
  readonly archMage?: boolean;
  readonly range: number;
  readonly cost: number;
  readonly targetType: TargetType;
  readonly effect: SpellEffect;

  constructor(params: { name: string, type: SpellType, archMage?: boolean, range: number, cost?: number, targetType: TargetType, effect: SpellEffect }) {
    this.name = params.name;
    this.type = params.type;
    this.archMage = params.archMage;
    this.range = params.range;
    this.cost = params.cost ?? 1;
    this.targetType = params.targetType;
    this.effect = params.effect;
  }
}