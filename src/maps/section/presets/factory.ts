import { Section } from '../Section';
import { SectionPreset } from './types';
import { sectionPresets } from './sectionPresets';
import { createTerrain } from '../../terrain/presets/factory';

export function createSection(
  presetId: string,
  x: number,
  y: number,
  overrides?: {
    rotation?: 0 | 90 | 180 | 270;
    mapWidth?: number;
    mapHeight?: number;
    image?: string;
    outdoors?: boolean;
    terrain?: {
      id: string;
      x: number;
      y: number;
      rotation?: 0 | 90 | 180 | 270;
    }[];
  }
): Section {
  const preset = sectionPresets[presetId];
  if (!preset) {
    throw new Error(`Section preset '${presetId}' not found. Available presets: ${Object.keys(sectionPresets).join(', ')}`);
  }

  // Use preset values with overrides
  const mapWidth = overrides?.mapWidth ?? preset.mapWidth;
  const mapHeight = overrides?.mapHeight ?? preset.mapHeight;
  const rotation = overrides?.rotation ?? 0;
  const image = overrides?.image ?? preset.image;
  const outdoors = overrides?.outdoors ?? preset.outdoors ?? false;
  const terrain = overrides?.terrain?.map(t => createTerrain(t.id, t.x + x, t.y + y, t.rotation)) ?? [];
  if (preset.terrain) {
    const presetTerrain = preset.terrain.map(t => createTerrain(t.id, t.x, t.y, calculateAdjustedTerrainRotation(t.rotation || 0, rotation)));
    presetTerrain.forEach(t => {
      const rotatedPosition = calculateRotatedTerrainPosition(t.x, t.y, t.mapWidth, t.mapHeight, rotation, mapWidth, mapHeight);
      t.x = rotatedPosition.x + x;
      t.y = rotatedPosition.y + y;
    });
    terrain.push(...presetTerrain);
  }
  return new Section(
    x,
    y,
    mapWidth,
    mapHeight,
    image,
    rotation,
    outdoors,
    terrain
  );
}


/**
 * Calculate the position of terrain after applying section rotation
 * @param localX Local X coordinate within the section (0-based)
 * @param localY Local Y coordinate within the section (0-based)
 * @param terrainWidth Width of the terrain object
 * @param terrainHeight Height of the terrain object
 * @param rotation section rotation in degrees
 * @param mapWidth Width of the section
 * @param mapHeight Height of the section
 * @returns Rotated coordinates relative to section origin
 */
function calculateRotatedTerrainPosition(localX: number, localY: number, terrainWidth: number, terrainHeight: number, rotation: 0 | 90 | 180 | 270, mapWidth: number, mapHeight: number): { x: number, y: number } {
  switch (rotation) {
    case 0:
      // No rotation, return original position
      return { x: localX, y: localY };

    case 90:
      // Rotate 90 degrees clockwise around section center
      // For terrain with dimensions, we need to consider the terrain's bounds
      // (x, y) -> (height - terrainHeight - y, x)
      return { x: mapHeight - terrainHeight - localY, y: localX };

    case 180:
      // Rotate 180 degrees around section center
      // For terrain with dimensions, we need to consider the terrain's bounds
      // (x, y) -> (width - terrainWidth - x, height - terrainHeight - y)
      return { x: mapWidth - terrainWidth - localX, y: mapHeight - terrainHeight - localY };

    case 270:
      // Rotate 270 degrees clockwise (90 degrees counter-clockwise) around section center
      // For terrain with dimensions, we need to consider the terrain's bounds
      // (x, y) -> (y, width - terrainWidth - x)
      return { x: localY, y: mapWidth - terrainWidth - localX };

    default:
      return { x: localX, y: localY };
  }
}

/**
 * Calculate the adjusted rotation for terrain based on section rotation.
 * This ensures that terrain maintains its orientation relative to the section.
 * @param localRotation The local rotation of the terrain (0, 90, 180, 270)
 * @returns The adjusted rotation for the terrain.
 */
function calculateAdjustedTerrainRotation(localRotation: 0 | 90 | 180 | 270, rotation: 0 | 90 | 180 | 270): 0 | 90 | 180 | 270 {
  // Add section rotation to terrain rotation and normalize to 0-270 range
  const adjustedRotation = (localRotation + rotation) % 360;
  // Convert to valid rotation values (0, 90, 180, 270)
  return Math.floor(adjustedRotation / 90) * 90 as 0 | 90 | 180 | 270;
}

/**
 * Get all available section preset IDs
 * @returns Array of preset IDs
 */
export function getAvailableSectionPresets(): string[] {
  return Object.keys(sectionPresets);
}

/**
 * Get section preset by ID
 * @param presetId The preset ID
 * @returns The section preset or undefined if not found
 */
export function getSectionPreset(presetId: string): SectionPreset | undefined {
  return sectionPresets[presetId];
}
