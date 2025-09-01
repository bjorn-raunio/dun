import { DIRECTIONS } from './constants';

// --- Geometry Utilities ---



/**
 * Calculate Chebyshev distance between two rectangles (size-aware, on tile-grid)
 * This is used for determining if creatures are within attack range
 */
export function chebyshevDistanceRect(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): number {
  const aRight = ax + aw - 1;
  const aBottom = ay + ah - 1;
  const bRight = bx + bw - 1;
  const bBottom = by + bh - 1;
  const dx = Math.max(0, Math.max(bx - aRight, ax - bRight));
  const dy = Math.max(0, Math.max(by - aBottom, ay - bBottom));
  return Math.max(dx, dy);
}

/**
 * Calculate direction from one point to another (8-direction system)
 * Returns 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
 */
export function getDirectionFromTo(fromX: number, fromY: number, toX: number, toY: number): number {
  const dx = toX - fromX;
  const dy = toY - fromY;
  
  if (dx === 0 && dy < 0) return DIRECTIONS.NORTH;
  if (dx > 0 && dy < 0) return DIRECTIONS.NORTHEAST;
  if (dx > 0 && dy === 0) return DIRECTIONS.EAST;
  if (dx > 0 && dy > 0) return DIRECTIONS.SOUTHEAST;
  if (dx === 0 && dy > 0) return DIRECTIONS.SOUTH;
  if (dx < 0 && dy > 0) return DIRECTIONS.SOUTHWEST;
  if (dx < 0 && dy === 0) return DIRECTIONS.WEST;
  if (dx < 0 && dy < 0) return DIRECTIONS.NORTHWEST;
  
  return DIRECTIONS.NORTH; // Default to North
}

/**
 * Convert mouse position to tile coordinates
 */
export function tileFromPointer(
  clientX: number,
  clientY: number,
  viewportRef: React.MutableRefObject<HTMLDivElement | null>,
  livePan: { x: number; y: number; zoom: number },
  mapWidth: number,
  mapHeight: number,
  tileSize: number = 50
) {
  const rect = viewportRef.current?.getBoundingClientRect();
  if (!rect) return null;
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const worldX = x - livePan.x;
  const worldY = y - livePan.y;
  
  // Scale tile size by zoom factor
  const scaledTileSize = tileSize * livePan.zoom;
  
  const tileX = Math.floor(worldX / scaledTileSize);
  const tileY = Math.floor(worldY / scaledTileSize);
  if (tileX < 0 || tileY < 0 || tileX >= mapWidth || tileY >= mapHeight) return null;
  return { tileX, tileY };
}



/**
 * Check if two rectangles overlap
 */
export function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/**
 * Check if a point is within map bounds
 */
export function isWithinMapBounds(x: number, y: number, mapData: { tiles: string[][] }): boolean {
  if (x < 0 || y < 0) return false;
  if (y >= mapData.tiles.length) return false;
  if (x >= mapData.tiles[0].length) return false;
  return true;
}

/**
 * Check if a creature is within map bounds
 */
export function isCreatureInBounds(
  creature: { x: number | undefined; y: number | undefined; getDimensions: () => { w: number; h: number } },
  mapData: { tiles: string[][] }
): boolean {
  // Return false if creature is not on the map (undefined position)
  if (creature.x === undefined || creature.y === undefined) {
    return false;
  }
  
  const dimensions = creature.getDimensions();
  
  // Check if the creature's area is within bounds
  if (creature.x < 0 || creature.y < 0) return false;
  if (creature.x + dimensions.w > mapData.tiles[0].length) return false;
  if (creature.y + dimensions.h > mapData.tiles.length) return false;
  
  return true;
}

/**
 * Check if two creatures are overlapping
 */
export function areCreaturesOverlapping(
  creature1: { x: number | undefined; y: number | undefined; getDimensions: () => { w: number; h: number } },
  creature2: { x: number | undefined; y: number | undefined; getDimensions: () => { w: number; h: number } }
): boolean {
  // Return false if either creature is not on the map (undefined position)
  if (creature1.x === undefined || creature1.y === undefined || 
      creature2.x === undefined || creature2.y === undefined) {
    return false;
  }
  
  const dims1 = creature1.getDimensions();
  const dims2 = creature2.getDimensions();
  
  return rectsOverlap(
    creature1.x, creature1.y, dims1.w, dims1.h,
    creature2.x, creature2.y, dims2.w, dims2.h
  );
}

/**
 * Check if an attacker is positioned in the back arc of a target
 * The back arc consists of the 3 positions behind the target (opposite and adjacent)
 * @param targetX Target's X position
 * @param targetY Target's Y position
 * @param targetFacing Target's facing direction (0-7)
 * @param attackerX Attacker's X position
 * @param attackerY Attacker's Y position
 * @returns true if attacker is in target's back arc
 */
export function isInBackArc(
  targetX: number, 
  targetY: number, 
  targetFacing: number, 
  attackerX: number, 
  attackerY: number
): boolean {
  // Get direction from target to attacker
  const attackerPositionRelativeToTarget = getDirectionFromTo(targetX, targetY, attackerX, attackerY);
  
  // Calculate the back arc directions (opposite and adjacent)
  const oppositeDirection = (targetFacing + 4) % 8;
  const backArcLeft = (oppositeDirection + 7) % 8;  // One direction left of opposite
  const backArcRight = (oppositeDirection + 1) % 8; // One direction right of opposite
  
  // Check if attacker is positioned in the back arc
  return attackerPositionRelativeToTarget === oppositeDirection || 
         attackerPositionRelativeToTarget === backArcLeft || 
         attackerPositionRelativeToTarget === backArcRight;
}
