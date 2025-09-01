# Terrain System

The terrain system provides a class-based approach to managing terrain objects on maps, similar to how rooms work.

## Overview

The terrain system consists of:
- `Terrain` class - represents individual terrain objects
- Preset system - predefined terrain configurations with movement costs
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
- `movementCost`: Movement cost multiplier for this terrain type
- `blocksLineOfSight`: Whether terrain blocks line of sight

### Methods

- `isTileWithinTerrain(x, y)`: Check if a tile position is within this terrain
- `getHeightAt(x, y)`: Get terrain height at a specific position
- `getMovementCostAt(x, y)`: Get terrain movement cost at a specific position
- `blocksLineOfSightAt(x, y)`: Check if terrain blocks line of sight at a position

## Movement Cost System

Terrain now affects movement costs, making the game more tactical:

- **Movement Cost Multiplier**: Each terrain type has a movement cost multiplier
- **Base Cost**: Normal terrain has a cost of 1 (no penalty)
- **Difficult Terrain**: Forests, mountains, and rocks increase movement cost
- **Impassable Terrain**: Walls and buildings block movement entirely (cost = Infinity)
- **Beneficial Terrain**: Roads reduce movement cost (cost = 0.5)

### Movement Cost Examples

- **Easy Terrain**: Roads (0.5x), open ground (1x)
- **Moderate Terrain**: Trees (2x), rocks (2x), shallow water (2x)
- **Difficult Terrain**: Mountains (3x), dense forest (2x)
- **Impassable**: Walls (∞), buildings (∞), deep water (∞)

## Preset System

Terrain presets are organized by categories with movement costs:

### Vegetation
- `tree`: 2x2, height 4, movement cost 2, blocks line of sight
- `forest`: 1x1, height 4, movement cost 2, blocks line of sight

### Structures
- `wall`: 1x1, height 3, movement cost ∞, blocks line of sight
- `building`: 4x4, height 4, movement cost ∞, blocks line of sight

### Vehicles
- `wagon`: 1x2, height 1, movement cost 1, doesn't block line of sight
- `horse`: 1x2, height 1, movement cost 1, doesn't block line of sight

### Natural
- `mountain`: 3x3, height 5, movement cost 3, blocks line of sight
- `rock`: 1x1, height 2, movement cost 2, doesn't block line of sight

### Water
- `shallow_water`: 1x1, height 0, movement cost 2, doesn't block line of sight
- `deep_water`: 1x1, height 0, movement cost ∞, blocks movement

### Roads
- `dirt_road`: 1x1, height 0, movement cost 0.5, doesn't block line of sight
- `paved_road`: 1x1, height 0, movement cost 0.5, doesn't block line of sight

## Integration with Movement System

The terrain movement cost system integrates with the existing movement cost calculation:

1. **Base Movement Cost**: Each tile has a base cost of 1
2. **Terrain Multiplier**: Terrain types multiply this base cost
3. **Elevation Costs**: Climbing still adds additional movement cost
4. **Combined Calculation**: Final cost = terrain_cost + elevation_penalty

### Example Movement Cost Calculation

Moving from open ground (cost 1) to a tree (cost 2) with elevation 1:
- Base terrain cost: 2
- Elevation penalty: 1
- Total movement cost: 3

## Factory Functions

### createTerrain(presetId, x, y, overrides?)

Creates a terrain instance from a preset with optional overrides:

```typescript
const tree = createTerrain("tree", 5, 5);
const wagon = createTerrain("wagon", 10, 10, { rotation: 90 });
const customMountain = createTerrain("mountain", 15, 15, { 
  movementCost: 4, // Custom higher movement cost
  height: 6 
});
```

### getAvailableTerrainPresets()

Returns an array of all available preset IDs.

### getTerrainPreset(presetId)

Returns a specific terrain preset configuration.

## Usage in Game Logic

Terrain movement costs are automatically considered by:

- `calculateMovementCost()` - Main movement cost calculation
- `getTileCost()` - Individual tile cost calculation
- Pathfinding algorithms
- AI movement decisions
- Player movement validation

The system ensures that difficult terrain creates natural barriers and tactical considerations while maintaining the existing elevation and climbing mechanics.
