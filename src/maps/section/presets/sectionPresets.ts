import { SectionPreset, SectionPresetCategory } from './types';

// --- Section Presets by Category ---

export const sectionPresetsByCategory: Record<string, SectionPresetCategory> = {
    standard: {
        presets: {
            forest1: {
                image: "forest1.jpg",
                mapWidth: 8,
                mapHeight: 10,
                outdoors: true
            },
            forest2: {
                image: "forest2.jpg",
                mapWidth: 8,
                mapHeight: 10,
                outdoors: true,
                terrain: [
                    { id: "tree", x: 1, y: 1 },
                    { id: "tree", x: 1, y: 6 },
                    { id: "tree", x: 5, y: 8 },
                ]
            },
            stairsDown: {
                image: "stairsDown.jpg",
                mapWidth: 2,
                mapHeight: 2
            },
            room2a: {
                image: "room2a.jpg",
                mapWidth: 8,
                mapHeight: 10
            },
            room6b: {
                image: "room6b.jpg",
                mapWidth: 6,
                mapHeight: 6
            },
            room8b: {
                image: "room8b.jpg",
                mapWidth: 6,
                mapHeight: 6
            },
            room12a: {
                image: "room12a.jpg",
                mapWidth: 6,
                mapHeight: 6
            },
            room18a: {
                image: "room18a.jpg",
                mapWidth: 6,
                mapHeight: 6
            },
            room20b: {
                image: "room20b.jpg",
                mapWidth: 4,
                mapHeight: 4
            },
            room37b: {
                image: "room37b.jpg",
                mapWidth: 1,
                mapHeight: 6
            }
        }
    },
    corridors: {
        presets: {
        }
    },
};

// Flattened section presets for easy access
export const sectionPresets: Record<string, SectionPreset> = Object.values(sectionPresetsByCategory)
    .reduce((acc, category) => {
        return { ...acc, ...category.presets };
    }, {} as Record<string, SectionPreset>);
