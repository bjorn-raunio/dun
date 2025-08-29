import { Creature, CREATURE_GROUPS } from './base';
import { AIState } from '../ai/types';
import { createAIStateForCreature } from '../ai/decisionMaking';

// --- Monster Class ---
export class Monster extends Creature {
  public aiState: AIState;

  get kind(): "monster" {
    return "monster";
  }

  constructor(params: any) {
    // Ensure monster group is set (default to bandits if not specified)
    super({
      ...params,
      group: params.group || CREATURE_GROUPS.ENEMY
    });

    // Initialize AI state for the monster
    this.aiState = createAIStateForCreature(this, params.preset);
  }

  /**
   * Get the current AI state
   */
  getAIState(): AIState {
    return this.aiState;
  }

  /**
   * Update the AI state (used after AI decisions are executed)
   */
  updateAIState(newState: AIState): void {
    this.aiState = newState;
  }

  /**
   * Check if this monster is AI controlled
   */
  isAIControlled(): boolean {
    return true; // All monsters are AI controlled
  }
}
