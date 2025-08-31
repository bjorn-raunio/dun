import React from 'react';
import { tileFromPointer } from '../../utils';

// --- Path Highlight Hook ---

export function usePathHighlight(
  reachable: {
    tiles: Array<{ x: number; y: number }>;
    costMap: Map<string, number>;
    pathMap: Map<string, Array<{ x: number; y: number }>>;
  },
  viewportRef: React.MutableRefObject<HTMLDivElement | null>,
  livePan: React.MutableRefObject<{ x: number; y: number; zoom: number }>,
  mapData: { tiles: string[][] },
  reachableKey?: number
) {
  const [hoveredTile, setHoveredTile] = React.useState<{ x: number; y: number } | null>(null);
  const [highlightedPath, setHighlightedPath] = React.useState<Array<{ x: number; y: number }>>([]);

  // Clear highlights when reachable data changes (e.g., after movement)
  React.useEffect(() => {
    setHoveredTile(null);
    setHighlightedPath([]);
  }, [reachableKey, reachable.tiles.length, reachable.costMap.size, reachable.pathMap.size]);

  // Mouse move handler to track hovered tile
  const onMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;

    const pos = tileFromPointer(
      e.clientX, 
      e.clientY, 
      viewportRef, 
      livePan.current,
      mapData.tiles[0].length, 
      mapData.tiles.length
    );

    if (!pos) {
      setHoveredTile(null);
      setHighlightedPath([]);
      return;
    }

    const tileKey = `${pos.tileX},${pos.tileY}`;
    const isReachable = reachable.tiles.some(t => t.x === pos.tileX && t.y === pos.tileY);

    if (isReachable) {
      setHoveredTile({ x: pos.tileX, y: pos.tileY });
      const path = reachable.pathMap.get(tileKey);
      setHighlightedPath(path || []);
    } else {
      setHoveredTile(null);
      setHighlightedPath([]);
    }
  }, [reachable, viewportRef, livePan, mapData]);

  // Mouse leave handler to clear highlights
  const onMouseLeave = React.useCallback(() => {
    setHoveredTile(null);
    setHighlightedPath([]);
  }, []);

  return {
    hoveredTile,
    highlightedPath,
    onMouseMove,
    onMouseLeave
  };
}
