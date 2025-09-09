// Export all map-related functionality
export * from './types';
export * from './section/presets';
export * from './presets';
export { MapObject } from './MapObject';
export { Terrain as TerrainClass, createTerrain, getAvailableTerrainPresets, getTerrainPreset, getTerrainPresetsByCategory } from './terrain';
export { Connection as ConnectionClass } from './connection/connection';
export { Door as DoorClass } from './connection/Door';
export { 
  createConnection, 
  getAvailableConnectionPresets, 
  getConnectionPreset,
} from './connection/presets';
