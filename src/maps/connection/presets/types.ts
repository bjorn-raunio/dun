// --- Connection Preset Types ---

export type ConnectionPreset = {
  image: string;
  openImage?: string;
  mapWidth: number;
  mapHeight: number;
  door?: boolean;
  // Future extensibility
  properties?: Record<string, any>;
};

export type ConnectionPresetCategory = {
  presets: Record<string, ConnectionPreset>;
};
