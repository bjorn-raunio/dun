# Pathfinding System

This directory contains the reorganized pathfinding system, split into focused modules for better maintainability and organization.

## Module Structure

### Core Modules

- **`core.ts`** - Main A* pathfinding algorithms (`PathfindingSystem`)
- **`lineOfSight.ts`** - Line of sight and visibility calculations (`LineOfSightSystem`)
- **`distance.ts`** - Distance calculations and positioning utilities (`DistanceSystem`)

### Support Modules

- **`types.ts`** - Type definitions and interfaces
- **`constants.ts`** - Constants and configuration values
- **`helpers.ts`** - Utility functions used across modules
- **`index.ts`** - Main export file with backward compatibility

## Key Improvements

### 1. **Separation of Concerns**
- **Core pathfinding** is now isolated in `core.ts`
- **Line of sight** calculations are in `lineOfSight.ts`
- **Distance utilities** are in `distance.ts`

### 2. **Better Code Organization**
- Each module has a single responsibility
- Helper functions are centralized and reusable
- Constants are centralized and easily configurable

### 3. **Improved Maintainability**
- Smaller, focused files are easier to understand and modify
- Clear interfaces between modules
- Reduced coupling between different functionalities

### 4. **Backward Compatibility**
- All existing imports continue to work
- Legacy function names are preserved
- Gradual migration path available

## Usage Examples

### Basic Pathfinding
```typescript
import { PathfindingSystem } from './pathfinding';

const result = PathfindingSystem.getReachableTiles(
  creature, allCreatures, mapData, cols, rows, mapDefinition
);
```

### Line of Sight
```typescript
import { LineOfSightSystem } from './pathfinding';

const hasLOS = LineOfSightSystem.hasLineOfSight(
  fromX, fromY, toX, toY, mapData, cols, rows, mapDefinition
);
```

### Distance Calculations
```typescript
import { DistanceSystem } from './pathfinding';

const distance = DistanceSystem.calculateDistanceBetween(
  fromX, fromY, toX, toY, { usePathfinding: true, mapData, cols, rows, allCreatures }
);
```

## Migration Guide

### Before (Old Structure)
```typescript
import { PathfindingSystem } from './pathfinding';

// All functionality was in one large class
const result = PathfindingSystem.getReachableTiles(...);
const hasLOS = PathfindingSystem.hasLineOfSight(...);
const distance = PathfindingSystem.calculateDistanceBetween(...);
```

### After (New Structure)
```typescript
import { PathfindingSystem, LineOfSightSystem, DistanceSystem } from './pathfinding';

// Use appropriate system for each task
const result = PathfindingSystem.getReachableTiles(...);
const hasLOS = LineOfSightSystem.hasLineOfSight(...);
const distance = DistanceSystem.calculateDistanceBetween(...);
```

### Backward Compatibility
```typescript
// These still work exactly as before
import { 
  getReachableTiles, 
  hasLineOfSight, 
  calculateDistanceBetween 
} from './pathfinding';
```

## Benefits of New Organization

1. **Easier Testing** - Each module can be tested independently
2. **Better Code Reviews** - Smaller, focused changes
3. **Improved Debugging** - Issues are isolated to specific modules
4. **Easier Refactoring** - Changes to one area don't affect others
5. **Better Documentation** - Each module has a clear purpose
6. **Reduced Cognitive Load** - Developers can focus on one aspect at a time

## Future Improvements

- Consider extracting terrain analysis into a separate module
- Add performance profiling and optimization hooks
- Implement caching strategies for expensive calculations
- Add more comprehensive error handling and validation
