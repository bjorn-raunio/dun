// --- Map and Terrain Type Definitions ---
import { Creature } from '../creatures/index';
import { Room } from './room';



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

export type TerrainType = {
  blocksLineOfSight?: boolean;
  height?: number;
  image?: string;
  mapWidth?: number;
  mapHeight?: number;
};

export type MapDefinition = {
  name: string;
  width: number;
  height: number;
  rooms: Room[];
  terrain: Terrain[];
  creatures: Creature[]; // Array of creatures on the map
  startingTiles: Array<{ x: number; y: number; name?: string }>; // Designated starting positions for heroes
  terrainTypes?: Record<string, TerrainType>; // Terrain type definitions for line of sight and other properties
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
