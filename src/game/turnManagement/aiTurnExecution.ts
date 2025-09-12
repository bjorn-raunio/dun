import { ICreature } from '../../creatures/index';
import { getVisibleCreatures } from '../../utils/pathfinding';
import { logTurn, logAI } from '../../utils/logging';
import { TurnExecutionContext } from './types';
import { AIState } from '../../ai/types';
import { makeAIDecision, AIDecision } from '../../ai/decisionMaking';
import { animationManager } from '../../animations';
// calculateDistanceBetween not used in this file

/**
 * Execute AI turn for a single creature
 */
export async function executeAITurnForCreature(
  creature: ICreature,
  context: TurnExecutionContext
): Promise<boolean> {
  const { groups, mapDefinition } = context;
  
  logAI(`Starting AI turn for ${creature.name} - Actions: ${creature.remainingActions}, Movement: ${creature.remainingMovement}`);
  
  // Get AI state from the creature
  const aiState = creature.getAIState();
  if (!aiState) {
    return false;
  }
  
  logAI(`${creature.name} has AI behavior: ${aiState.behavior.name}`);

  // Calculate line of sight at the start of AI turn
  if (mapDefinition && mapDefinition.tiles && mapDefinition.tiles.length > 0) {
    const cols = mapDefinition.tiles[0].length;
    const rows = mapDefinition.tiles.length;
    
    logAI(`${creature.name} calculating line of sight at (${creature.x}, ${creature.y})`);
    
    // Get visible creatures for this AI creature
    const visibleCreatures = creature.x !== undefined && creature.y !== undefined ? 
      getVisibleCreatures(
        creature.x,
        creature.y,
        context.creatures.filter(c => c.x !== undefined && c.y !== undefined),
        cols,
        rows,
        mapDefinition
      ) : [];
    
    const visibleHostileCreatures = visibleCreatures.filter((c: ICreature) => creature.isHostileTo(c));
    logAI(`${creature.name} can see ${visibleHostileCreatures.length} hostile creatures: ${visibleHostileCreatures.map((c: ICreature) => c.name).join(', ')}`);
  }

  return await executeAITurnLoop(creature, aiState, context);
}

/**
 * Execute the main AI turn loop
 */
async function executeAITurnLoop(
  creature: ICreature,
  aiState: AIState,
  context: TurnExecutionContext
): Promise<boolean> {
  const { groups, mapDefinition } = context;
  let success = false;
  let previousActions = creature.remainingActions;
  let previousMovement = creature.remainingMovement;
  let previousQuickActions = creature.remainingQuickActions;
  
  // Safety measure: prevent infinite loops
  const maxIterations = 10;
  let iterationCount = 0;

  // Continue taking actions until no progress is made
  while (iterationCount < maxIterations) {
    iterationCount++;

    // Get all creatures for AI decision making
    const allCreatures = context.creatures.filter(c => c.x !== undefined && c.y !== undefined);
    
    // Make AI decision
    const decision = makeAIDecision(creature, aiState, allCreatures, mapDefinition);
    
    // Execute the decision
    const actionSuccess = await executeAIDecision(creature, decision, allCreatures, mapDefinition);
    if (actionSuccess) {
      success = true;
    }
    
    // Check if any progress was made in this iteration
    if (!hasProgressBeenMade(creature, previousActions, previousMovement, previousQuickActions)) {
      break;
    }
    
    // Update previous values for next iteration
    previousActions = creature.remainingActions;
    previousMovement = creature.remainingMovement;
    previousQuickActions = creature.remainingQuickActions;
  }
  
  // Log if we hit the maximum iterations (this shouldn't happen normally)
  if (iterationCount >= maxIterations) {
    logTurn(`${creature.name} AI turn stopped after ${maxIterations} iterations to prevent infinite loop`);
  }
  
  return success;
}

/**
 * Execute an AI decision
 */
async function executeAIDecision(
  creature: ICreature,
  decision: AIDecision,
  allCreatures: ICreature[],
  mapDefinition: any
): Promise<boolean> {
  switch (decision.type) {
    case 'attack':
      if (decision.target && creature.remainingActions > 0) {
        logAI(`${creature.name} attacking ${decision.target.name}`);
        const result = creature.attack(decision.target, allCreatures, mapDefinition);
        return result.success;
      }
      break;
      
    case 'cast':
      if (decision.target && decision.spell && creature.remainingActions > 0) {
        logAI(`${creature.name} casting ${decision.spell.name} on ${decision.target.name}`);
        const success = creature.castSpell(decision.spell, decision.target, allCreatures);
        return success;
      }
      break;
      
    case 'move':
      if (decision.position && creature.remainingMovement > 0) {
        logAI(`${creature.name} moving to (${decision.position.x}, ${decision.position.y}) - ${decision.reason}`);
        
        // Find path to the target position
        const reachableResult = creature.getReachableTiles(allCreatures, mapDefinition, mapDefinition.tiles[0].length, mapDefinition.tiles.length);
        const path = reachableResult.pathMap.get(`${decision.position.x},${decision.position.y}`);
        if (path && path.length > 0) {
          // Execute movement (game logic)
          const result = creature.moveTo(path, allCreatures, mapDefinition);
          
          if (result.status === 'success' || result.status === 'partial') {
            // Animate the movement through each step, updating position as we go
            await animateAIMovementPathWithStateUpdate(creature.id, path, allCreatures);
          }
          
          return result.status === 'success' || result.status === 'partial';
        }
      }
      break;
      
    case 'wait':
      logAI(`${creature.name} waiting`);
      return false; // No action taken
  }
  
  return false;
}

/**
 * Animate AI movement through each step of the path
 */
async function animateAIMovementPath(creatureId: string, path: Array<{ x: number; y: number }>): Promise<void> {
  if (path.length <= 1) return;

  // Animate through each step of the path
  for (let i = 1; i < path.length; i++) {
    const currentTile = path[i - 1];
    const nextTile = path[i];

    // Add movement animation for this step
    const animationId = animationManager.addMovementAnimation(
      creatureId,
      { x: currentTile.x, y: currentTile.y },
      { x: nextTile.x, y: nextTile.y }
    );

    // Wait for animation to complete before moving to next step
    await waitForAnimation(animationId);
  }
}

/**
 * Animate AI movement and update creature position as each step completes
 */
async function animateAIMovementPathWithStateUpdate(creatureId: string, path: Array<{ x: number; y: number }>, allCreatures: ICreature[]): Promise<void> {
  if (path.length <= 1) return;

  // Animate through each step of the path
  for (let i = 1; i < path.length; i++) {
    const currentTile = path[i - 1];
    const nextTile = path[i];

    // Add movement animation for this step
    const animationId = animationManager.addMovementAnimation(
      creatureId,
      { x: currentTile.x, y: currentTile.y },
      { x: nextTile.x, y: nextTile.y }
    );

    // Wait for animation to complete
    await waitForAnimation(animationId);

    // Update creature position in the creatures array after each step
    const creature = allCreatures.find(c => c.id === creatureId);
    if (creature) {
      creature.x = nextTile.x;
      creature.y = nextTile.y;
    }
  }
}

/**
 * Wait for an animation to complete
 */
function waitForAnimation(animationId: string): Promise<void> {
  return new Promise((resolve) => {
    const checkAnimation = () => {
      if (animationManager.isAnimationComplete(animationId)) {
        resolve();
      } else {
        requestAnimationFrame(checkAnimation);
      }
    };
    checkAnimation();
  });
}

/**
 * Check if progress has been made in the AI turn
 */
function hasProgressBeenMade(
  creature: ICreature,
  previousActions: number,
  previousMovement: number,
  previousQuickActions: number
): boolean {
  const currentActions = creature.remainingActions;
  const currentMovement = creature.remainingMovement;
  const currentQuickActions = creature.remainingQuickActions;
  
  return !(currentActions === previousActions && 
           currentMovement === previousMovement && 
           currentQuickActions === previousQuickActions);
}
