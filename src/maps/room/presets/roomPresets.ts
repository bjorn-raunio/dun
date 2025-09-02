import { RoomPreset, RoomPresetCategory } from './types';

// --- Room Presets by Category ---

export const roomPresetsByCategory: Record<string, RoomPresetCategory> = {
    standard: {
        presets: {
            forest1: {
                image: "rooms/forest1.jpg",
                mapWidth: 8,
                mapHeight: 10,
                outdoors: true
            },
            forest2: {
                image: "rooms/forest2.jpg",
                mapWidth: 8,
                mapHeight: 10,
                outdoors: true,
                terrain: [
                    { id: "tree", x: 1, y: 1 },
                    { id: "tree", x: 1, y: 6 },
                    { id: "tree", x: 5, y: 8 },
                ]
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
