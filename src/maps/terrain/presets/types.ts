// --- Terrain Preset Types ---

export type TerrainPreset = {
  image: string;
  mapWidth: number;
  mapHeight: number;
  height: number;
  // Future extensibility
  properties?: Record<string, any>;
};

export type TerrainPresetCategory = {
  presets: Record<string, TerrainPreset>;
};
