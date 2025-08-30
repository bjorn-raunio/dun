# Turn Management System

This directory contains the reorganized turn management system, split into focused modules for better maintainability and readability.

## File Organization

### `types.ts`
- Core interfaces and types for turn management
- `TurnState`, `AITurnState`, `TurnOrderConfig`, `TurnExecutionContext`

### `turnOrder.ts`
- Turn order calculation and creature comparison logic
- Functions for sorting creatures by priority (player first, ranged before melee, agility tiebreaker)
- Pure functions with no side effects

### `aiTurnExecution.ts`
- AI turn execution logic for individual creatures
- Handles the complex AI decision loop and action execution
- Separated into smaller, focused functions for better readability

### `aiTurnPhase.ts`
- AI turn phase management (starting, continuing, completing)
- Group-based AI execution coordination
- State management for AI turn phases

### `turnAdvancement.ts`
- Turn progression and creature advancement logic
- Functions for moving between creatures and turns
- State validation and creature action checking

### `index.ts`
- Re-exports all functions for easy importing
- Maintains the same public API as before

## Benefits of Reorganization

1. **Single Responsibility**: Each file has a clear, focused purpose
2. **Better Testability**: Smaller functions are easier to unit test
3. **Improved Readability**: Related logic is grouped together
4. **Easier Maintenance**: Changes to specific functionality are isolated
5. **Better Documentation**: Each module can be documented independently
6. **Reduced Complexity**: Large functions have been broken down into smaller, manageable pieces

## Usage

The public API remains unchanged - you can still import from the main `turnManagement.ts` file:

```typescript
import { 
  initializeTurnState, 
  executeAITurnForCreature, 
  advanceTurn 
} from './turnManagement';
```

## Migration Notes

- All existing imports will continue to work
- The original `turnManagement.ts` file now acts as a compatibility layer
- No breaking changes to the public API
- Internal implementation is now better organized and more maintainable
