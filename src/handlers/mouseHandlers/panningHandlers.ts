import { GameRefs } from '../../game/types';

export interface PanningHandlers {
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function createPanningHandlers(gameRefs: GameRefs): PanningHandlers {
  const { dragStart, panStart, panRef, livePan, rafId, updateTransform, dragMoved } = gameRefs;

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return; // Only handle left mouse button
    
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: livePan.current.x, y: livePan.current.y };
    dragMoved.current = { dx: 0, dy: 0 };
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragMoved.current = { dx, dy };
    
    const newPan = {
      x: panStart.current.x + dx,
      y: panStart.current.y + dy
    };
    
    livePan.current = { ...newPan, zoom: livePan.current.zoom };
    if (rafId.current === null) {
      rafId.current = window.requestAnimationFrame(() => {
        updateTransform(livePan.current.x, livePan.current.y);
        rafId.current = null;
      });
    }
  }

  function onMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    // This is a minimal implementation - the main handler will call setPan
    dragStart.current = null;
  }

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
}
