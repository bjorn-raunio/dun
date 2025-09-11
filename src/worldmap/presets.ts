import { IWorldMap, IRegion } from './types';
import { WorldMap } from './WorldMap';
import { Region } from './Region';

export const WORLD_REGIONS: IRegion[] = [
  {
    id: 't23',
    name: 'Barrock',
    vertices: [
      { x: 2475, y: 1397 },
      { x: 2538, y: 1405 },
      { x: 2661, y: 1443 },
      { x: 2764, y: 1432 },
      { x: 2748, y: 1380 },
      { x: 2798, y: 1350 },
      { x: 2680, y: 1297 },
      { x: 2674, y: 1264 },
      { x: 2454, y: 1296 },
    ],
    connections: [
      {
        targetRegionId: 't24',
      },
      {
        targetRegionId: 't28',
      }
    ],
    type: 'plains',
    isExplored: false,
    isAccessible: true,
  },
  {
    id: 't24',
    name: 'Aitania',
    vertices: [
      { x: 2475, y: 1497 },
      { x: 2538, y: 1505 },
      { x: 2661, y: 1543 },
      { x: 2764, y: 1532 },
      { x: 2748, y: 1480 },
      { x: 2798, y: 1450 },
      { x: 2680, y: 1397 },
      { x: 2674, y: 1364 },
      { x: 2454, y: 1396 },
    ],
    connections: [
      {
        targetRegionId: 't23',
      },
      {
        targetRegionId: 't25',
      },
      {
        targetRegionId: 't28',
      },
      {
        targetRegionId: 't27',
      }
    ],
    type: 'plains',
    isExplored: false,
    isAccessible: true,
  },
  {
    id: 't25',
    name: 'Forest of Rohuan',
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
        targetRegionId: 't24',
      },
      {
        targetRegionId: 't26',
      },
      {
        targetRegionId: 't27',
      }
    ],
    type: 'forest',
    isExplored: false,
    isAccessible: true,
  },
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
      }
    ],
    type: 'plains',
    isExplored: true,
    isAccessible: true,
  },
  {
    id: 't27',
    name: 'Carrick',
    vertices: [
      { x: 2675, y: 1497 },
      { x: 2738, y: 1505 },
      { x: 2861, y: 1543 },
      { x: 2964, y: 1532 },
      { x: 2948, y: 1480 },
      { x: 2998, y: 1450 },
      { x: 2880, y: 1397 },
      { x: 2874, y: 1364 },
      { x: 2654, y: 1396 },
    ],
    connections: [
      {
        targetRegionId: 't24',
      },
      {
        targetRegionId: 't25',
      },
      {
        targetRegionId: 't28',
      }
    ],
    type: 'plains',
    isExplored: true,
    isAccessible: true,
  },
  {
    id: 't28',
    name: 'Guardian hills',
    vertices: [
      { x: 2675, y: 1397 },
      { x: 2738, y: 1405 },
      { x: 2861, y: 1443 },
      { x: 2964, y: 1432 },
      { x: 2948, y: 1380 },
      { x: 2998, y: 1350 },
      { x: 2880, y: 1297 },
      { x: 2874, y: 1264 },
      { x: 2654, y: 1296 },
    ],
    connections: [
      {
        targetRegionId: 't23',
      },
      {
        targetRegionId: 't24',
      },
      {
        targetRegionId: 't27',
      },
      {
        targetRegionId: 't29',
      }
    ],
    type: 'mountain',
    isExplored: true,
    isAccessible: true,
  },  
  {
    id: 't29',
    name: 'Sudfall',
    vertices: [
      { x: 2675, y: 1197 },
      { x: 2738, y: 1205 },
      { x: 2861, y: 1243 },
      { x: 2964, y: 1232 },
      { x: 2948, y: 1180 },
      { x: 2998, y: 1150 },
      { x: 2880, y: 1097 },
      { x: 2874, y: 1064 },
      { x: 2654, y: 1096 },
    ],
    connections: [
      {
        targetRegionId: 't28',
      },
      {
        targetRegionId: 't30',
      }
    ],
    type: 'plains',
    isExplored: true,
    isAccessible: true,
  },  
  {
    id: 't30',
    name: 'Norkfall',
    vertices: [
      { x: 2675, y: 997 },
      { x: 2738, y: 1005 },
      { x: 2861, y: 1043 },
      { x: 2964, y: 1032 },
      { x: 2948, y: 980 },
      { x: 2998, y: 950 },
      { x: 2880, y: 897 },
      { x: 2874, y: 864 },
      { x: 2654, y: 896 },
    ],
    connections: [
      {
        targetRegionId: 't29',
      },

      {
        targetRegionId: 't41',
      }
    ],
    type: 'plains',
    isExplored: true,
    isAccessible: true,
  },
 
  {
    id: 't41',
    name: 'The muddy hills',
    vertices: [
      { x: 2875, y: 997 },
      { x: 2938, y: 1005 },
      { x: 3061, y: 1043 },
      { x: 3164, y: 1032 },
      { x: 3148, y: 980 },
      { x: 3198, y: 950 },
      { x: 3080, y: 897 },
      { x: 3074, y: 864 },
      { x: 2854, y: 896 },
    ],
    connections: [

      {
        targetRegionId: 't2',
      },
      {
        targetRegionId: 't30',
      }

    ],
    type: 'swamp',
    isExplored: true,
    isAccessible: true,
  },
  {
    id: 't2',
    name: 'Blood Kingdom',
    vertices: [
      { x: 2875, y: 997 },
      { x: 2938, y: 1005 },
      { x: 3061, y: 1043 },
      { x: 3164, y: 1032 },
      { x: 3148, y: 980 },
      { x: 3198, y: 950 },
      { x: 3080, y: 897 },
      { x: 3074, y: 864 },
      { x: 2854, y: 896 },
    ],
    connections: [
      {
        targetRegionId: 't41',
      }
    ],
    type: 'mountain',
    isExplored: true,
    isAccessible: true,
  },
];

// --- Sample Connections ---
// Note: Connections are now defined directly in the region data above

// --- Sample World Map ---

export const SAMPLE_WORLD_MAP: IWorldMap = {
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
  regions: IRegion[],
  startingRegionId: string
): WorldMap {
  const worldMapData: IWorldMap = {
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