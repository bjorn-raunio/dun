import { Miscellaneous } from './Miscellaneous';
import { miscellaneousPresets, createMiscellaneousFromPreset } from './presets';

/**
 * Create a miscellaneous item from a preset
 */
export function createMiscellaneous(presetName: string): Miscellaneous | null {
  return createMiscellaneousFromPreset(presetName);
}

/**
 * Create a custom miscellaneous item
 */
export function createCustomMiscellaneous(params: {
  name: string;
  weight?: number;
  value?: number;
}): Miscellaneous {
  return new Miscellaneous(params);
}

/**
 * Get all available miscellaneous item presets
 */
export function getAvailableMiscellaneousPresets(): string[] {
  return Object.keys(miscellaneousPresets);
}
