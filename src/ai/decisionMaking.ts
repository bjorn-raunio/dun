import { Creature } from '../creatures';
import { AIState, AIDecision, AIContext, AIActionResult } from './types';
import { selectBestTarget, updateTargetInformation } from './targeting';
import { createMovementDecision, updateAIStateAfterMovement } from './movement';
import { shouldAttack, createAttackDecision, shouldFlee, createFleeDecision, updateAIStateAfterAttack } from './combat';

// --- AI Decision Making Logic ---

/**
 * Make a decision for an AI creature's turn
 */
export function makeAIDecision(context: AIContext): AIActionResult {
  const { ai, creature, allCreatures, mapData, currentTurn, reachableTiles, targetsInRange } = context;
  
  // Update AI state with current information
  const updatedAI = updateTargetInformation(ai, creature, allCreatures);
  
  // Check if creature should flee
  if (shouldFlee(updatedAI, creature, allCreatures)) {
    const fleeDecision = createFleeDecision(updatedAI, creature, allCreatures);
    return {
      success: true,
      action: fleeDecision,
      message: `${creature.name} decides to flee from combat.`,
      newState: updatedAI
    };
  }
  
  // Select best target
  const target = selectBestTarget(updatedAI, creature, allCreatures);
  
  // If we have a target in range and can attack, consider attacking
  if (target && targetsInRange.includes(target) && shouldAttack(updatedAI, creature, target, allCreatures)) {
    const attackDecision = createAttackDecision(updatedAI, creature, target, allCreatures);
    return {
      success: true,
      action: attackDecision,
      message: `${creature.name} decides to attack ${target.name}.`,
      newState: updatedAI
    };
  }
  
  // If we have a target but can't attack, consider moving
  if (target && reachableTiles.length > 0) {
    const movementDecision = createMovementDecision(updatedAI, creature, allCreatures, reachableTiles, target);
    
    if (movementDecision) {
      return {
        success: true,
        action: movementDecision,
        message: `${creature.name} decides to move toward ${target.name}.`,
        newState: updatedAI
      };
    }
  }
  
  // If no good action is available, wait
  const waitDecision: AIDecision = {
    type: 'wait',
    priority: 1,
    reason: 'No advantageous action available'
  };
  
  return {
    success: true,
    action: waitDecision,
    message: `${creature.name} decides to wait.`,
    newState: updatedAI
  };
}

/**
 * Execute an AI decision
 */
export function executeAIDecision(
  decision: AIDecision,
  context: AIContext
): { success: boolean; message: string; newState: AIState } {
  const { ai, creature, allCreatures } = context;
  
  switch (decision.type) {
    case 'attack':
      if (decision.target) {
        // Perform the attack
        const attackResult = creature.attack(decision.target, allCreatures);
        
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
          newState
        };
      }
      break;
      
    case 'move':
      if (decision.destination) {
        // Calculate movement cost (simplified)
        const cost = Math.abs(decision.destination.x - creature.x) + Math.abs(decision.destination.y - creature.y);
        
        // Try to move
        const moveResult = creature.moveTo(decision.destination.x, decision.destination.y, allCreatures);
        
        if (moveResult.success) {
          // Apply movement cost
          creature.useMovement(cost);
          
          // Update AI state
          const newState = updateAIStateAfterMovement(
            ai,
            creature,
            decision.destination.x,
            decision.destination.y
          );
          
          return {
            success: true,
            message: `${creature.name} moves to (${decision.destination.x}, ${decision.destination.y}).`,
            newState
          };
        } else {
          return {
            success: false,
            message: moveResult.message || `${creature.name} cannot move there.`,
            newState: ai
          };
        }
      }
      break;
      
    case 'flee':
      // For now, fleeing just means ending the turn
      return {
        success: true,
        message: `${creature.name} flees from combat.`,
        newState: ai
      };
      
    case 'wait':
      return {
        success: true,
        message: `${creature.name} waits.`,
        newState: ai
      };
      
    case 'special':
      // Handle special abilities (to be implemented)
      return {
        success: true,
        message: `${creature.name} uses a special ability.`,
        newState: ai
      };
  }
  
  return {
    success: false,
    message: `Unknown action type: ${decision.type}`,
    newState: ai
  };
}

/**
 * Create a default AI state for a creature
 */
export function createDefaultAIState(behavior: string = 'aggressive'): AIState {
  return {
    behavior: behavior as any,
    currentTarget: null,
    lastKnownPlayerPositions: new Map(),
    threatAssessment: new Map(),
    tacticalMemory: {
      lastMove: null,
      lastAttack: null,
      preferredPositions: []
    },
    personality: {
      aggression: 0.7,
      caution: 0.3,
      intelligence: 0.5,
      adaptability: 0.6
    }
  };
}

/**
 * Create AI state based on creature type and preset
 */
export function createAIStateForCreature(creature: Creature, preset?: any): AIState {
  // Determine behavior based on creature type or preset
  let behavior = 'aggressive';
  
  if (preset?.aiBehavior) {
    behavior = preset.aiBehavior;
  } else if (creature.constructor.name === 'Monster') {
    // Default monster behaviors based on stats
    if (creature.agility > 4) {
      behavior = 'cautious';
    } else if (creature.strength > 4) {
      behavior = 'berserker';
    } else if (creature.combat > 4) {
      behavior = 'aggressive';
    } else {
      behavior = 'defensive';
    }
  }
  
  const baseState = createDefaultAIState(behavior);
  
  // Customize personality based on creature stats
  const personality = {
    aggression: Math.min(1, creature.combat / 5),
    caution: Math.min(1, creature.agility / 5),
    intelligence: Math.min(1, (creature.combat + creature.agility) / 10),
    adaptability: 0.6
  };
  
  return {
    ...baseState,
    personality
  };
}

/**
 * Check if an AI creature should take its turn
 */
export function shouldAITakeTurn(creature: Creature): boolean {
  return creature.vitality > 0 && 
         (creature.remainingMovement > 0 || creature.remainingActions > 0);
}

/**
 * Get all possible decisions for an AI creature (for debugging/analysis)
 */
export function getAllPossibleDecisions(context: AIContext): AIDecision[] {
  const { ai, creature, allCreatures, reachableTiles, targetsInRange } = context;
  const decisions: AIDecision[] = [];
  
  // Check for flee decision
  if (shouldFlee(ai, creature, allCreatures)) {
    decisions.push(createFleeDecision(ai, creature, allCreatures));
  }
  
  // Check for attack decisions
  for (const target of targetsInRange) {
    if (shouldAttack(ai, creature, target, allCreatures)) {
      decisions.push(createAttackDecision(ai, creature, target, allCreatures));
    }
  }
  
  // Check for movement decisions
  const target = selectBestTarget(ai, creature, allCreatures);
  if (target && reachableTiles.length > 0) {
    const movementDecision = createMovementDecision(ai, creature, allCreatures, reachableTiles, target);
    if (movementDecision) {
      decisions.push(movementDecision);
    }
  }
  
  // Always add wait as an option
  decisions.push({
    type: 'wait',
    priority: 1,
    reason: 'No advantageous action available'
  });
  
  // Sort by priority (highest first)
  return decisions.sort((a, b) => b.priority - a.priority);
}
