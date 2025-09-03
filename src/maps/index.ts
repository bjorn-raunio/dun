// Export all map-related functionality
export * from './types';
export * from './mapDefinitions';
export * from './section/presets';
export { Terrain as TerrainClass, createTerrain, getAvailableTerrainPresets, getTerrainPreset, getTerrainPresetsByCategory } from './terrain';
