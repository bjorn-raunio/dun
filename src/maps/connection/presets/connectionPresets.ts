import { ConnectionPreset } from './types';

// --- Connection Presets ---

export const connectionPresets: Record<string, ConnectionPreset> = {
  doorA: {
    image: 'doorA.png',
    openImage: 'doorA_open.png',
    mapWidth: 1,
    mapHeight: 2,
    door: true
  },
  doorD: {
    image: 'doorD.png',
    openImage: 'doorD_open.png',
    mapWidth: 2,
    mapHeight: 2,
    door: true
  }
};