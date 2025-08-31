import { Creature, Monster } from '../creatures/index';
import { AIState, AIDecision, AIContext, AIActionResult, AIBehaviorType } from './types';
import { selectBestTarget, updateTargetInformation } from './targeting';
import { createMovementDecision, updateAIStateAfterMovement } from './movement';
import { shouldFlee, createFleeDecision, updateAIStateAfterAttack, isTargetValid } from './combat';
import { calculateTargetsInRange } from '../utils/combat';
import { canAttackImmediately, isCreatureVisible } from '../utils/pathfinding';
import { validateCombat } from '../validation/combat';
import { executeMovement } from '../game/movement';
import { CreatureMovement } from '../creatures/movement';
import { AI_MESSAGES, createMovementMessage } from '../utils/messageUtils';
import { createAIDecision, validateAIAction } from './helpers';
import creatureServices from '../creatures/services';
import { MapDefinition } from '../maps/types';
import { MonsterPreset, MercenaryPreset } from '../creatures/presets/types';

// --- AI Decision Making Logic ---

// --- AI Decision Making Logic ---

/**
 * Check if an AI creature should continue its turn after killing a target
 */
export function shouldContinueTurnAfterKill(
  creature: Creature,
  allCreatures: Creature[]
): boolean {
  // Check if the creature has remaining movement
  const hasRemainingMovement = creature.remainingMovement > 0;
  
  // Check if there are other hostile targets available
  const hasOtherTargets = allCreatures.some(c => 
    c.isAlive() && 
    c.id !== creature.id && 
    creature.isHostileTo(c)
  );
  
  return hasRemainingMovement && hasOtherTargets;
}

/**
 * Make a decision for an AI creature's turn
 */
export function makeAIDecision(context: AIContext): AIActionResult {
  const { ai, creature, allCreatures, mapData, currentTurn, reachableTiles, targetsInRange, mapDefinition } = context;
  
  // Update AI state with current information
  const updatedAI = updateTargetInformation(ai, creature, allCreatures, mapData, mapData.tiles[0].length, mapData.tiles.length, mapDefinition);
  
  // Check if creature should flee
  if (shouldFlee(updatedAI, creature, allCreatures)) {
    const fleeDecision = createFleeDecision(updatedAI, creature, allCreatures);
    return {
      success: true,
      action: fleeDecision,
      message: AI_MESSAGES.flee(creature.name),
      newState: updatedAI
    };
  }
  
  // Check if current target is still valid
  let target = updatedAI.currentTarget;
  if (target && !isTargetValid(target, creature)) {
    // Current target is no longer valid (dead or no longer hostile), clear it
    updatedAI.currentTarget = null;
    target = null;
    
    // If we just killed our target and have remaining movement, select a new target
  }
  
  // Select best target if we don't have a valid one
  if (!target) {
    target = selectBestTarget(updatedAI, creature, allCreatures, mapData, mapData.tiles[0].length, mapData.tiles.length, mapDefinition);
  }
  
  if (!target) {
    // No target available, wait
    const waitDecision = createAIDecision('wait', { reason: 'No targets available' });
    
    return {
      success: true,
      action: waitDecision,
      message: AI_MESSAGES.wait(creature.name, 'no targets'),
      newState: updatedAI
    };
  }
  
  // Check if we can attack the target from current position
  const canAttackNow = canAttackImmediately(creature, target);
  const attackValidation = canAttackNow ? validateCombat(creature, target, allCreatures, mapDefinition) : { isValid: false };
  
  // For ranged creatures, check if we have line of sight before attacking
  const hasRangedWeapon = creature.equipment.mainHand?.kind === 'ranged_weapon' || creature.equipment.offHand?.kind === 'ranged_weapon';
  const isRangedBehavior = updatedAI.behavior === AIBehaviorType.RANGED;
  
  if (canAttackNow && attackValidation.isValid) {
    // For ranged creatures, check line of sight
    if ((hasRangedWeapon || isRangedBehavior) && context.mapData && context.mapDefinition) {
      const hasLineOfSight = isCreatureVisible(
        creature.x, 
        creature.y, 
        target, 
        context.mapData, 
        context.mapData.tiles[0].length, 
        context.mapData.tiles.length, 
        context.mapDefinition, 
        {}, 
        creature, 
        allCreatures
      );
      
      // If we don't have line of sight, try to move instead of attacking
      if (!hasLineOfSight) {
        if (context.reachableTiles.length > 0) {
          const movementDecision = createMovementDecision(
            updatedAI, 
            creature, 
            allCreatures, 
            context.reachableTiles, 
            context.reachableTilesCostMap, 
            target, 
            context.mapData, 
            context.mapData.tiles[0].length, 
            context.mapData.tiles.length, 
            context.mapDefinition
          );
          
          if (movementDecision) {
            const message = createMovementMessage(creature.name, target.name, updatedAI.currentTarget === null);
            
            return {
              success: true,
              action: movementDecision,
              message,
              newState: updatedAI
            };
          }
        }
      }
    }
    
    // Attack from current position - no movement when already in attack range and have line of sight
    const attackDecision = createAIDecision('attack', {
      target,
      priority: 8,
      reason: `Attacking ${target.name}`
    });
    
    return {
      success: true,
      action: attackDecision,
      message: AI_MESSAGES.attack(creature.name, target.name),
      newState: updatedAI
    };
  }
  
  // If target is in range but we can't attack (e.g., no actions remaining), wait
  if (canAttackNow) {
    const waitDecision = createAIDecision('wait', { reason: 'Target in range but cannot attack' });
    
    return {
      success: true,
      action: waitDecision,
      message: AI_MESSAGES.waitEngaged(creature.name, target.name),
      newState: updatedAI
    };
  }
  
  // Can't attack now, but we have a target - try to move toward it
  if (reachableTiles.length > 0) {
    const movementDecision = createMovementDecision(updatedAI, creature, allCreatures, reachableTiles, context.reachableTilesCostMap, target, context.mapData, context.mapData.tiles[0].length, context.mapData.tiles.length, context.mapDefinition);
    
    if (movementDecision) {
      const message = createMovementMessage(creature.name, target.name, updatedAI.currentTarget === null);
      
      return {
        success: true,
        action: movementDecision,
        message,
        newState: updatedAI
      };
    }
  }
  
  // If no good action is available, wait
  const waitDecision = createAIDecision('wait', { reason: 'No advantageous action available' });
  
  return {
    success: true,
    action: waitDecision,
    message: AI_MESSAGES.wait(creature.name),
    newState: updatedAI
  };
}

/**
 * Execute an AI decision
 */
export function executeAIDecision(
  decision: AIDecision,
  context: AIContext
): { success: boolean; message: string; newState: AIState; targetDefeated?: boolean } {
  const { ai, creature, allCreatures, mapData, mapDefinition } = context;
  
  switch (decision.type) {
    case 'attack':
      if (decision.target) {
        // Perform the attack
        const attackResult = creature.attack(decision.target, allCreatures, mapDefinition, mapData);
        
        // Update AI state
        const newState = updateAIStateAfterAttack(
          ai,
          creature,
          decision.target,
          attackResult.success,
          attackResult.damage
        );
        
        return {
          success: true,
          message: attackResult.message,
          newState,
          targetDefeated: attackResult.targetDefeated
        };
      }
      break;
      
    case 'move':
      if (decision.destination) {
        // Get the actual movement cost and path from the reachable tiles calculation
        const { costMap, pathMap } = creatureServices.getMovementService().getReachableTiles(creature, allCreatures, mapData, mapData.tiles[0].length, mapData.tiles.length, mapDefinition);
        const destKey = `${decision.destination.x},${decision.destination.y}`;
        const cost = costMap.get(destKey) ?? Infinity;
        const path = pathMap.get(destKey);
        
        if (!path) {
          return {
            success: false,
            message: `No path found to destination (${decision.destination.x}, ${decision.destination.y})`,
            newState: ai,
            targetDefeated: false
          };
        }
        
        // Use the same movement validation and execution as heroes
        const moveResult = executeMovement(creature, path, allCreatures, cost, mapData, mapDefinition);
        
        if (moveResult.status === 'success' || moveResult.status === 'partial') {
          // Update AI state with final position (either destination or where they stopped)
          const finalPosition = moveResult.finalPosition || { x: creature.x, y: creature.y };
          const newState = updateAIStateAfterMovement(
            ai,
            creature,
            finalPosition.x,
            finalPosition.y
          );
          
          let message = AI_MESSAGES.moveToPosition(creature.name, finalPosition.x, finalPosition.y);
          if (moveResult.status === 'partial') {
            message = `${message} (partial: moved ${moveResult.tilesMoved}/${moveResult.totalPathLength} tiles)`;
          }
          
          return {
            success: true,
            message,
            newState,
            targetDefeated: false
          };
        } else {
          return {
            success: false,
            message: moveResult.message || AI_MESSAGES.cannotMove(creature.name),
            newState: ai,
            targetDefeated: false
          };
        }
      }
      break;
      
    case 'flee':
      // For now, fleeing just means ending the turn
      return {
        success: true,
        message: AI_MESSAGES.flee(creature.name),
        newState: ai,
        targetDefeated: false
      };
      
    case 'wait':
      return {
        success: true,
        message: AI_MESSAGES.wait(creature.name),
        newState: ai,
        targetDefeated: false
      };
      
    case 'special':
      // Handle special abilities (to be implemented)
      return {
        success: true,
        message: AI_MESSAGES.specialAbility(creature.name),
        newState: ai,
        targetDefeated: false
      };
  }
  
  return {
    success: false,
    message: AI_MESSAGES.unknownAction(decision.type),
    newState: ai,
    targetDefeated: false
  };
}

/**
 * Create a default AI state for a creature
 */
export function createDefaultAIState(behavior: AIBehaviorType = AIBehaviorType.MELEE): AIState {
  return {
    behavior,
    currentTarget: null,
    lastKnownPlayerPositions: new Map(),
    threatAssessment: new Map(),
    tacticalMemory: {
      lastMove: null,
      lastAttack: null,
      preferredPositions: []
    }
  };
}

/**
 * Create AI state based on creature type and preset
 */
export function createAIStateForCreature(creature: Monster, preset?: MonsterPreset): AIState {
  // Determine behavior based on creature type or preset
  let behavior: AIBehaviorType = AIBehaviorType.MELEE;
  
  if (preset?.aiBehavior) {
    behavior = preset.aiBehavior as AIBehaviorType;
  }
  
  const baseState = createDefaultAIState(behavior);
  
  return {
    ...baseState
  };
}

/**
 * Check if an AI creature should take its turn
 */
export function shouldAITakeTurn(creature: Creature, allCreatures: Creature[] = []): boolean {
  const targetsInRange = calculateTargetsInRange(creature, allCreatures);
  return creature.isAlive() && 
         (creature.remainingMovement > 0 || 
          creature.remainingQuickActions > 0 ||
          (creature.remainingActions > 0 && targetsInRange.size > 0));
}

/**
 * Evaluate whether moving before attacking would be beneficial
 */
export function shouldMoveBeforeAttack(
  creature: Creature, 
  target: Creature, 
  movementDecision: AIDecision, 
  allCreatures: Creature[],
  mapData?: { tiles: string[][] },
  mapDefinition?: MapDefinition
): boolean {
  if (movementDecision.type !== 'move' || !movementDecision.destination) {
    return false;
  }
  
  // Calculate current distance to target
  const currentDistance = Math.max(
    Math.abs(target.x - creature.x),
    Math.abs(target.y - creature.y)
  );
  
  // Calculate distance after movement
  const newDistance = Math.max(
    Math.abs(target.x - (movementDecision.destination?.x ?? target.x)),
    Math.abs(target.y - (movementDecision.destination?.y ?? target.y))
  );
  
  // Check if movement would put us in attack range (if we're not already)
  const attackRange = creature.getAttackRange();
  const currentlyInRange = currentDistance <= attackRange;
  const wouldBeInRange = newDistance <= attackRange;
  
  // For ranged creatures, also check line of sight
  const hasRangedWeapon = creature.equipment.mainHand?.kind === 'ranged_weapon' || creature.equipment.offHand?.kind === 'ranged_weapon';
  
  if (hasRangedWeapon && mapData && mapDefinition) {
    const currentHasLOS = isCreatureVisible(
      creature.x, 
      creature.y, 
      target, 
      mapData, 
      mapData.tiles[0].length, 
      mapData.tiles.length, 
      mapDefinition, 
      {}, 
      creature, 
      allCreatures
    );
    
    const newHasLOS = isCreatureVisible(
      movementDecision.destination.x, 
      movementDecision.destination.y, 
      target, 
      mapData, 
      mapData.tiles[0].length, 
      mapData.tiles.length, 
      mapDefinition, 
      {}, 
      creature, 
      allCreatures
    );
    
    // If we don't have line of sight now but would have it after movement, definitely move
    if (!currentHasLOS && newHasLOS) {
      return true;
    }
    
    // If we have line of sight now but would lose it after movement, don't move
    if (currentHasLOS && !newHasLOS) {
      return false;
    }
  }
  
  // If we're not in range and movement would get us in range, definitely move
  if (!currentlyInRange && wouldBeInRange) {
    return true;
  }
  
  // If we're already in attack range, NEVER move - attack from current position
  if (currentlyInRange) {
    return false;
  }
  
  // Only move if it would get us into attack range
  return wouldBeInRange;
}

/**
 * Get all possible decisions for an AI creature (for debugging/analysis)
 */
export function getAllPossibleDecisions(context: AIContext): AIDecision[] {
  const { ai, creature, allCreatures, reachableTiles, targetsInRange, mapDefinition } = context;
  const decisions: AIDecision[] = [];
  
  // Check for flee decision
  if (shouldFlee(ai, creature, allCreatures)) {
    decisions.push(createFleeDecision(ai, creature, allCreatures));
  }
  
  // Check for attack decisions
  for (const target of targetsInRange) {
    const canAttackNow = canAttackImmediately(creature, target);
    if (canAttackNow) {
      const attackValidation = validateCombat(creature, target, allCreatures, mapDefinition);
      if (attackValidation.isValid) {
              decisions.push(createAIDecision('attack', {
        target,
        priority: 8,
        reason: `Attacking ${target.name}`
      }));
      }
    }
  }
  
  // Check for movement decisions
  const target = selectBestTarget(ai, creature, allCreatures, context.mapData, context.mapData.tiles[0].length, context.mapData.tiles.length, context.mapDefinition);
  if (target && reachableTiles.length > 0) {
    const movementDecision = createMovementDecision(ai, creature, allCreatures, reachableTiles, context.reachableTilesCostMap, target, context.mapData, context.mapData.tiles[0].length, context.mapData.tiles.length, context.mapDefinition);
    if (movementDecision) {
      decisions.push(movementDecision);
    }
  }
  
  // Always add wait as an option
  decisions.push(createAIDecision('wait', { reason: 'No advantageous action available' }));
  
  // Sort by priority (highest first)
  return decisions.sort((a, b) => b.priority - a.priority);
}
