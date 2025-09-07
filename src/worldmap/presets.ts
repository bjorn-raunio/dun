import { WorldMap as WorldMapType, Region as RegionType, RegionConnection } from './types';
import { WorldMap } from './WorldMap';
import { Region } from './Region';

export const WORLD_REGIONS: RegionType[] = [
  {
    id: 't26',
    name: 'Verneck',
    vertices: [
      { x: 2471, y: 1791 },
      { x: 2475, y: 1597 },
      { x: 2538, y: 1605 },
      { x: 2661, y: 1643 },
      { x: 2764, y: 1632 },
      { x: 2754, y: 1694 },
      { x: 2670, y: 1791 },
    ],
    connections: [
      {
        targetRegionId: 't25',
        connectionType: 'path',
        distance: 2,
        isBlocked: false
      }
    ],
    type: 'village',
    isExplored: true,
    isAccessible: true,
    encounters: ['friendly_villager', 'merchant'],
    resources: ['food', 'water', 'basic_supplies']
  },
  {
    id: 't25',
    name: 'Dark Forest',
    vertices: [
      { x: 2475, y: 1597 },
      { x: 2538, y: 1605 },
      { x: 2661, y: 1643 },
      { x: 2764, y: 1632 },
      { x: 2748, y: 1580 },
      { x: 2798, y: 1550 },
      { x: 2680, y: 1497 },
      { x: 2674, y: 1464 },
      { x: 2454, y: 1496 },
    ],
    connections: [
      {
        targetRegionId: 't26',
        connectionType: 'path',
        distance: 2,
        isBlocked: false
      }
    ],
    type: 'forest',
    isExplored: false,
    isAccessible: true,
    encounters: ['wolf', 'bandit', 'mysterious_traveler'],
    resources: ['wood', 'herbs', 'mushrooms'],
    questMapPresets: ['freeTheMerchants']
  },
];

// --- Sample Connections ---
// Note: Connections are now defined directly in the region data above

// --- Sample World Map ---

export const SAMPLE_WORLD_MAP: WorldMapType = {
  id: 'sample_world',
  name: 'The Land of Adventure',
  description: 'A diverse world filled with mystery, danger, and opportunity. From peaceful villages to ancient ruins, adventure awaits around every corner.',
  backgroundImage: '/worldmap.jpg',
  regions: new Map(),
  startingRegionId: 't26',
  discoveredRegions: new Set(['t26']),
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
  
  // Add all regions (connections are already defined in the region data)
  WORLD_REGIONS.forEach(regionData => {
    const region = new Region(regionData);
    worldMap.addRegion(region);
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