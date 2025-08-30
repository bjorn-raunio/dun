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

### 5. **Enhanced Line of Sight (NEW!)**
- **Replaced Bresenham's algorithm** with DDA (Digital Differential Analyzer)
- **Better tile coverage** - no more missed obstacles or terrain
- **More accurate visibility calculations** for complex terrain
- **Configurable algorithms** for different use cases

## Line of Sight Improvements

### Problem with Bresenham's Algorithm
The original implementation used Bresenham's line algorithm, which only samples discrete points along a line and may miss tiles that the line actually overlaps. This can lead to incorrect line-of-sight calculations where obstacles are missed.

### New DDA Algorithm
The new implementation uses a Digital Differential Analyzer approach that:
- Steps through every tile the line intersects
- Ensures maximum tile coverage
- Provides more accurate obstacle detection
- Maintains good performance

### Benefits
- **More accurate line-of-sight calculations**
- **No missed obstacles or terrain**
- **Better performance for complex terrain**
- **Maintains backward compatibility**

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

// Use default DDA algorithm (recommended)
const hasLOS = LineOfSightSystem.hasLineOfSight(
  fromX, fromY, toX, toY, mapData, cols, rows, mapDefinition
);

// Use specific algorithm if needed
const hasLOS = LineOfSightSystem.hasLineOfSight(
  fromX, fromY, toX, toY, mapData, cols, rows, mapDefinition,
  { algorithm: 'dda' } // 'dda', 'raybox', or 'bresenham'
);
```

### Distance Calculations
```typescript
import { DistanceSystem } from './pathfinding';

const distance = DistanceSystem.calculateDistanceToCreature(
  fromX, fromY, target, options
);
```

## Testing

A test file `lineOfSightTest.ts` is included to demonstrate the difference between the old Bresenham algorithm and the new DDA algorithm. Run it to see how the new algorithm provides better tile coverage.

## Migration Guide

### For Existing Code
No changes are required - the new algorithm is used by default and provides better results.

### For New Code
Use the default DDA algorithm for best results:
```typescript
const hasLOS = LineOfSightSystem.hasLineOfSight(fromX, fromY, toX, toY, mapData, cols, rows);
```

### For Performance-Critical Applications
If you need the fastest possible algorithm and can accept some accuracy trade-offs, you can still use Bresenham:
```typescript
const hasLOS = LineOfSightSystem.hasLineOfSight(
  fromX, fromY, toX, toY, mapData, cols, rows, mapDefinition,
  { algorithm: 'bresenham' }
);
```
