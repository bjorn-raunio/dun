import { IWorldMap, IRegion } from './types';
import { WorldMap } from './WorldMap';
import { Region } from './Region';
import { WorldLocation } from './locations/Location';
import { SERVICES } from './service/presets';
import { Settlement } from './settlement/settlement';

export const WORLD_REGIONS: IRegion[] = [
  /*{
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
  },*/
  {
    id: 't24',
    name: 'Aitania',
    vertices: [
      {y:1499,x:2455},{y:1480,x:2475},{y:1483,x:2492},{y:1477,x:2531},{y:1477,x:2560},{y:1468,x:2582},{y:1471,x:2614},{y:1461,x:2639},
      {y:1464,x:2674},{y:1437,x:2672},{y:1393,x:2698},{y:1393,x:2698},
      {y:1378,x:2666},{y:1354,x:2656},{y:1321,x:2608},{y:1327,x:2581},{y:1341,x:2565},{y:1364,x:2560},{y:1365,x:2511},{y:1343,x:2475},{y:1409,x:2448},{y:1429,x:2446},{y:1475,x:2432}
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
    locations: [
      new WorldLocation({
        settlement: new Settlement({
          name: 'Aitania',
          type: 'castle',
          services: [SERVICES.combatSchool, SERVICES.bank, SERVICES.blacksmith, SERVICES.stables, SERVICES.inn, SERVICES.alchemist],
        }),
      })
    ],
    type: 'plains',
    isExplored: false,
    isAccessible: true,
  },
  {
    id: 't25',
    name: 'Forest of Rohuan',
    vertices: [
      {y:1597,x:2475},{y:1603,x:2481},{y:1605,x:2537},{y:1622,x:2564},{y:1643,x:2626},{y:1644,x:2660},{y:1633,x:2676},{y:1632,x:2764},
      {y:1581,x:2751},
      {y:1552,x:2801},{y:1543,x:2770},{y:1530,x:2754},{y:1521,x:2721},{y:1504,x:2706},{y:1496,x:2681},{y:1464,x:2674},
      {y:1461,x:2639},{y:1471,x:2614},{y:1468,x:2582},{y:1477,x:2560},{y:1477,x:2531},{y:1483,x:2492},{y:1480,x:2475},{y:1499,x:2455},{y:1512,x:2471},{y:1550,x:2475},{y:1589,x:2469}
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
    locations: [
      new WorldLocation({
        service: SERVICES.dock,
      })
    ],
    isExplored: false,
    isAccessible: true,
  },
  {
    id: 't26',
    name: 'Verneck',
    vertices: [
      {y:1791,x:2472},{y:1617,x:2469},
      {y:1597,x:2475},{y:1603,x:2481},{y:1605,x:2537},{y:1622,x:2564},{y:1643,x:2626},{y:1644,x:2660},{y:1633,x:2676},{y:1632,x:2764},
      {y:1687,x:2765},{y:1722,x:2733},{y:1743,x:2687},{y:1791,x:2674}
    ],
    connections: [
      {
        targetRegionId: 't25',
      }
    ],
    type: 'plains',
    locations: [
      new WorldLocation({
        settlement: new Settlement({
          name: 'Verneck',
          type: 'town',
          services: [SERVICES.governor, SERVICES.bank, SERVICES.moneylender, SERVICES.market, SERVICES.stables, SERVICES.inn, SERVICES.healer, SERVICES.tavern],
        }),
      })
    ],
    isExplored: true,
    isAccessible: true,
  },
  {
    id: 't27',
    name: 'Carrick',
    vertices: [
      {y:1508,x:2803},{y:1470,x:2783},{y:1407,x:2821},{y:1377,x:2821},{y:1357,x:2887},{y:1336,x:2921},{y:1274,x:2933},{y:1247,x:2958},{y:1235,x:2939},{y:1216,x:2921},{y:1213,x:2894},{y:1230,x:2893},{y:1242,x:2882},{y:1252,x:2890},{y:1266,x:2879},{y:1271,x:2830},{y:1285,x:2823},{y:1292,x:2800},{y:1306,x:2784},{y:1317,x:2785},{y:1324,x:2778},{y:1323,x:2760},{y:1335,x:2751},{y:1335,x:2739},{y:1345,x:2722},{y:1371,x:2716},{y:1373,x:2704},{y:1393,x:2698},{y:1437,x:2672},{y:1463,x:2675},
      {y:1464,x:2674},{y:1496,x:2681},{y:1504,x:2706},{y:1521,x:2721},{y:1530,x:2754},{y:1543,x:2770},{y:1552,x:2801},
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
    locations: [
      new WorldLocation({
        settlement: new Settlement({
          name: 'Carrick',
          type: 'village',
          services: [SERVICES.dock, SERVICES.inn],
        }),
      })
    ],
    isExplored: true,
    isAccessible: true,
  },
  {
    id: 't28',
    name: 'Guardian hills',
    vertices: [
      {y:1321,x:2608},{y:1354,x:2656},{y:1378,x:2666},{y:1393,x:2698},
      {y:1437,x:2672},{y:1393,x:2698},{y:1373,x:2704},{y:1371,x:2716},{y:1345,x:2722},{y:1335,x:2739},{y:1335,x:2751},{y:1323,x:2760},{y:1324,x:2778},{y:1317,x:2785},{y:1306,x:2784},{y:1292,x:2800},{y:1285,x:2823},{y:1271,x:2830},{y:1266,x:2879},{y:1252,x:2890},{y:1242,x:2882},{y:1230,x:2893},{y:1213,x:2894},
      {y:1210,x:2879},{y:1201,x:2875},{y:1205,x:2852},{y:1192,x:2830},{y:1173,x:2831},{y:1156,x:2818},{y:1136,x:2823},{y:1130,x:2835},{y:1114,x:2820},{y:1088,x:2813},{y:1064,x:2814},{y:1053,x:2798},{y:1038,x:2789},{y:1037,x:2727},{y:1066,x:2674},{y:1089,x:2666},{y:1095,x:2652},{y:1116,x:2647},{y:1136,x:2619},{y:1193,x:2590},{y:1206,x:2604},{y:1219,x:2604},{y:1232,x:2623},{y:1253,x:2630},{y:1267,x:2620},{y:1285,x:2620},{y:1293,x:2612}
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
  /*{
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
  },*/
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