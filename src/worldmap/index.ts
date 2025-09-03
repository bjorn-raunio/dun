// Export all worldmap classes and types
export * from './types';
export { Region as RegionClass } from './Region';
export { WorldMap as WorldMapClass } from './WorldMap';
export * from './presets';

// Convenience exports
export { createSampleWorldMap, createCustomWorldMap, createSimpleRegion, createConnection } from './presets';
