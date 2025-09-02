import { Room } from '../Room';
import { RoomPreset } from './types';
import { roomPresets } from './roomPresets';
import { createTerrain, TerrainFactoryType } from '../../terrain/presets/factory';

/**
 * Create a room from a preset
 * @param presetId The preset ID to use as base configuration
 * @param x X coordinate for the room
 * @param y Y coordinate for the room
 * @param overrides Optional overrides to apply to the preset
 * @returns A new Room instance
 */
export function createRoom(
  presetId: string,
  x: number,
  y: number,
  overrides?: {
    rotation?: 0 | 90 | 180 | 270;
    mapWidth?: number;
    mapHeight?: number;
    outdoors?: boolean;
    terrain?: TerrainFactoryType[];
  }
): Room {
  const preset = roomPresets[presetId];
  if (!preset) {
    throw new Error(`Room preset '${presetId}' not found. Available presets: ${Object.keys(roomPresets).join(', ')}`);
  }

  // Use preset values with overrides
  const mapWidth = overrides?.mapWidth ?? preset.mapWidth;
  const mapHeight = overrides?.mapHeight ?? preset.mapHeight;
  const rotation = overrides?.rotation ?? 0;
  const outdoors = overrides?.outdoors ?? preset.outdoors ?? false;
  const terrain = overrides?.terrain?.map(t => createTerrain({ ...t, x: t.x + x, y: t.y + y })) ?? [];
  if (preset.terrain) {
    const presetTerrain = preset.terrain.map(t => createTerrain({...t, rotation: calculateAdjustedTerrainRotation(t.rotation || 0, rotation)}));
    presetTerrain.forEach(t => {
      const rotatedPosition = calculateRotatedTerrainPosition(t.x, t.y, t.mapWidth, t.mapHeight, rotation, mapWidth, mapHeight);
      t.x = rotatedPosition.x + x;
      t.y = rotatedPosition.y + y;
    });
    terrain.push(...presetTerrain);
  }
  return new Room(
    presetId, // Use presetId as the type
    x,
    y,
    mapWidth,
    mapHeight,
    rotation,
    outdoors,
    terrain
  );
}


/**
 * Calculate the position of terrain after applying room rotation
 * @param localX Local X coordinate within the room (0-based)
 * @param localY Local Y coordinate within the room (0-based)
 * @param terrainWidth Width of the terrain object
 * @param terrainHeight Height of the terrain object
 * @param rotation Room rotation in degrees
 * @param mapWidth Width of the room
 * @param mapHeight Height of the room
 * @returns Rotated coordinates relative to room origin
 */
function calculateRotatedTerrainPosition(localX: number, localY: number, terrainWidth: number, terrainHeight: number, rotation: 0 | 90 | 180 | 270, mapWidth: number, mapHeight: number): { x: number, y: number } {
  switch (rotation) {
    case 0:
      // No rotation, return original position
      return { x: localX, y: localY };

    case 90:
      // Rotate 90 degrees clockwise around room center
      // For terrain with dimensions, we need to consider the terrain's bounds
      // (x, y) -> (height - terrainHeight - y, x)
      return { x: mapHeight - terrainHeight - localY, y: localX };

    case 180:
      // Rotate 180 degrees around room center
      // For terrain with dimensions, we need to consider the terrain's bounds
      // (x, y) -> (width - terrainWidth - x, height - terrainHeight - y)
      return { x: mapWidth - terrainWidth - localX, y: mapHeight - terrainHeight - localY };

    case 270:
      // Rotate 270 degrees clockwise (90 degrees counter-clockwise) around room center
      // For terrain with dimensions, we need to consider the terrain's bounds
      // (x, y) -> (y, width - terrainWidth - x)
      return { x: localY, y: mapWidth - terrainWidth - localX };

    default:
      return { x: localX, y: localY };
  }
}

/**
 * Calculate the adjusted rotation for terrain based on room rotation.
 * This ensures that terrain maintains its orientation relative to the room.
 * @param localRotation The local rotation of the terrain (0, 90, 180, 270)
 * @returns The adjusted rotation for the terrain.
 */
function calculateAdjustedTerrainRotation(localRotation: 0 | 90 | 180 | 270, rotation: 0 | 90 | 180 | 270): 0 | 90 | 180 | 270 {
  // Add room rotation to terrain rotation and normalize to 0-270 range
  const adjustedRotation = (localRotation + rotation) % 360;
  // Convert to valid rotation values (0, 90, 180, 270)
  return Math.floor(adjustedRotation / 90) * 90 as 0 | 90 | 180 | 270;
}

/**
 * Get all available room preset IDs
 * @returns Array of preset IDs
 */
export function getAvailableRoomPresets(): string[] {
  return Object.keys(roomPresets);
}

/**
 * Get room preset by ID
 * @param presetId The preset ID
 * @returns The room preset or undefined if not found
 */
export function getRoomPreset(presetId: string): RoomPreset | undefined {
  return roomPresets[presetId];
}
