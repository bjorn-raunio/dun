import { Creature } from '../creatures/index';
import { AIState, AIDecision, AIContext, AIActionResult, AIBehaviorType } from './types';
import { selectBestTarget, updateTargetInformation } from './targeting';
import { createMovementDecision, updateAIStateAfterMovement } from './movement';
import { shouldFlee, createFleeDecision, updateAIStateAfterAttack, isTargetValid } from './combat';
import { calculateTargetsInRange } from '../utils/combatUtils';
import { canAttackImmediately } from '../utils/positioning/distance';
import { validateCombat } from '../validation/combat';
import { executeMovement } from '../gameLogic/movement';
import { CreatureMovement } from '../creatures/movement';
import { AI_MESSAGES, createMovementMessage } from '../utils/messageUtils';

// --- Helper Functions for Common Patterns ---

/**
 * Create a wait decision with the given reason
 */
function createWaitDecision(reason: string): AIDecision {
  return {
    type: 'wait',
    priority: 1,
    reason
  };
}

/**
 * Create a successful AI action result
 */
function createSuccessfulActionResult(
  action: AIDecision,
  message: string,
  newState: AIState
): AIActionResult {
  return {
    success: true,
    action,
    message,
    newState
  };
}

/**
 * Create a failed AI action result
 */
function createFailedActionResult(
  message: string,
  newState: AIState
): AIActionResult {
  return {
    success: false,
    action: createWaitDecision('Action failed'),
    message,
    newState
  };
}

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
    return createSuccessfulActionResult(
      fleeDecision,
      AI_MESSAGES.flee(creature.name),
      updatedAI
    );
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
    const waitDecision = createWaitDecision('No targets available');
    
    return createSuccessfulActionResult(
      waitDecision,
      AI_MESSAGES.wait(creature.name, 'no targets'),
      updatedAI
    );
  }
  
  // Check if we can attack the target from current position
  const canAttackNow = canAttackImmediately(creature, target);
  const attackValidation = canAttackNow ? validateCombat(creature, target, allCreatures, mapDefinition) : { isValid: false };
  
  // If we can attack now, prioritize attacking over movement
  if (canAttackNow && attackValidation.isValid) {
    // Attack from current position - no movement when already in attack range
    const attackDecision: AIDecision = {
      type: 'attack',
      target,
      priority: 8, // High priority for attacking
      reason: `Attacking ${target.name}`
    };
    
    return createSuccessfulActionResult(
      attackDecision,
      AI_MESSAGES.attack(creature.name, target.name),
      updatedAI
    );
  }
  
  // If target is in range but we can't attack (e.g., no actions remaining), wait
  if (canAttackNow) {
    const waitDecision = createWaitDecision('Target in range but cannot attack');
    
    return createSuccessfulActionResult(
      waitDecision,
      AI_MESSAGES.waitEngaged(creature.name, target.name),
      updatedAI
    );
  }
  
  // Can't attack now, but we have a target - try to move toward it
  if (reachableTiles.length > 0) {
    const movementDecision = createMovementDecision(updatedAI, creature, allCreatures, reachableTiles, context.reachableTilesCostMap, target, context.mapData, context.mapData.tiles[0].length, context.mapData.tiles.length, context.mapDefinition);
    
    if (movementDecision) {
      const message = createMovementMessage(creature.name, target.name, updatedAI.currentTarget === null);
      
      return createSuccessfulActionResult(
        movementDecision,
        message,
        updatedAI
      );
    }
  }
  
  // If no good action is available, wait
  const waitDecision = createWaitDecision('No advantageous action available');
  
  return createSuccessfulActionResult(
    waitDecision,
    AI_MESSAGES.wait(creature.name),
    updatedAI
  );
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
        const attackResult = creature.attack(decision.target, allCreatures, mapDefinition);
        
        // Update AI state
        const newState = updateAIStateAfterAttack(
          ai,
          creature,
          decision.target,
          attackResult.hit,
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
        // Get the actual movement cost from the reachable tiles calculation
        const { costMap } = CreatureMovement.getReachableTiles(creature, allCreatures, mapData, mapData.tiles[0].length, mapData.tiles.length, mapDefinition);
        const cost = costMap.get(`${decision.destination.x},${decision.destination.y}`) ?? Infinity;
        
        // Use the same movement validation and execution as heroes
        const moveResult = executeMovement(creature, decision.destination.x, decision.destination.y, allCreatures, cost, mapData, mapDefinition);
        
        if (moveResult.success) {
          // Update AI state
          const newState = updateAIStateAfterMovement(
            ai,
            creature,
            decision.destination.x,
            decision.destination.y
          );
          
          return {
            success: true,
            message: AI_MESSAGES.moveToPosition(creature.name, decision.destination.x, decision.destination.y),
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
export function createAIStateForCreature(creature: Creature, preset?: any): AIState {
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
  allCreatures: Creature[]
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
        decisions.push({
          type: 'attack',
          target,
          priority: 8, // High priority for attacking
          reason: `Attacking ${target.name}`
        });
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
  decisions.push(createWaitDecision('No advantageous action available'));
  
  // Sort by priority (highest first)
  return decisions.sort((a, b) => b.priority - a.priority);
}
