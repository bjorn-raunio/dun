// --- Terrain Preset Types ---

export type TerrainPreset = {
  image: string;
  mapWidth: number;
  mapHeight: number;
  height: number;
  movementCost?: number; // Movement cost multiplier for this terrain type
  // Future extensibility
  properties?: Record<string, any>;
};

export type TerrainPresetCategory = {
  presets: Record<string, TerrainPreset>;
};
