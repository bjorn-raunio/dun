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
