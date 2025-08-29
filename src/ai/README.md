# AI System Documentation

This module contains the AI logic for controlling monster behavior in the game.

## Overview

The AI system is designed to be modular and extensible, with separate components for:
- **Targeting**: Evaluating and selecting targets
- **Movement**: Calculating tactical movement options
- **Combat**: Making attack decisions
- **Decision Making**: Coordinating all AI decisions

## Core Components

### Types (`types.ts`)
Defines the core interfaces and types used throughout the AI system:
- `AIBehaviorType`: Enum for different behavior patterns (MELEE, RANGED, ANIMAL)
- `AIDecision`: Represents a decision made by the AI
- `AIState`: Tracks the AI's current state and memory
- `AIContext`: Provides context for AI decision making

### Targeting (`targeting.ts`)
Handles target evaluation and selection:
- `evaluateTargets()`: Evaluates all potential targets based on reachability and attackability
- `selectBestTarget()`: Chooses the best target prioritizing those that can be reached and attacked this round

**Targeting Priority System:**
1. **Reachability**: Targets that can be reached and attacked in the current round get highest priority
2. **Attackability**: Targets already in attack range get bonus priority
3. **Hit Ease**: Based on combat attribute comparison (attacker combat/ranged vs defender combat)
4. **Behavior-specific adjustments**: Each AI behavior type has specific targeting preferences

**Note**: AI focuses on which enemies are easiest to hit rather than considering threat levels.

**Hit Ease Calculation:**
- **Melee AI**: Uses defender's combat value (lower = easier to hit)
- **Ranged AI**: Uses defender's combat value (lower = easier to hit)
- **Animal AI**: Uses defender's combat value (lower = easier to hit)
- Lower defender combat value = easier to hit = higher priority

### Movement (`movement.ts`)
Manages tactical movement decisions:
- `evaluateMovementOption()`: Scores a potential movement location
- `findBestMovement()`: Finds the best movement option
- `shouldMove()`: Determines if movement is beneficial
- `createMovementDecision()`: Creates a movement decision

### Combat (`combat.ts`)
Handles combat-related decisions:
- `createAttackDecision()`: Creates an attack decision
- `shouldFlee()`: Determines if the creature should flee
- `calculateTacticalBonus()`: Calculates tactical advantages

**Note**: Attack validation is handled by the shared `validateAttack()` function from the validation module.

### Decision Making (`decisionMaking.ts`)
Coordinates all AI decisions:
- `makeAIDecision()`: Main function that makes the final decision
- `executeAIDecision()`: Executes a decision
- `createAIStateForCreature()`: Creates AI state for a creature

## Usage Example

```typescript
import { 
  makeAIDecision, 
  executeAIDecision, 
  createAIStateForCreature,
  AIContext 
} from './ai';

// Create AI state for a monster
const aiState = createAIStateForCreature(monster, monsterPreset);

// Create context for decision making
const context: AIContext = {
  ai: aiState,
  creature: monster,
  allCreatures: creatures,
  mapData: mapData,
  currentTurn: 1,
  reachableTiles: reachableTiles,
  targetsInRange: targetsInRange
};

// Make a decision
const decision = makeAIDecision(context);

// Execute the decision
const result = executeAIDecision(decision.action, context);

// Update AI state
aiState = result.newState;
```

## Behavior Types

- **MELEE**: Close combat focused, aggressive melee attacks, prefers to engage in hand-to-hand combat
- **RANGED**: Prefer ranged attacks, maintain distance, avoid close combat situations
- **ANIMAL**: Instinctive behavior, pack tactics, territorial, unpredictable but generally aggressive

## AI Turn System

The AI system includes a comprehensive turn management system that handles AI-controlled creatures acting at the end of each turn:

### Turn Flow
1. **Player Turn**: Player-controlled creatures take their actions
2. **End Turn**: Player clicks "End Turn" button
3. **AI Turn Phase**: All AI-controlled creatures act, one group at a time:
   - **Enemy Group**: All enemy creatures act first
   - **Neutral Group**: All neutral creatures act second
   - **Group Coordination**: Within each group, creatures act in agility order (highest first)
4. **Turn Complete**: New turn begins with all creatures reset

### AI Turn Management Functions

- `startAITurnPhase()`: Initiates AI turn phase and determines group order
- `continueAITurnPhase()`: Executes turns for current group and advances to next group
- `executeAITurnsForGroup()`: Executes all turns for creatures in a specific group
- `executeAITurnForCreature()`: Executes a single AI creature's turn (can perform multiple actions)
- `isAITurnPhaseComplete()`: Checks if all AI groups have finished their turns

### Multi-Action Turns

AI creatures can now perform multiple actions in a single turn:
- **Movement + Attack**: If a creature has enough actions, it can move and then attack
- **Action Management**: The AI will continue taking actions until it runs out of actions or can't perform any more
- **Dynamic Context**: After each action, the AI recalculates reachable tiles and targets in range
- **Smart Sequencing**: The AI prioritizes attacking if it can, but will move first if needed to get in range

### Integration

To integrate AI into the game:

1. Add AI state to monster creatures
2. Use `endTurnWithAI()` instead of simple turn reset
3. The system automatically handles AI decision-making and execution
4. AI state is updated after each decision

The AI system is designed to work with the existing game mechanics and can be easily extended with new behaviors and decision-making logic.
