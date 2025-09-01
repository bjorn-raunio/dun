// --- Room Presets Exports ---

export type { RoomPreset, RoomPresetCategory } from './types';
export { roomPresets, roomPresetsByCategory } from './roomPresets';
export { 
  createRoom, 
  getAvailableRoomPresets, 
  getRoomPreset 
} from './factory';
