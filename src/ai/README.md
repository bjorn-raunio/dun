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
- `AIBehaviorType`: Different behavior patterns (aggressive, defensive, cautious, etc.)
- `AIDecision`: Represents a decision made by the AI
- `AIState`: Tracks the AI's current state and memory
- `AIContext`: Provides context for AI decision making

### Targeting (`targeting.ts`)
Handles target evaluation and selection:
- `evaluateTargets()`: Evaluates all potential targets
- `selectBestTarget()`: Chooses the best target based on behavior and situation
- `calculateThreatLevel()`: Determines how dangerous a target is
- `calculateVulnerability()`: Determines how vulnerable a target is

### Movement (`movement.ts`)
Manages tactical movement decisions:
- `evaluateMovementOption()`: Scores a potential movement location
- `findBestMovement()`: Finds the best movement option
- `shouldMove()`: Determines if movement is beneficial
- `createMovementDecision()`: Creates a movement decision

### Combat (`combat.ts`)
Handles combat-related decisions:
- `shouldAttack()`: Determines if an attack should be made
- `createAttackDecision()`: Creates an attack decision
- `shouldFlee()`: Determines if the creature should flee
- `calculateTacticalBonus()`: Calculates tactical advantages

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

- **aggressive**: Always attacks when possible, prefers dangerous targets
- **defensive**: Prefers safe positions, avoids dangerous situations
- **cautious**: Only attacks when advantageous, prefers vulnerable targets
- **berserker**: Always attacks, ignores most risks
- **guard**: Stays in position, attacks if enemies approach
- **ambush**: Hides and waits for good opportunities
- **flee**: Tries to escape when in danger
- **patrol**: Moves in patterns
- **scout**: Gathers information
- **support**: Focuses on helping allies

## Integration

To integrate AI into the game:

1. Add AI state to monster creatures
2. Call `makeAIDecision()` during monster turns
3. Execute the returned decision
4. Update the AI state with the result

The AI system is designed to work with the existing game mechanics and can be easily extended with new behaviors and decision-making logic.
