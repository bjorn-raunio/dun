import { TerrainPreset, TerrainPresetCategory } from './types';

// --- Terrain Presets by Category ---

export const terrainPresetsByCategory: Record<string, TerrainPresetCategory> = {
  vegetation: {
    presets: {
      tree: {
        image: "",
        mapWidth: 2,
        mapHeight: 2,
        height: 4,
      },
    }
  },
  vehicles: {
    presets: {
      wagon: {
        image: "wagon.jpg",
        mapWidth: 1,
        mapHeight: 2,
        height: 1,
      },
      horse: {
        image: "horse.jpg",
        mapWidth: 1,
        mapHeight: 2,
        height: 2,
        movementCost: Infinity, 
      },
    }
  },
};

// Flattened terrain presets for easy access
export const terrainPresets: Record<string, TerrainPreset> = Object.values(terrainPresetsByCategory)
  .reduce((acc, category) => {
    return { ...acc, ...category.presets };
  }, {} as Record<string, TerrainPreset>);
