# Centralized Validation Utilities

This module provides a comprehensive set of validation utilities to reduce code duplication and standardize validation patterns across the codebase.

## Overview

The `src/utils/validation.ts` module consolidates common validation patterns and provides:

- **Standardized validation functions** for common checks
- **Centralized error messages** for consistency
- **Composite validation functions** that combine multiple checks
- **Utility functions** for chaining and creating validation results

## Key Features

### 1. Standardized Error Messages

All validation error messages are centralized in `VALIDATION_MESSAGES` for consistency:

```typescript
import { VALIDATION_MESSAGES } from './validation';

// Instead of hardcoding messages
return { isValid: false, reason: `${creature.name} is dead and cannot move.` };

// Use standardized messages
return { isValid: false, reason: VALIDATION_MESSAGES.CREATURE_DEAD(creature.name, 'move') };
```

### 2. Basic Validation Functions

#### Creature State Validation

```typescript
import { 
  validateCreatureAlive, 
  validateActionsRemaining, 
  validateMovementPoints 
} from './validation';

// Check if creature is alive
const aliveCheck = validateCreatureAlive(creature, 'attack');
if (!aliveCheck.isValid) return aliveCheck;

// Check if creature has actions remaining
const actionsCheck = validateActionsRemaining(creature);
if (!actionsCheck.isValid) return actionsCheck;

// Check if creature has enough movement points
const movementCheck = validateMovementPoints(creature, 2);
if (!movementCheck.isValid) return movementCheck;
```

#### Combat Validation

```typescript
import { validateTargetHostile, validateTargetVisible } from './validation';

// Check if target is hostile
const hostileCheck = validateTargetHostile(attacker, target);
if (!hostileCheck.isValid) return hostileCheck;

// Check if target is visible
const visibleCheck = validateTargetVisible(target);
if (!visibleCheck.isValid) return visibleCheck;
```

#### Equipment Validation

```typescript
import { validateItemInInventory, validateItemEquippable } from './validation';

// Check if creature has item in inventory
const inventoryCheck = validateItemInInventory(creature, item);
if (!inventoryCheck.isValid) return inventoryCheck;

// Check if item is equippable
const equippableCheck = validateItemEquippable(item, isItemEquippable);
if (!equippableCheck.isValid) return equippableCheck;
```

### 3. Composite Validation Functions

These functions combine multiple basic validations:

```typescript
import { validateCreatureCanAct, validateCreatureCanMove, validateCreatureCanEquip } from './validation';

// Check if creature can perform any action (alive + has actions)
const canActCheck = validateCreatureCanAct(creature, 'attack');
if (!canActCheck.isValid) return canActCheck;

// Check if creature can move (alive + has movement points)
const canMoveCheck = validateCreatureCanMove(creature, 2);
if (!canMoveCheck.isValid) return canMoveCheck;

// Check if creature can equip an item (alive + has item + item is equippable)
const canEquipCheck = validateCreatureCanEquip(creature, item, isItemEquippable);
if (!canEquipCheck.isValid) return canEquipCheck;
```

### 4. Utility Functions

#### Chaining Validations

```typescript
import { chainValidations } from './validation';

// Chain multiple validations together
const result = chainValidations(
  validateCreatureAlive(creature, 'move'),
  validateMovementPoints(creature, 1),
  validateCondition(isWithinBounds, 'Position is out of bounds')
);

if (!result.isValid) return result;
```

#### Creating Validation Results

```typescript
import { createSuccessResult, createFailureResult, validateCondition } from './validation';

// Create success result with optional data
const success = createSuccessResult({ distance: 5 });

// Create failure result
const failure = createFailureResult('Custom error message');

// Validate a condition
const conditionCheck = validateCondition(
  distance <= maxRange, 
  'Target is out of range'
);
```

#### Array Validation

```typescript
import { validateArrayNotEmpty, validateArrayNoDuplicates } from './validation';

// Check if array is not empty
const notEmptyCheck = validateArrayNotEmpty(creatures, 'creatures list');
if (!notEmptyCheck.isValid) return notEmptyCheck;

// Check if array has no duplicates
const noDuplicatesCheck = validateArrayNoDuplicates(
  creatureIds, 
  'creature IDs',
  (id) => id // Use the ID itself as the key
);
if (!noDuplicatesCheck.isValid) return noDuplicatesCheck;
```

## Migration Guide

### Before (Old Pattern)

```typescript
export function validateAttack(attacker: Creature, target: Creature): CombatValidationResult {
  // Check if attacker is alive
  if (!attacker.isAlive()) {
    return {
      isValid: false,
      reason: `${attacker.name} is dead and cannot attack.`
    };
  }

  // Check if attacker has actions remaining
  if (!attacker.hasActionsRemaining()) {
    return {
      isValid: false,
      reason: `${attacker.name} has no actions remaining.`
    };
  }

  // Check if target is alive
  if (!target.isAlive()) {
    return {
      isValid: false,
      reason: `${target.name} is already dead.`
    };
  }

  return { isValid: true };
}
```

### After (New Pattern)

```typescript
import { validateCreatureCanAct, VALIDATION_MESSAGES } from './validation';

export function validateAttack(attacker: Creature, target: Creature): CombatValidationResult {
  // Use centralized validation for basic checks
  const canActCheck = validateCreatureCanAct(attacker, 'attack');
  if (!canActCheck.isValid) return canActCheck;

  // Check if target is alive
  if (!target.isAlive()) {
    return {
      isValid: false,
      reason: VALIDATION_MESSAGES.CREATURE_ALREADY_DEAD(target.name)
    };
  }

  return { isValid: true };
}
```

## Benefits

1. **Reduced Code Duplication**: Common validation patterns are centralized
2. **Consistent Error Messages**: All validation errors use the same format and style
3. **Easier Maintenance**: Changes to validation logic only need to be made in one place
4. **Better Type Safety**: TypeScript interfaces ensure consistent validation result structure
5. **Improved Readability**: Validation functions are self-documenting and reusable
6. **Easier Testing**: Individual validation functions can be tested in isolation

## Best Practices

1. **Use composite functions** when possible instead of chaining basic validations
2. **Import only what you need** to keep bundle size small
3. **Use `VALIDATION_MESSAGES`** for all error messages to maintain consistency
4. **Chain validations** using `chainValidations()` for complex validation logic
5. **Create custom validation functions** in this module if they're used in multiple places

## Examples

See the updated `src/utils/combatUtils.ts` and `src/validation/movement.ts` files for real-world examples of how to use these validation utilities.
