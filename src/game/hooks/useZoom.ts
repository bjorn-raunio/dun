import React from 'react';
import { GameActions, GameRefs } from '../types';

// --- Zoom Hook ---

export function useZoom(
  gameActions: GameActions,
  gameRefs: GameRefs,
  viewport: { width: number; height: number; zoom: number }
) {
  const { setZoom, setPan } = gameActions;
  const { viewportRef, panRef } = gameRefs;

  const onWheel = React.useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out on scroll down, in on scroll up
    const newZoom = Math.max(0.25, Math.min(3.0, viewport.zoom * delta));
    
    if (newZoom === viewport.zoom) return; // No change
    
    // Calculate zoom center (mouse position relative to viewport)
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Get current pan position from the transform style
    const transform = panRef.current?.style.transform || '';
    const translateMatch = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
    
    if (!translateMatch) return;
    
    const currentPanX = parseFloat(translateMatch[1]);
    const currentPanY = parseFloat(translateMatch[2]);
    
    // Calculate new pan to zoom towards mouse cursor
    const zoomRatio = newZoom / viewport.zoom;
    const newPanX = mouseX - (mouseX - currentPanX) * zoomRatio;
    const newPanY = mouseY - (mouseY - currentPanY) * zoomRatio;
    
    // Update zoom and pan
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [viewport.zoom, setZoom, setPan, viewportRef, panRef]);

  return { onWheel };
}
