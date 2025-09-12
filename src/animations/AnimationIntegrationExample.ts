// Example of how to integrate animations with existing game systems
// This file shows how to modify existing handlers to use animations

import { ICreature } from '../creatures/interfaces';
import { QuestMap } from '../maps/types';
import { animationManager } from './index';

/**
 * Example: Modified movement handler that includes animations
 * This shows proper separation: game logic + animation
 */
export async function handleMovementWithAnimation(
  selectedCreatureId: string,
  targetX: number,
  targetY: number,
  creatures: ICreature[],
  reachable: any,
  mapDefinition: QuestMap,
  setCreatures: (updater: (prev: ICreature[]) => ICreature[]) => void,
  animations: any // Animation service from useGameAnimations()
): Promise<boolean> {
  const targetCreature = creatures.find(c => c.id === selectedCreatureId);
  if (!targetCreature) return false;

  // Find path to target (existing game logic)
  const path = reachable.pathMap.get(`${targetX},${targetY}`);
  if (!path || path.length === 0) return false;

  // Execute game logic first (movement validation, cost calculation, etc.)
  const moveResult = targetCreature.moveTo(path, creatures, mapDefinition);
  
  if (moveResult.status === 'success' || moveResult.status === 'partial') {
    // If movement is valid, animate it
    await animations.animateMovement(selectedCreatureId, path);
    
    // Update creatures state with the result
    setCreatures(prev => prev.map(c => c.id === selectedCreatureId ? targetCreature : c));
    return true;
  }

  return false;
}

/**
 * Example: Modified combat handler that includes animations
 * This shows proper separation: game logic + animation
 */
export async function handleAttackWithAnimation(
  attacker: ICreature,
  target: ICreature,
  creatures: ICreature[],
  mapDefinition: QuestMap,
  setCreatures: (updater: (prev: ICreature[]) => ICreature[]) => void,
  animations: any // Animation service from useGameAnimations()
): Promise<void> {
  // Determine attack type based on distance (game logic)
  const distance = Math.abs(attacker.x! - target.x!) + Math.abs(attacker.y! - target.y!);
  const attackType: 'melee' | 'ranged' = distance <= 1 ? 'melee' : 'ranged';

  // Animate the attack
  await animations.animateAttack(attacker.id, target.id, attackType);

  // Execute actual combat logic (game logic)
  const combatResult = attacker.attack(target, creatures, mapDefinition);

  // Animate damage if attack was successful
  if (combatResult.success && combatResult.damage > 0) {
    animations.animateDamage(target.id, combatResult.damage);
  }

  // Update creatures state (both attacker and target may have changed)
  setCreatures(prev => prev.map(c => {
    if (c.id === attacker.id) return attacker;
    if (c.id === target.id) return target;
    return c;
  }));
}

/**
 * Example: Modified spell casting handler that includes animations
 * This shows proper separation: game logic + animation
 */
export async function handleSpellCastWithAnimation(
  caster: ICreature,
  spell: any,
  target: ICreature | undefined,
  creatures: ICreature[],
  setCreatures: (updater: (prev: ICreature[]) => ICreature[]) => void,
  animations: any // Animation service from useGameAnimations()
): Promise<void> {
  // Animate the spell casting
  await animations.animateSpellCast(caster.id, target?.id, spell.name);

  // Execute actual spell logic (game logic)
  const success = caster.castSpell(spell, target, creatures);

  // Add effect animations based on spell result
  if (success && target) {
    if (spell.effect.damage) {
      animations.animateSpellDamage(target.id, spell.effect.damage);
    }
    if (spell.effect.heal) {
      animations.animateSpellHeal(target.id, spell.effect.heal);
    }
    if (spell.effect.statusEffect) {
      animations.animateStatusEffect(target.id, spell.effect.statusEffect.name);
    }
  }

  // Update creatures state (caster and target may have changed)
  setCreatures(prev => prev.map(c => {
    if (c.id === caster.id) return caster;
    if (target && c.id === target.id) return target;
    return c;
  }));
}

/**
 * Example usage in a React component:
 * 
 * function MyGameComponent() {
 *   const animations = useGameAnimations();
 *   
 *   const handleMovement = async (creatureId, targetX, targetY) => {
 *     // Game logic: validate movement, calculate path, etc.
 *     const path = calculatePath(creatureId, targetX, targetY);
 *     const isValid = validateMovement(creatureId, path);
 *     
 *     if (isValid) {
 *       // Execute game logic
 *       const creature = creatures.find(c => c.id === creatureId);
 *       creature.moveTo(path, allCreatures, mapDefinition);
 *       
 *       // Then animate it
 *       await animations.animateMovement(creatureId, path);
 *       
 *       // Update UI
 *       setCreatures(prev => prev.map(c => c.id === creatureId ? creature : c));
 *     }
 *   };
 * }
 */
