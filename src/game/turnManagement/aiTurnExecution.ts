import { Creature } from '../../creatures/index';
import { makeAIDecision, executeAIDecision, shouldAITakeTurn, shouldContinueTurnAfterKill } from '../../ai/decisionMaking';
import { calculateTargetsInRange } from '../../utils/combatUtils';
import { addMessage } from '../messageSystem';
import { getVisibleCreatures } from '../../utils/pathfinding';
import { logTurn, logAI } from '../../utils/logging';
import creatureServices from '../../creatures/services';
import { TurnExecutionContext } from './types';

/**
 * Execute AI turn for a single creature
 */
export function executeAITurnForCreature(
  creature: Creature,
  context: TurnExecutionContext
): boolean {
  const { creatures, mapData, setCreatures, setMessages, mapDefinition } = context;
  
  // Get AI state from the creature (assuming it's a Monster)
  const aiState = (creature as any).getAIState?.() || null;
  if (!aiState) {
    console.warn(`Creature ${creature.name} has no AI state`);
    return false;
  }

  // Calculate line of sight at the start of AI turn
  if (mapData && mapData.tiles && mapData.tiles.length > 0) {
    const cols = mapData.tiles[0].length;
    const rows = mapData.tiles.length;
    
    logAI(`${creature.name} calculating line of sight at (${creature.x}, ${creature.y})`);
    
    // Get visible creatures for this AI creature
    const visibleCreatures = getVisibleCreatures(
      creature.x,
      creature.y,
      creatures,
      mapData,
      cols,
      rows,
      mapDefinition
    );
    
    const visibleHostileCreatures = visibleCreatures.filter((c: Creature) => creature.isHostileTo(c));
    logAI(`${creature.name} can see ${visibleHostileCreatures.length} hostile creatures: ${visibleHostileCreatures.map((c: Creature) => c.name).join(', ')}`);
  }

  return executeAITurnLoop(creature, aiState, context);
}

/**
 * Execute the main AI turn loop
 */
function executeAITurnLoop(
  creature: Creature,
  aiState: any,
  context: TurnExecutionContext
): boolean {
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
    
    const actionResult = executeSingleAIAction(creature, aiState, context);
    
    if (!actionResult.success) {
      break;
    }
    
    success = true;
    
    // Check if we should continue after an attack
    if (actionResult.actionType === 'attack' && actionResult.targetDefeated) {
      if (!shouldContinueTurnAfterKill(creature, context.creatures)) {
        break;
      }
      logTurn(`${creature.name} killed its target but has remaining movement. Continuing turn to find new target.`);
    } else if (actionResult.actionType === 'attack') {
      logTurn(`${creature.name} attacked but did not kill the target. Ending turn.`);
      break;
    }

    // Check if any progress was made
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
 * Execute a single AI action
 */
function executeSingleAIAction(
  creature: Creature,
  aiState: any,
  context: TurnExecutionContext
): { success: boolean; actionType?: string; targetDefeated?: boolean } {
  const { creatures, mapData, setCreatures, setMessages, mapDefinition } = context;
  
  // Get updated reachable tiles and targets in range
  const { tiles: reachableTiles, costMap: reachableTilesCostMap, pathMap: reachableTilesPathMap } = 
    creatureServices.getMovementService().getReachableTiles(
      creature, creatures, mapData, mapData.tiles[0].length, mapData.tiles.length, mapDefinition
    );
  
  const targetsInRangeIds = calculateTargetsInRange(creature, creatures);
  const targetsInRange = creatures.filter(c => targetsInRangeIds.has(c.id));

  // Create AI context
  const aiContext = {
    ai: aiState,
    creature,
    allCreatures: creatures,
    mapData,
    mapDefinition,
    currentTurn: 1, // TODO: Get actual turn number
    reachableTiles,
    reachableTilesCostMap,
    targetsInRange
  };

  // Make AI decision
  const decisionResult = makeAIDecision(aiContext);
  
  if (!decisionResult.success) {
    return { success: false };
  }
  
  // Execute the decision
  const executionResult = executeAIDecision(decisionResult.action, aiContext);
  
  // Update creature's AI state
  if ((creature as any).updateAIState) {
    (creature as any).updateAIState(executionResult.newState);
  }
  
  // Add message to console for movement, to message system for other actions
  if (decisionResult.action.type === 'move') {
    logAI(executionResult.message);
  } else {
    addMessage(executionResult.message, setMessages);
  }
  
  return {
    success: true,
    actionType: decisionResult.action.type,
    targetDefeated: executionResult.targetDefeated
  };
}

/**
 * Check if progress has been made in the AI turn
 */
function hasProgressBeenMade(
  creature: Creature,
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
