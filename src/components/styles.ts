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
    background: COLORS.backgroundLight,
    color: COLORS.text,
    border:  `1px solid ${COLORS.border}`,
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
  section: {
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: 12,
  },
  sectionHeader: {
    color: COLORS.text,
    fontSize: "16px",
    fontWeight: "bold",
    margin: 0,
  },
} as const;

// Button style variants to eliminate redundancies
export const BUTTON_VARIANTS = {
  small: {
    ...COMMON_STYLES.button,
    padding: '2px 6px',
    fontSize: 10,
  },
  smallIcon: {
    ...COMMON_STYLES.button,
    padding: '2px 6px',
    fontSize: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    minHeight: '20px',
  },
  medium: {
    ...COMMON_STYLES.button,
    padding: '4px 8px',
    fontSize: 12,
  },
  action: {
    ...COMMON_STYLES.button,
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  disabled: {
    background: COLORS.border,
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  enabled: {
    background: COLORS.backgroundLight,
    opacity: 1,
    cursor: 'pointer',
  },
  error: {
    background: COLORS.error,
    color: COLORS.text,
  },
  attack: {
    background: '#000',
    color: COLORS.text,
    border: `2px solid ${COLORS.border}`,
  },
} as const;

// Common layout patterns to eliminate redundancies
export const LAYOUT_PATTERNS = {
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexRowCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    background: COLORS.backgroundLight,
  },
  grid3Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 8,
  },
} as const;

// Utility function to create button styles
export const createButtonStyle = (
  variant: 'small' | 'smallIcon' | 'medium' | 'action',
  state: 'enabled' | 'disabled'
) => ({
  ...BUTTON_VARIANTS[variant],
  ...BUTTON_VARIANTS[state],
});

// Utility function to create conditional button styles
export const createConditionalButtonStyle = (
  variant: 'small' | 'smallIcon' | 'medium' | 'action',
  condition: boolean,
  disabledState: 'disabled' = 'disabled'
) => createButtonStyle(variant, condition ? 'enabled' : disabledState);
