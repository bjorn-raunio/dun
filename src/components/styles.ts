// --- Shared Styles and Constants ---

import { GAME_SETTINGS } from '../utils/constants';

export const TILE_SIZE = GAME_SETTINGS.TILE_SIZE;

// Common colors
export const COLORS = {
  primary: "#00e5ff",
  primaryDark: "#00b8cc",
  hero: "#4caf50",
  monster: "#e53935",
  background: "#111",
  backgroundLight: "rgba(0,0,0,0.7)",
  backgroundDark: "rgba(0,0,0,0.75)",
  border: "#444",
  borderDark: "#333",
  text: "#fff",
  textMuted: "rgba(255,255,255,0.8)",
  error: "#ff4444",
  warning: "#ffaa00",
  success: "#00ff00",
  reachable: "rgba(0, 229, 255, 0.25)",
  reachableBorder: "rgba(0, 229, 255, 0.7)",
  pathHighlight: "rgba(0, 255, 0, 0.4)",
  pathHighlightBorder: "rgba(0, 255, 0, 0.8)",
} as const;

// Common styles
export const COMMON_STYLES = {
  button: {
    background: COLORS.primary,
    color: "#000",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
    cursor: "pointer",
    padding: "8px 12px",
  },
  panel: {
    background: COLORS.backgroundDark,
    color: COLORS.text,
    borderLeft: `2px solid ${COLORS.borderDark}`,
    backdropFilter: "blur(2px)",
  },
  messageBox: {
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: 8,
  },
} as const;
