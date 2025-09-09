import { Connection } from '../connection';
import { Door } from '../Door';
import { ConnectionPreset } from './types';
import { connectionPresets } from './connectionPresets';

/**
 * Create connection from a preset
 * @param presetId The preset ID to use as base configuration
 * @param x X coordinate for the connection
 * @param y Y coordinate for the connection
 * @param rotation Optional rotation to apply to the connection
 * @param overrides Optional overrides to apply to the preset
 * @returns A new Connection instance
 */
export function createConnection(
  presetId: string,
  x: number,
  y: number,
  rotation?: 0 | 90 | 180 | 270,
  overrides?: {    
    mapWidth?: number;
    mapHeight?: number;
    image?: string;
    openImage?: string;
    isOpen?: boolean;
    isLocked?: boolean;
    isBroken?: boolean;
    lockDifficulty?: number;
  }
): Connection {
  const preset = connectionPresets[presetId];
  if (!preset) {
    throw new Error(`Connection preset '${presetId}' not found. Available presets: ${Object.keys(connectionPresets).join(', ')}`);
  }

  // Use preset values with overrides
  const mapWidth = overrides?.mapWidth ?? preset.mapWidth;
  const mapHeight = overrides?.mapHeight ?? preset.mapHeight;
  const image = overrides?.image ?? preset.image;

  // Check if this should be a door
  if (preset.door) {
    // Extract door properties from preset
    const properties = preset.properties || {};
    const lockDifficulty = overrides?.lockDifficulty ?? properties.lockDifficulty ?? 0;

    return new Door(
      x,
      y,
      mapWidth,
      mapHeight,
      image,
      overrides?.openImage ?? preset.openImage ?? image,
      rotation,
      {
        isOpen: overrides?.isOpen ?? false,
        isLocked: overrides?.isLocked ?? false,
        isBroken: overrides?.isBroken ?? false,
        lockDifficulty,
      }
    );
  }

  // Create regular connection
  return new Connection(
    x,
    y,
    mapWidth,
    mapHeight,
    image,
    rotation
  );
}

/**
 * Get all available connection preset IDs
 * @returns Array of preset IDs
 */
export function getAvailableConnectionPresets(): string[] {
  return Object.keys(connectionPresets);
}

/**
 * Get connection preset by ID
 * @param presetId The preset ID
 * @returns The connection preset or undefined if not found
 */
export function getConnectionPreset(presetId: string): ConnectionPreset | undefined {
  return connectionPresets[presetId];
}
