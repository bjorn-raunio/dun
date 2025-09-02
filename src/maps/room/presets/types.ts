// --- Room Preset Types ---
import { TerrainFactoryType } from '../../terrain/presets/factory';

export type RoomPreset = {
  image: string;
  mapWidth: number;
  mapHeight: number;
  outdoors?: boolean;
  terrain?: TerrainFactoryType[];
  // Future extensibility
  properties?: Record<string, any>;
};

export type RoomPresetCategory = {
  presets: Record<string, RoomPreset>;
};
