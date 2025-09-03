import { WorldMap as WorldMapType, Region as RegionType, RegionConnection } from './types';
import { WorldMap } from './WorldMap';
import { Region } from './Region';

// --- Sample Region Data ---

export const SAMPLE_REGIONS: RegionType[] = [
  {
    id: 'starting_village',
    name: 'Starting Village',
    description: 'A peaceful village where your adventure begins. The villagers are friendly and helpful.',
    image: '/rooms/room1.jpg',
    position: { x: 100, y: 100 },
    size: { width: 80, height: 60 },
    connections: [],
    type: 'village',
    difficulty: 1,
    isExplored: true,
    isAccessible: true,
    encounters: ['friendly_villager', 'merchant'],
    resources: ['food', 'water', 'basic_supplies']
  },
  {
    id: 'dark_forest',
    name: 'Dark Forest',
    description: 'A dense forest shrouded in shadows. Strange sounds echo through the trees.',
    image: '/rooms/forest1.jpg',
    position: { x: 200, y: 80 },
    size: { width: 120, height: 100 },
    connections: [],
    type: 'forest',
    difficulty: 3,
    isExplored: false,
    isAccessible: true,
    encounters: ['wolf', 'bandit', 'mysterious_traveler'],
    resources: ['wood', 'herbs', 'mushrooms']
  },
  {
    id: 'mountain_pass',
    name: 'Mountain Pass',
    description: 'A treacherous path through the mountains. The air is thin and the wind howls.',
    image: '/rooms/room2.jpg',
    position: { x: 350, y: 50 },
    size: { width: 100, height: 80 },
    connections: [],
    type: 'mountain',
    difficulty: 5,
    isExplored: false,
    isAccessible: true,
    encounters: ['mountain_lion', 'rockfall', 'lost_traveler'],
    resources: ['iron_ore', 'precious_stones', 'mountain_herbs']
  },
  {
    id: 'ancient_ruins',
    name: 'Ancient Ruins',
    description: 'Crumbling stone structures from a forgotten civilization. Secrets lie within.',
    image: '/rooms/room1.jpg',
    position: { x: 480, y: 120 },
    size: { width: 90, height: 70 },
    connections: [],
    type: 'dungeon',
    difficulty: 7,
    isExplored: false,
    isAccessible: true,
    encounters: ['skeleton', 'ancient_trap', 'treasure_hunter'],
    resources: ['ancient_artifacts', 'gold', 'magical_items']
  },
  {
    id: 'desert_oasis',
    name: 'Desert Oasis',
    description: 'A lush green area surrounded by endless sand dunes. Water flows freely here.',
    image: '/rooms/forest2.jpg',
    position: { x: 600, y: 200 },
    size: { width: 70, height: 60 },
    connections: [],
    type: 'wilderness',
    difficulty: 4,
    isExplored: false,
    isAccessible: true,
    encounters: ['desert_nomad', 'scorpion', 'caravan'],
    resources: ['water', 'dates', 'desert_spices']
  },
  {
    id: 'coastal_city',
    name: 'Coastal City',
    description: 'A bustling port city with ships coming and going. Trade flourishes here.',
    image: '/rooms/room2.jpg',
    position: { x: 700, y: 300 },
    size: { width: 110, height: 90 },
    connections: [],
    type: 'city',
    difficulty: 2,
    isExplored: false,
    isAccessible: true,
    encounters: ['merchant', 'sailor', 'city_guard'],
    resources: ['trade_goods', 'fish', 'ship_parts']
  }
];

// --- Sample Connections ---

export const SAMPLE_CONNECTIONS: Array<{ from: string; to: string; connection: RegionConnection }> = [
  {
    from: 'starting_village',
    to: 'dark_forest',
    connection: {
      targetRegionId: 'dark_forest',
      connectionType: 'path',
      distance: 2,
      isBlocked: false
    }
  },
  {
    from: 'dark_forest',
    to: 'mountain_pass',
    connection: {
      targetRegionId: 'mountain_pass',
      connectionType: 'mountain_pass',
      distance: 4,
      isBlocked: false
    }
  },
  {
    from: 'mountain_pass',
    to: 'ancient_ruins',
    connection: {
      targetRegionId: 'ancient_ruins',
      connectionType: 'path',
      distance: 3,
      isBlocked: false
    }
  },
  {
    from: 'ancient_ruins',
    to: 'desert_oasis',
    connection: {
      targetRegionId: 'desert_oasis',
      connectionType: 'path',
      distance: 5,
      isBlocked: false
    }
  },
  {
    from: 'desert_oasis',
    to: 'coastal_city',
    connection: {
      targetRegionId: 'coastal_city',
      connectionType: 'road',
      distance: 6,
      isBlocked: false
    }
  }
];

// --- Sample World Map ---

export const SAMPLE_WORLD_MAP: WorldMapType = {
  id: 'sample_world',
  name: 'The Land of Adventure',
  description: 'A diverse world filled with mystery, danger, and opportunity. From peaceful villages to ancient ruins, adventure awaits around every corner.',
  backgroundImage: '/worldmap.jpg',
  regions: new Map(),
  startingRegionId: 'starting_village',
  discoveredRegions: new Set(['starting_village']),
  globalEvents: ['The Great Festival approaches', 'Rumors of ancient treasure spread'],
  weather: {
    current: 'clear',
    forecast: ['clear', 'partly_cloudy', 'rain']
  },
  timeOfDay: 'day',
  season: 'spring'
};

// --- Factory Functions ---

/**
 * Create a sample world map with all regions and connections
 * 
 * IMPORTANT: This function should only be called once during game initialization
 * to avoid creating multiple instances of the same world map.
 * It is called in gameReducer.ts getInitialGameState() function.
 * 
 * NOTE: In React Strict Mode (development), this function may be called twice,
 * but the gameReducer now caches the result to prevent multiple world map instances.
 */
export function createSampleWorldMap(): WorldMap {
  console.log('Creating sample world map');
  // Create the world map
  const worldMap = new WorldMap(SAMPLE_WORLD_MAP);
  
  // Add all regions
  SAMPLE_REGIONS.forEach(regionData => {
    const region = new Region(regionData);
    worldMap.addRegion(region);
  });
  
  // Add all connections
  SAMPLE_CONNECTIONS.forEach(({ from, to, connection }) => {
    const fromRegion = worldMap.getRegion(from);
    if (fromRegion) {
      fromRegion.addConnection(connection);
    }
  });
  
  return worldMap;
}

/**
 * Create a custom world map with specific regions
 */
export function createCustomWorldMap(
  name: string,
  description: string,
  regions: RegionType[],
  startingRegionId: string
): WorldMap {
  const worldMapData: WorldMapType = {
    id: `custom_${Date.now()}`,
    name,
    description,
    backgroundImage: '/worldmap.jpg',
    regions: new Map(),
    startingRegionId,
    discoveredRegions: new Set([startingRegionId]),
    globalEvents: [],
    weather: {
      current: 'clear',
      forecast: ['clear']
    },
    timeOfDay: 'day',
    season: 'spring'
  };
  
  const worldMap = new WorldMap(worldMapData);
  
  // Add regions
  regions.forEach(regionData => {
    const region = new Region(regionData);
    worldMap.addRegion(region);
  });
  
  return worldMap;
}

/**
 * Create a simple region with basic properties
 */
export function createSimpleRegion(
  id: string,
  name: string,
  type: RegionType['type'],
  position: { x: number; y: number },
  size: { width: number; height: number },
  difficulty: number = 1
): Region {
  const regionData: RegionType = {
    id,
    name,
    description: `A ${type} area.`,
    image: '/rooms/room1.jpg',
    position,
    size,
    connections: [],
    type,
    difficulty,
    isExplored: false,
    isAccessible: true
  };
  
  return new Region(regionData);
}

/**
 * Create a connection between two regions
 */
export function createConnection(
  targetRegionId: string,
  connectionType: RegionConnection['connectionType'] = 'path',
  distance: number = 1,
  isBlocked: boolean = false
): RegionConnection {
  return {
    targetRegionId,
    connectionType,
    distance,
    isBlocked
  };
}
