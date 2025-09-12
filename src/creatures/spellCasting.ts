import { ICreature } from './interfaces';
import { Spell, SpellSchool } from '../spells';
import { STATUS_EFFECT_PRESETS, StatusEffect } from '../statusEffects';
import { calculateDistanceBetween } from '../utils/pathfinding';
import { addGameMessage, addTurnMessage } from '../utils/messageSystem';
import { DiceRoll, displayDiceRoll, displayDiceSum, executeDamageRoll, isBackAttack, rollXd6 } from '../utils';
import { DamageAttack } from '../utils/combat/execution';

// --- Creature Spell Casting Management ---

export interface ICreatureSpellCastingManager {
  canCastSpell(spell: Spell, allCreatures?: ICreature[]): boolean;
  castSpell(spell: Spell, target?: ICreature, allCreatures?: ICreature[]): boolean;
  getKnownSpells(): Spell[];
  getSpellSchools(): SpellSchool[];
  hasSpell(spellName: string): boolean;
  getSpell(spellName: string): Spell | undefined;
  getValidTargets(spell: Spell, allCreatures: ICreature[]): ICreature[];
}

export class CreatureSpellCastingManager implements ICreatureSpellCastingManager {
  constructor(
    private creature: ICreature,
    private getKnownSpellsData: () => Spell[],
    private getSpellSchoolsData: () => SpellSchool[],
    private hasMana: (amount: number) => boolean,
    private hasActionsRemaining: () => boolean,
    private setRemainingMana: (amount: number) => void,
    private setRemainingActions: (amount: number) => void,
    private takeDamage: (amount: number) => void,
    private heal: (amount: number, removeStatusEffects: boolean) => void,
    private addStatusEffect: (effect: StatusEffect) => void
  ) { }

  /**
   * Check if the creature can cast a specific spell
   */
  canCastSpell(spell: Spell, allCreatures: ICreature[] = []): boolean {
    // Check if creature knows the spell
    if (!this.hasSpell(spell.name)) {
      return false;
    }

    // Check if creature has enough mana
    if (!this.hasMana(spell.cost)) {
      return false;
    }

    // Check if creature has actions remaining
    if (!this.hasActionsRemaining()) {
      return false;
    }

    // Check if creature is engaged (if allCreatures is provided)
    if (allCreatures.length > 0) {
      const { isEngaged } = require('../utils/zoneOfControl');
      if (isEngaged(this.creature, allCreatures)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Cast a spell on a target
   */
  castSpell(spell: Spell, target?: ICreature, allCreatures: ICreature[] = []): boolean {
    // Validate spell can be cast
    if (!this.canCastSpell(spell, allCreatures)) {
      // Check if it's specifically due to engagement
      if (allCreatures.length > 0) {
        const { isEngaged } = require('../utils/zoneOfControl');
        if (isEngaged(this.creature, allCreatures)) {
          const { VALIDATION_MESSAGES } = require('../validation/messages');
          addGameMessage(VALIDATION_MESSAGES.SPELL_CAST_WHILE_ENGAGED(this.creature.name));
          return false;
        }
      }
      addGameMessage(`${this.creature.name} cannot cast ${spell.name}`);
      return false;
    }

    // Validate target if required
    if (spell.targetType !== "self" && !target) {
      addGameMessage(`${this.creature.name} needs a target to cast ${spell.name}`);
      return false;
    }

    // Validate target type
    if (target && !this.isValidTarget(spell, target)) {
      addGameMessage(`${this.creature.name} cannot target ${target.name} with ${spell.name}`);
      return false;
    }

    // Check range if target is specified
    if (target && !this.isTargetInRange(spell, target)) {
      addGameMessage(`${target.name} is out of range for ${spell.name}`);
      return false;
    }

    // Consume action before attempting the spell (regardless of success/failure)
    this.setRemainingActions(this.creature.remainingActions - 1);

    let miscast = false;
    let roll = this.creature.performAttributeTest(this.creature.castsWithCourage() ? 'courage' : 'intelligence');
    if(roll.fumble) {
      addGameMessage(`${this.creature.name} miscasts ${spell.name}: ${displayDiceSum(roll, roll.modifier)}`);
      miscast = true;
    } else if (!roll.success) {
      addGameMessage(`${this.creature.name} fails to cast ${spell.name}: ${displayDiceSum(roll, roll.modifier)}`);
      return false;
    }

    // Consume mana only on successful cast
    this.setRemainingMana(this.creature.remainingMana - spell.cost);

    if(miscast) {
      let damageRoll = rollXd6(5);
      let damage = damageRoll.filter((roll) => roll >= this.creature.intelligence).length;
      addGameMessage(`${this.creature.name} takes ${damage} damage: ${displayDiceRoll(damageRoll)}`);
      this.creature.takeDamage(damage);
      this.creature.addStatusEffect(STATUS_EFFECT_PRESETS.stunned.createEffect());
      this.creature.endTurn();
      return false;
    }

    // Add turn message
    const targetName = this.creature.id === target?.id ? undefined : target?.name;
    addTurnMessage(`${this.creature.name} casts ${spell.name}${targetName ? ` on ${targetName}` : ''}: ${displayDiceSum(roll, roll.modifier)}`);

    // Apply spell effect
    this.applySpellEffect(spell, roll, target, allCreatures);


    return true;
  }

  /**
   * Get all known spells
   */
  getKnownSpells(): Spell[] {
    return [...this.getKnownSpellsData()];
  }

  /**
   * Get all spell schools
   */
  getSpellSchools(): SpellSchool[] {
    return [...this.getSpellSchoolsData()];
  }

  /**
   * Check if creature knows a specific spell
   */
  hasSpell(spellName: string): boolean {
    return this.getKnownSpellsData().some(spell => spell.name === spellName);
  }

  /**
   * Get a specific spell by name
   */
  getSpell(spellName: string): Spell | undefined {
    return this.getKnownSpellsData().find(spell => spell.name === spellName);
  }

  /**
   * Get valid targets for a spell
   */
  getValidTargets(spell: Spell, allCreatures: ICreature[]): ICreature[] {
    if (spell.targetType === "self") {
      return [this.creature];
    }

    return allCreatures.filter(creature => {
      if (!this.isTargetInRange(spell, creature)) return false;
      return this.isValidTarget(spell, creature);
    });
  }

  /**
   * Check if a target is valid for a spell
   */
  private isValidTarget(spell: Spell, target: ICreature): boolean {
    if (spell.targetType === "self") {
      return target.id === this.creature.id;
    }

    if (spell.targetType === "ally") {
      return this.creature.group === target.group;
    }

    if (spell.targetType === "enemy") {
      return this.creature.group !== target.group;
    }

    return false;
  }

  /**
   * Check if target is in range
   */
  private isTargetInRange(spell: Spell, target: ICreature): boolean {
    if (this.creature.x === undefined || this.creature.y === undefined || target.x === undefined || target.y === undefined) {
      return false;
    }

    const distance = calculateDistanceBetween(
      this.creature.x,
      this.creature.y,
      target.x,
      target.y
    );

    return distance <= spell.range;
  }

  /**
   * Apply spell effect to target
   */
  private applySpellEffect(spell: Spell, roll: DiceRoll, target: ICreature | undefined, allCreatures: ICreature[]): void {
    const actualTarget = target || this.creature;
    const effect = spell.effect;

    this.applySpellEffectToTarget(spell, roll, actualTarget, effect.damage);

    // Apply area of effect if specified
    if (effect.areaOfEffect && effect.areaOfEffect > 0 && target) {
      this.applyAreaOfEffect(spell, roll, target, allCreatures, effect.areaOfEffect);
    }
  }

  /**
   * Apply area of effect damage/healing to nearby creatures
   */
  private applyAreaOfEffect(spell: Spell, roll: DiceRoll, centerTarget: ICreature, allCreatures: ICreature[], radius: number): void {
    if (centerTarget.x === undefined || centerTarget.y === undefined) return;
    
    const effect = spell.effect;

    allCreatures.forEach(creature => {
      if (creature.id === centerTarget.id) return; // Skip center target (already affected)
      if (creature.x === undefined || creature.y === undefined || centerTarget.x === undefined || centerTarget.y === undefined) return;

      const distance = calculateDistanceBetween(
        centerTarget.x,
        centerTarget.y,
        creature.x,
        creature.y
      );

      if (distance <= radius) {
        this.applySpellEffectToTarget(spell, roll, creature, effect.aoeDamage ?? effect.damage);
      }
    });
  }

  private applySpellEffectToTarget(spell: Spell, roll: DiceRoll, target: ICreature, damage: DamageAttack | undefined): void {
    const effect = spell.effect;

    // Apply damage
    if (effect.damage) {
      const isBackAttackForHit = isBackAttack(this.creature, target);
      executeDamageRoll({
        attacker: this.creature,
        target: target,
        attack: effect.damage
      }, { attackerRoll: roll, isBackAttack: isBackAttackForHit, hit: true });
    }

    // Apply healing
    if (effect.heal) {
      target.heal(effect.heal, true);
    }

    // Apply status effect
    if (effect.statusEffect) {
      target.addStatusEffect(effect.statusEffect);
    }
  }
}
