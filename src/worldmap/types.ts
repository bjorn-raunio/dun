// --- World Map Types ---

export interface RegionConnection {
  targetRegionId: string;
  connectionType: 'road' | 'path' | 'river' | 'mountain_pass' | 'sea';
  distance: number; // Travel time or distance between regions
  isBlocked: boolean; // Whether the connection is currently blocked
  blockReason?: string; // Why the connection is blocked
}

export interface Region {
  id: string;
  name: string;
  vertices: Array<{ x: number; y: number }>; // Vertices defining the region's shape (absolute world coordinates)
  connections: RegionConnection[]; // Connections to other regions
  type: 'forest' | 'mountain' | 'plains' | 'desert' | 'swamp' | 'city' | 'village' | 'dungeon' | 'wilderness';
  isExplored: boolean; // Whether the player has explored this region
  isAccessible: boolean; // Whether the region is currently accessible
  requirements?: string[]; // Requirements to access this region
  encounters?: string[]; // Possible encounters in this region
  resources?: string[]; // Resources available in this region
  questMapPresets?: string[]; // Array of quest map preset IDs available in this region
}

export interface WorldMap {
  id: string;
  name: string;
  description: string;
  backgroundImage: string; // The main worldmap.jpg image
  regions: Map<string, Region>; // All regions in the world
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
  worldMap: WorldMap;
  currentRegion: Region | null;
  availableConnections: RegionConnection[];
  travelHistory: Array<{
    fromRegionId: string;
    toRegionId: string;
    timestamp: number;
    connectionUsed: RegionConnection;
  }>;
}
