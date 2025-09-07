import React from 'react';
import { tileFromPointer, GAME_SETTINGS } from '../../utils';
import { QuestMap } from '../../maps/types';
import { PathfindingResult } from '../../utils/pathfinding/types';

interface PathHighlightResult {
  hoveredTile: { x: number; y: number } | null;
  highlightedPath: Array<{ x: number; y: number }>;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
}

// --- Path Highlight Hook ---

export function usePathHighlight(
  reachable: PathfindingResult,
  viewportRef: React.MutableRefObject<HTMLDivElement | null>,
  livePan: { x: number; y: number; zoom: number },
  mapDefinition: QuestMap | null,
  reachableKey: number
): PathHighlightResult {
  const [hoveredTile, setHoveredTile] = React.useState<{ x: number; y: number } | null>(null);
  const [highlightedPath, setHighlightedPath] = React.useState<Array<{ x: number; y: number }>>([]);

  const cols = mapDefinition?.tiles[0]?.length || 0;
  const rows = mapDefinition?.tiles?.length || 0;

  // Clear highlights when reachable data changes (e.g., after movement)
  React.useEffect(() => {
    setHoveredTile(null);
    setHighlightedPath([]);
  }, [reachableKey, reachable.tiles.length, reachable.costMap.size, reachable.pathMap.size]);

  // Mouse move handler to track hovered tile
  const onMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current || !mapDefinition) return;

    const pos = tileFromPointer(
      e.clientX, 
      e.clientY, 
      viewportRef, 
      livePan,
      cols, 
      rows,
      GAME_SETTINGS.TILE_SIZE
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
  }, [reachable, viewportRef, livePan, mapDefinition]);

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
