import { RoomPreset, RoomPresetCategory } from './types';

// --- Room Presets by Category ---

export const roomPresetsByCategory: Record<string, RoomPresetCategory> = {
    standard: {
        presets: {
            forest1: {
                image: "rooms/forest1.jpg",
                mapWidth: 8,
                mapHeight: 10,
                outdoors: true,
            },
            forest2: {
                image: "rooms/forest2.jpg",
                mapWidth: 8,
                mapHeight: 10,
                outdoors: true,
            },
        }
    },
    corridors: {
        presets: {
        }
    },
};

// Flattened room presets for easy access
export const roomPresets: Record<string, RoomPreset> = Object.values(roomPresetsByCategory)
    .reduce((acc, category) => {
        return { ...acc, ...category.presets };
    }, {} as Record<string, RoomPreset>);
