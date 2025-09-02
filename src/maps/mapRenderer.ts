import { QuestMap } from './types';

// Generate map tiles from map definition
export function generateMapTiles(mapDefinition: QuestMap) {
  const tiles: string[][] = [];
  
  // Initialize empty tiles
  for (let y = 0; y < mapDefinition.height; y++) {
    tiles[y] = [];
    for (let x = 0; x < mapDefinition.width; x++) {
      tiles[y][x] = "empty.jpg";
    }
  }
  
  // Fill in room tiles
  for (const room of mapDefinition.rooms) {
    // Use pre-calculated rotated dimensions
    const w = room.rotatedWidth;
    const h = room.rotatedHeight;
    
    for (let y = room.y; y < room.y + h; y++) {
      for (let x = room.x; x < room.x + w; x++) {
        if (y >= 0 && y < mapDefinition.height && x >= 0 && x < mapDefinition.width) {
          tiles[y][x] = `${room.type}.jpg`;
        }
      }
    }
  }
  
  return { tiles };
}


