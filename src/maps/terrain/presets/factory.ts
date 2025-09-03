import { Terrain } from '../Terrain';
import { TerrainPreset } from './types';
import { terrainPresets, terrainPresetsByCategory } from './terrainPresets';

/**
 * Create terrain from a preset
 * @param presetId The preset ID to use as base configuration
 * @param x X coordinate for the terrain
 * @param y Y coordinate for the terrain
 * @param overrides Optional overrides to apply to the preset
 * @returns A new Terrain instance
 */
export function createTerrain(
  presetId: string,
  x: number,
  y: number,
  rotation?: 0 | 90 | 180 | 270,
  overrides?: {    
    mapWidth?: number;
    mapHeight?: number;
    height?: number;
    image?: string;
    movementCost?: number;
  }
): Terrain {
  const preset = terrainPresets[presetId];
  if (!preset) {
    throw new Error(`Terrain preset '${presetId}' not found. Available presets: ${Object.keys(terrainPresets).join(', ')}`);
  }

  // Use preset values with overrides
  const mapWidth = overrides?.mapWidth ?? preset.mapWidth;
  const mapHeight = overrides?.mapHeight ?? preset.mapHeight;
  const height = overrides?.height ?? preset.height;
  const image = overrides?.image ?? preset.image;
  const movementCost = overrides?.movementCost ?? preset.movementCost;

  return new Terrain(
    x,
    y,
    mapWidth,
    mapHeight,
    image,
    height,
    rotation,
    movementCost
  );
}

/**
 * Get all available terrain preset IDs
 * @returns Array of preset IDs
 */
export function getAvailableTerrainPresets(): string[] {
  return Object.keys(terrainPresets);
}

/**
 * Get terrain preset by ID
 * @param presetId The preset ID
 * @returns The terrain preset or undefined if not found
 */
export function getTerrainPreset(presetId: string): TerrainPreset | undefined {
  return terrainPresets[presetId];
}

/**
 * Get terrain presets by category
 * @returns Record of categories with their presets
 */
export function getTerrainPresetsByCategory(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [category, categoryData] of Object.entries(terrainPresetsByCategory)) {
    result[category] = Object.keys(categoryData.presets);
  }
  return result;
}
