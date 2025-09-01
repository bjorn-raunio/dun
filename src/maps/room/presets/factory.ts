import { Room } from '../Room';
import { RoomPreset } from './types';
import { roomPresets } from './roomPresets';

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
  return new Room(
    presetId, // Use presetId as the type
    x,
    y,
    mapWidth,
    mapHeight,
    rotation,
    outdoors
  );
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
