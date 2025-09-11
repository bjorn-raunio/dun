// --- World Map Types ---

import { QuestMapPreset } from '../maps';
import { WorldLocation } from './locations';

export interface RegionConnection {
  targetRegionId: string;
}

export interface IRegion {
  id: string;
  name: string;
  vertices: Array<{ x: number; y: number }>; // Vertices defining the region's shape (absolute world coordinates)
  connections: RegionConnection[]; // Connections to other regions
  type: 'forest' | 'mountain' | 'plains' | 'desert' | 'swamp' | 'volcano' | 'glacier' | 'ocean' | 'river';
  isExplored: boolean; // Whether the player has explored this region
  isAccessible: boolean; // Whether the region is currently accessible
  requirements?: string[]; // Requirements to access this region
  encounters?: string[]; // Possible encounters in this region
  resources?: string[]; // Resources available in this region
  locations?: WorldLocation[]; // Locations within this region
}

export interface IWorldMap {
  id: string;
  name: string;
  description: string;
  backgroundImage: string; // The main worldmap.jpg image
  regions: Map<string, IRegion>; // All regions in the world
  startingRegionId: string; // The region where the player starts
  discoveredRegions: Set<string>; // Regions the player has discovered
  globalEvents: string[]; // World-wide events affecting multiple regions
  weather: {
    current: string;
    forecast: string[];
  };
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface WorldMapState {
  worldMap: IWorldMap;
  currentRegion: IRegion | null;
  availableConnections: RegionConnection[];
  travelHistory: Array<{
    fromRegionId: string;
    toRegionId: string;
    timestamp: number;
    connectionUsed: RegionConnection;
  }>;
}
