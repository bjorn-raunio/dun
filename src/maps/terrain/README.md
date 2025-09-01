# Terrain System

The terrain system provides a class-based approach to managing terrain objects on maps, similar to how rooms work.

## Overview

The terrain system consists of:
- `Terrain` class - represents individual terrain objects
- Preset system - predefined terrain configurations
- Factory functions - create terrain instances from presets

## Terrain Class

The `Terrain` class represents a terrain object with the following properties:

- `type`: The terrain type identifier (e.g., "tree", "wagon")
- `x`, `y`: Position coordinates
- `mapWidth`, `mapHeight`: Dimensions in tiles
- `rotation`: Rotation angle (0, 90, 180, 270 degrees)
- `rotatedWidth`, `rotatedHeight`: Dimensions after rotation
- `image`: Image file path
- `height`: Elevation height
- `blocksLineOfSight`: Whether terrain blocks line of sight

### Methods

- `isTileWithinTerrain(x, y)`: Check if a tile position is within this terrain
- `getHeightAt(x, y)`: Get terrain height at a specific position
- `blocksLineOfSightAt(x, y)`: Check if terrain blocks line of sight at a position

## Preset System

Terrain presets are organized by categories:

### Vegetation
- `tree`: 2x2, height 4, blocks line of sight
- `forest`: 1x1, height 4, blocks line of sight

### Structures
- `wall`: 1x1, height 3, blocks line of sight
- `building`: 4x4, height 4, blocks line of sight

### Vehicles
- `wagon`: 1x2, height 1, doesn't block line of sight
- `horse`: 1x2, height 1, doesn't block line of sight

### Natural
- `mountain`: 3x3, height 5, blocks line of sight
- `rock`: 1x1, height 2, doesn't block line of sight

## Factory Functions

### createTerrain(presetId, x, y, overrides?)

Creates a terrain instance from a preset with optional overrides:

```typescript
const tree = createTerrain("tree", 5, 5);
const wagon = createTerrain("wagon", 10, 10, { rotation: 90 });
```

### getAvailableTerrainPresets()

Returns an array of all available preset IDs.

### getTerrainPreset(presetId)

Returns a specific terrain preset configuration.

### getTerrainPresetsByCategory()

Returns terrain presets organized by category.

## Usage Example

```typescript
import { createTerrain } from './maps/terrain';

// Create terrain from presets
const mapDefinition = {
  // ... other properties
  terrain: [
    createTerrain("tree", 10, 5),
    createTerrain("wagon", 16, 4, { rotation: 90 }),
    createTerrain("horse", 18, 4, { rotation: 270 }),
  ],
};
```

## Integration

The terrain system integrates with:
- Map rendering (TerrainOverlay component)
- Movement cost calculations
- Line of sight calculations
- Pathfinding

## Migration from Old System

The old terrain system used simple objects with preset references. The new system:
- Creates actual Terrain class instances
- Provides better type safety
- Includes built-in methods for common operations
- Maintains backward compatibility through the existing Terrain type
