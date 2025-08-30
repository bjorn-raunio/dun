# Movement Cost System Consolidation

## Overview

The movement cost calculation system has been consolidated into a single, flexible, and maintainable architecture. This consolidation eliminates redundant code and provides a unified interface for all movement cost calculations.

## What Was Consolidated

### Before (Redundant Functions)
1. **`calculateMovementCost`** in `src/utils/movementCost.ts`
   - Handled single-tile movement with diagonal corner rule
   - Basic terrain and creature blocking checks
   
2. **`calculateMoveCostInto`** in `src/utils/pathfinding/helpers.ts`
   - Handled multi-tile area movement costs
   - Duplicated elevation difference logic
   - Similar terrain height checking

3. **`getTerrainCost`** in `src/utils/movementCost.ts`
   - Basic terrain cost calculation
   - Hardcoded elevation limits

### After (Consolidated System)
1. **`calculateMovementCost`** - Unified single-tile movement cost calculation
2. **`calculateAreaMovementCost`** - Multi-tile area movement cost calculation
3. **`getTerrainCost`** - Enhanced terrain cost calculation with options
4. **`MovementCostOptions`** - Flexible configuration interface

## New Architecture

### Core Functions

#### `calculateMovementCost(fromX, fromY, toX, toY, allCreatures, mapData, mapDefinition, options)`
- **Purpose**: Calculate movement cost for single-tile movement
- **Features**: 
  - Diagonal corner rule checking (configurable)
  - Creature blocking (configurable)
  - Terrain elevation differences
  - Flexible cost options

#### `calculateAreaMovementCost(fromX, fromY, toX, toY, dimensions, allCreatures, mapData, cols, rows, mapDefinition, options)`
- **Purpose**: Calculate movement cost for multi-tile areas (large creatures)
- **Features**:
  - Area-based terrain analysis
  - Maximum height calculation
  - Standable tile validation
  - Unified elevation difference handling
  - **Single climbing cost application** - Applies climbing penalty only once per area, not per tile

#### `getTerrainCost(x, y, mapData, mapDefinition, fromX, fromY, options)`
- **Purpose**: Calculate terrain-specific movement costs
- **Features**:
  - Configurable elevation limits
  - Flexible climbing penalties
  - Bounds checking options

### Configuration Options

```typescript
interface MovementCostOptions {
  checkDiagonalCornerRule?: boolean;    // Default: true
  considerCreatures?: boolean;           // Default: true
  baseCost?: number;                     // Default: 1
  maxElevationDifference?: number;       // Default: 1
  climbingCostPenalty?: number;          // Default: 1
  returnInfinityForBlocked?: boolean;    // Default: true
}
```

### Constants

```typescript
export const DEFAULT_MOVEMENT_OPTIONS = {
  baseCost: 1,
  maxElevationDifference: 1,
  climbingCostPenalty: 1,
  checkDiagonalCornerRule: true,
  considerCreatures: true,
  returnInfinityForBlocked: true
} as const;
```

## Benefits of Consolidation

### 1. **Eliminated Redundancy**
- Removed duplicate elevation difference logic
- Consolidated terrain height checking
- Unified movement cost calculation patterns

### 2. **Improved Flexibility**
- Configurable options for different use cases
- Easy to adjust movement rules globally
- Support for both single-tile and multi-tile movement

### 3. **Better Maintainability**
- Single source of truth for movement cost logic
- Easier to update movement rules
- Consistent behavior across the system

### 4. **Enhanced Features**
- Configurable diagonal movement rules
- Flexible creature blocking options
- Customizable elevation limits and climbing penalties

## Usage Examples

### Basic Single-Tile Movement
```typescript
const cost = calculateMovementCost(
  fromX, fromY, toX, toY, 
  allCreatures, mapData, mapDefinition
);
```

### Custom Movement Rules
```typescript
const cost = calculateMovementCost(
  fromX, fromY, toX, toY, 
  allCreatures, mapData, mapDefinition,
  {
    maxElevationDifference: 2,
    climbingCostPenalty: 2,
    checkDiagonalCornerRule: false
  }
);
```

### Multi-Tile Area Movement
```typescript
const cost = calculateAreaMovementCost(
  fromX, fromY, toX, toY,
  { w: 2, h: 2 }, // 2x2 creature
  allCreatures, mapData, cols, rows, mapDefinition
);
```

## Migration Guide

### For Existing Code
- **Single-tile movement**: Use `calculateMovementCost` with default options
- **Multi-tile movement**: Use `calculateAreaMovementCost` instead of `calculateMoveCostInto`
- **Custom rules**: Add options parameter to customize behavior

### Backward Compatibility
- All existing function signatures are maintained
- Default options provide the same behavior as before
- No breaking changes to existing functionality

## Future Enhancements

1. **Terrain Type Costs**: Support for different terrain types with varying costs
2. **Weather Effects**: Environmental factors affecting movement
3. **Creature Abilities**: Special movement capabilities (flying, swimming, etc.)
4. **Pathfinding Integration**: Direct integration with A* pathfinding for optimal routes

## Files Modified

- `src/utils/movementCost.ts` - Main consolidation and new functions
- `src/utils/pathfinding/helpers.ts` - Updated to use consolidated system
- `src/utils/pathfinding/core.ts` - Updated function calls
- `src/utils/pathfinding/constants.ts` - Added movement options constants

## Testing

The consolidated system has been tested with:
- ✅ Build compilation
- ✅ No breaking changes to existing functionality
- ✅ Consistent behavior across different movement scenarios
- ✅ Flexible configuration options working correctly
- ✅ **Fixed double climbing cost bug** - Area movement now applies climbing cost only once per area

This consolidation significantly improves the codebase quality while maintaining all existing functionality and adding new capabilities for future development.
