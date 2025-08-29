# AI System

The AI system provides intelligent behavior for non-player-controlled creatures in the game. It includes decision-making, targeting, movement, and combat logic.

## Core Components

### AI State Management
- **AIState**: Tracks current target, threat assessment, and tactical memory
- **AIBehaviorType**: Defines different behavior patterns (MELEE, RANGED, ANIMAL)
- **AIDecision**: Represents a single decision (move, attack, wait, flee, special)

### Decision Making
- **makeAIDecision()**: Main decision-making function that evaluates all possible actions
- **executeAIDecision()**: Executes the chosen decision and updates AI state
- **shouldContinueTurnAfterKill()**: Determines if an AI creature should continue its turn after killing a target

### Targeting
- **selectBestTarget()**: Chooses the most suitable target based on distance, behavior, and combat effectiveness
- **evaluateTargets()**: Ranks all potential targets by priority
- **isTargetValid()**: Checks if a target is still alive and hostile

### Movement
- **findBestMovement()**: Calculates optimal movement path to reach target
- **evaluateMovementOption()**: Scores different movement options
- **createMovementDecision()**: Creates movement decisions with reasoning

### Combat

- **shouldFlee()**: Determines if creature should flee based on health and threats
- **updateAIStateAfterAttack()**: Updates AI state after combat actions

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

### Target Switching After Kills

A key feature of the AI system is the ability for AI creatures to continue their turn after killing a target:

- **Automatic Target Selection**: When an AI creature kills its current target, it automatically selects a new target if available
- **Movement Continuation**: If the creature has remaining movement after killing a target, it will move toward the new target
- **Smart Decision Making**: The AI evaluates whether to continue its turn based on remaining movement and available targets
- **Clear Messaging**: The system provides clear feedback when an AI creature switches targets

#### Movement Rules:
- **No Unnecessary Movement**: AI creatures will not move when they are already in attack range of their target
- **Attack Priority**: When in attack range, AI creatures will attack immediately rather than moving
- **Target Switching**: Only when a target is killed and the creature has remaining movement will it move to engage a new target
- **Tactical Movement**: Movement is only allowed when not in attack range or when switching to a new target after killing the current one

#### How It Works:
1. **Attack Execution**: AI creature attacks and kills its target
2. **Target Validation**: System checks if the killed target is still valid (alive and hostile)
3. **Target Clearing**: If target is dead, the AI state clears the current target
4. **New Target Selection**: AI automatically selects the best available target
5. **Movement Decision**: If the creature has remaining movement, it moves toward the new target
6. **Turn Continuation**: The AI continues its turn until it runs out of actions or movement

This behavior makes AI creatures much more dynamic and effective in combat, as they can eliminate multiple targets in a single turn when possible, while avoiding unnecessary movement when already in position to attack.

### Integration

To integrate AI into the game:

1. Add AI state to monster creatures
2. Use `endTurnWithAI()` instead of simple turn reset
3. The system automatically handles AI decision-making and execution
4. AI state is updated after each decision

The AI system is designed to work with the existing game mechanics and can be easily extended with new behaviors and decision-making logic.
