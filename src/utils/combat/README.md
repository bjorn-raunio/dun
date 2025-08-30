# Combat Utilities Module

This module provides a clean, organized interface for all combat-related functionality. The combat system has been refactored from a single large file (`combatUtils.ts`) into focused, maintainable modules.

## Module Structure

### `types.ts`
Contains all combat-related TypeScript interfaces and types:
- `CombatResult` - Main combat result interface
- `ToHitResult` - To-hit roll results for melee combat
- `RangedToHitResult` - To-hit roll results for ranged combat
- `BlockResult` - Shield block results
- `DamageResult` - Damage calculation results
- `CombatModifiers` - Combat bonus calculations
- `CombatRolls` - Combat roll data

### `calculations.ts`
Pure calculation functions and utilities:
- `calculateTargetsInRange()` - Find valid targets within weapon range
- `calculateDamage()` - Calculate final damage vs armor
- `determineHit()` - Determine if attack hits based on rolls and agility
- `isBackAttack()` - Check if attack is from behind
- `checkShieldBlock()` - Shield block mechanics
- `calculateCriticalDamage()` - Critical hit damage bonuses
- `calculateEffectiveArmor()` - Armor value calculations
- `calculateElevationBonus()` - Terrain elevation bonuses

### `phases.ts`
Implements the three-part combat system:
- **Phase 1: To-Hit Roll**
  - `executeToHitRollMelee()` - Melee combat to-hit calculations
  - `executeToHitRollRanged()` - Ranged combat to-hit calculations
- **Phase 2: Block Roll**
  - `executeBlockRoll()` - Shield block mechanics
- **Phase 3: Damage Roll**
  - `executeDamageRoll()` - Damage calculation and application

### `execution.ts`
Main combat orchestration:
- `executeCombat()` - Primary combat execution function
- `executeCombatPhase()` - Internal combat phase coordination

### `index.ts`
Clean public API that re-exports all necessary functions while maintaining backward compatibility.

## Benefits of This Organization

1. **Single Responsibility**: Each module has a clear, focused purpose
2. **Maintainability**: Easier to find and modify specific combat logic
3. **Testability**: Individual modules can be tested in isolation
4. **Reusability**: Calculation functions can be used independently
5. **Readability**: Clear separation of concerns makes code easier to understand
6. **Extensibility**: New combat features can be added to appropriate modules

## Usage

```typescript
import { executeCombat, calculateTargetsInRange } from '../utils/combat';

// Execute a combat attack
const result = executeCombat(attacker, target, allCreatures, mapDefinition);

// Find targets in range
const targets = calculateTargetsInRange(attacker, allCreatures);
```

## Migration from combatUtils.ts

The old `combatUtils.ts` file has been completely replaced. All existing imports will continue to work through the new module structure. The public API remains the same, ensuring backward compatibility.

## Future Improvements

- Add unit tests for each module
- Consider extracting combat state management to a separate module
- Add combat event system for better decoupling
- Implement combat result caching for performance
