// --- Room Preset Types ---

export type RoomPreset = {
  image: string;
  mapWidth: number;
  mapHeight: number;
  outdoors?: boolean;
  // Future extensibility
  properties?: Record<string, any>;
};

export type RoomPresetCategory = {
  presets: Record<string, RoomPreset>;
};
