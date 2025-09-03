// --- Section Preset Types ---

export type SectionPreset = {
  image: string;
  mapWidth: number;
  mapHeight: number;
  outdoors?: boolean;
  terrain?: {
    id: string;
    x: number;
    y: number;
    rotation?: 0 | 90 | 180 | 270;
  }[];
  // Future extensibility
  properties?: Record<string, any>;
};

export type SectionPresetCategory = {
  presets: Record<string, SectionPreset>;
};
