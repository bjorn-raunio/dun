// --- Map and Terrain Type Definitions ---

export type RoomType = {
  type: string; // e.g. "room1", "room2", "corridor"
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
  rotation?: 0 | 90 | 180 | 270; // Rotation property
};

export type Terrain = {
  // Either use a reusable preset (preferred) or a raw type key
  preset?: string; // references a reusable terrain type definition
  type?: string; // legacy key; will be looked up in presets if present
  x?: number; // optional for preset definitions
  y?: number; // optional for preset definitions
  mapWidth?: number; // can be overridden; falls back to preset
  mapHeight?: number; // can be overridden; falls back to preset
  rotation?: 0 | 90 | 180 | 270;
  image?: string; // override image if desired
  height?: number; // optional vertical height/elevation of terrain
};

export type MapDefinition = {
  name: string;
  description: string;
  width: number;
  height: number;
  rooms: RoomType[];
  terrain: Terrain[];
  creatures: any[]; // Will be properly typed when we import Creature
};

export type ResolvedTerrain = {
  key: string;
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
  rotation: 0 | 90 | 180 | 270;
  image: string;
  height: number;
};
