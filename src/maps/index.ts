// Export all map-related functionality
export * from './types';
export * from './mapDefinitions';
export * from './mapRenderer';
export * from './room/presets';
export { Terrain as TerrainClass, createTerrain, getAvailableTerrainPresets, getTerrainPreset, getTerrainPresetsByCategory } from './terrain';
