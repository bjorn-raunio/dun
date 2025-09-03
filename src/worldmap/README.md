# WorldMap and Region System

This module provides a comprehensive system for managing world maps with connected regions in a game.

## Overview

The system consists of three main classes:
- **Region**: Represents individual areas in the world
- **WorldMap**: Manages the overall world and its regions
- **RegionConnection**: Defines connections between regions

## Features

### Region Class
- **Properties**: ID, name, description, image, position, size, type, difficulty, etc.
- **Connections**: Manage connections to other regions
- **State**: Track exploration status and accessibility
- **Methods**: Add/remove connections, block/unblock paths, calculate distances

### WorldMap Class
- **Region Management**: Add, remove, and query regions
- **Travel System**: Navigate between connected regions
- **Pathfinding**: Find shortest paths between regions
- **Global State**: Weather, time of day, season, global events
- **Discovery**: Track explored vs. unexplored regions

### Connection Types
- **Road**: Paved paths (fastest travel)
- **Path**: Dirt trails (standard travel)
- **River**: Water routes (unique travel mechanics)
- **Mountain Pass**: High-altitude routes (challenging)
- **Sea**: Ocean routes (long-distance travel)

## Usage Examples

### Creating a World Map

```typescript
import { createSampleWorldMap, createCustomWorldMap } from './worldmap';

// Use the pre-built sample world
const worldMap = createSampleWorldMap();

// Or create a custom world
const customWorld = createCustomWorldMap(
  "My World",
  "A custom world description",
  regions,
  "starting_region_id"
);
```

### Working with Regions

```typescript
import { RegionClass } from './worldmap';

// Get a region
const region = worldMap.getRegion('region_id');

// Check connections
const connections = region.getAccessibleConnections();

// Travel to a new region
worldMap.travelToRegion('target_region_id', connection);
```

### Adding New Regions

```typescript
import { createSimpleRegion, createConnection } from './worldmap';

// Create a new region
const newRegion = createSimpleRegion(
  'new_region',
  'New Region Name',
  'forest',
  { x: 100, y: 100 },
  { width: 80, height: 60 },
  3 // difficulty
);

// Add it to the world
worldMap.addRegion(newRegion);

// Create a connection
const connection = createConnection(
  'target_region_id',
  'path',
  2, // distance
  false // not blocked
);

// Add the connection
newRegion.addConnection(connection);
```

## Sample World

The system includes a pre-built sample world with 6 regions:

1. **Starting Village** - A peaceful village (Difficulty: 1)
2. **Dark Forest** - Dense forest with dangers (Difficulty: 3)
3. **Mountain Pass** - Treacherous mountain path (Difficulty: 5)
4. **Ancient Ruins** - Forgotten civilization (Difficulty: 7)
5. **Desert Oasis** - Lush area in the desert (Difficulty: 4)
6. **Coastal City** - Bustling port city (Difficulty: 2)

## Integration with Game

The WorldMap system can be integrated with your existing game by:

1. **Adding worldmap state** to your game context
2. **Using the WorldMapView component** for visual display
3. **Implementing travel mechanics** when players move between regions
4. **Adding region-specific encounters** and resources

## Components

### WorldMapView
The main component for displaying the world map with zoom and pan functionality.

### RegionOverlay
Displays regions as clickable areas with visual indicators for:
- Current region (blue border)
- Explored regions (green border)
- Unexplored regions (gray border)

### ConnectionOverlay
Shows connections between regions with:
- Different line styles for connection types
- Distance labels
- Arrow indicators

## Future Enhancements

- **Dynamic Events**: Region-specific events and quests
- **Weather Effects**: Impact on travel and exploration
- **Resource Management**: Collecting and using region resources
- **Faction System**: Different groups controlling regions
- **Time-based Changes**: Regions that change over time
