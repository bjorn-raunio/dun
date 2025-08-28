// --- Geometry Utilities ---

/**
 * Calculate Chebyshev distance between two points
 * This is used for simple distance calculations
 */
export function chebyshevDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
}

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
  
  if (dx === 0 && dy < 0) return 0; // North
  if (dx > 0 && dy < 0) return 1;   // Northeast
  if (dx > 0 && dy === 0) return 2; // East
  if (dx > 0 && dy > 0) return 3;   // Southeast
  if (dx === 0 && dy > 0) return 4; // South
  if (dx < 0 && dy > 0) return 5;   // Southwest
  if (dx < 0 && dy === 0) return 6; // West
  if (dx < 0 && dy < 0) return 7;   // Northwest
  
  return 0; // Default to North
}

/**
 * Convert mouse position to tile coordinates
 */
export function tileFromPointer(
  clientX: number,
  clientY: number,
  viewportRef: React.MutableRefObject<HTMLDivElement | null>,
  livePan: { x: number; y: number },
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
  const tileX = Math.floor(worldX / tileSize);
  const tileY = Math.floor(worldY / tileSize);
  if (tileX < 0 || tileY < 0 || tileX >= mapWidth || tileY >= mapHeight) return null;
  return { tileX, tileY };
}

/**
 * Get creature dimensions based on size
 */
export function getCreatureDimensions(size: number): { w: number; h: number } {
  return (size >= 3) ? { w: 2, h: 2 } : { w: 1, h: 1 }; // 3=large, 4=huge
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
