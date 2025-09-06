import { QuestMapPreset, QuestMapPresetCategory } from './types';

// --- QuestMap Presets by Category ---

export const questMapPresetsByCategory: Record<string, QuestMapPresetCategory> = {
  beginner: {
    name: "Beginner Quests",
    description: "Simple quests for new players",
    presets: {
      freeTheMerchants: {
        name: "Free the Merchants",
        width: 40,
        height: 30,
        description: "Rescue merchants from bandits in the forest",
        difficulty: "easy",
        recommendedLevel: 1,
        rooms: [
          {
            sections: [
              {
                type: "forest1",
                x: 0,
                y: 0,
                options: {
                  rotation: 270
                }
              },
              {
                type: "forest2",
                x: 10,
                y: 0,
                options: {
                  rotation: 90,
                  terrain: [
                    { id: "wagon", x: 6, y: 4, rotation: 90 },
                    { id: "horse", x: 8, y: 4, rotation: 270 }
                  ]
                }
              }
            ]
          }
        ],
        creatures: [
          /*{
            type: "monster",
            variant: "human_bandit",
            position: { x: 12, y: 7, facing: 1 },
            options: {
              weaponLoadout: "broadsword",
              armorLoadout: "shield"
            }
          },*/
          {
            type: "monster",
            variant: "shooter",
            position: { x: 12, y: 7, facing: 1 },
            options: {
              weaponLoadout: "shortbow"
            }
          },
          {
            type: "monster",
            variant: "shooter",
            position: { x: 10, y: 1, facing: 3 },
            options: {
              weaponLoadout: "shortbow"
            }
          },
          {
            type: "mercenary",
            variant: "civilian",
            position: { x: 16, y: 4, facing: 6 },
            options: {
              group: "player"
            }
          },
          {
            type: "mercenary",
            variant: "civilian",
            position: { x: 17, y: 4, facing: 6 },
            options: {
              group: "player"
            }
          }
        ],
        startingTiles: [
          { x: 0, y: 1 },
          { x: 0, y: 3 }
        ]
      },
    }
  },
};

// Flattened quest map presets for easy access
export const questMapPresets: Record<string, QuestMapPreset> = Object.values(questMapPresetsByCategory)
  .reduce((acc, category) => {
    return { ...acc, ...category.presets };
  }, {} as Record<string, QuestMapPreset>);
