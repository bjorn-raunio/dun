# MapView Component Architecture

The MapView component has been refactored from a single monolithic component into a collection of focused, single-responsibility components.

## Component Structure

```
MapView/
├── index.tsx           # Main orchestrator component
├── MapRenderer.tsx     # Core map rendering (rooms/blocks)
├── TerrainOverlay.tsx  # Terrain rendering with rotation
├── ReachableOverlay.tsx # Reachable tiles visualization
├── PathOverlay.tsx     # Path highlighting
├── CreatureOverlay.tsx # Creature rendering and interaction
├── types.ts            # Shared interfaces and types
└── README.md           # This documentation
```

## Component Responsibilities

### `index.tsx` (Main MapView)
- **Purpose**: Orchestrates all overlay components and handles overall layout
- **Responsibilities**: 
  - Event handling (mouse events)
  - Grid layout setup
  - Component composition
  - Ref management

### `MapRenderer.tsx`
- **Purpose**: Renders the base map structure including rooms and blocks
- **Responsibilities**:
  - Grid-based room rendering
  - Block rotation handling
  - Tile coordinate management
  - Rendering optimization (prevents duplicate tile rendering)

### `TerrainOverlay.tsx`
- **Purpose**: Renders terrain features on top of the base map
- **Responsibilities**:
  - Terrain image rendering
  - Rotation support for terrain
  - Z-index layering

### `ReachableOverlay.tsx`
- **Purpose**: Visualizes tiles that the selected creature can reach
- **Responsibilities**:
  - Conditional rendering (only shows when creature is selected)
  - Tile highlighting with visual styling
  - Z-index management

### `PathOverlay.tsx`
- **Purpose**: Highlights the current path being considered
- **Responsibilities**:
  - Path visualization
  - Conditional rendering
  - Visual styling for path tiles

### `CreatureOverlay.tsx`
- **Purpose**: Renders all creatures on the map
- **Responsibilities**:
  - Creature sprite rendering
  - Selection state visualization
  - Facing direction indicators
  - Click handling for creature interaction
  - Death state visualization

## Benefits of This Architecture

1. **Single Responsibility**: Each component has one clear purpose
2. **Maintainability**: Easier to modify individual features without affecting others
3. **Testability**: Components can be tested in isolation
4. **Reusability**: Overlay components can be reused in other contexts
5. **Performance**: Conditional rendering is more granular
6. **Readability**: Code is easier to understand and navigate

## Usage

The main MapView component is used exactly as before - all the complexity is hidden behind the same interface. The refactoring is purely internal and maintains backward compatibility.

## Future Improvements

- Add prop validation for better type safety
- Implement performance optimizations (React.memo, useMemo)
- Add unit tests for individual components
- Consider extracting common overlay patterns into a base component
