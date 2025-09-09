import { QuestMapPreset } from "../../maps";

export const freeTheMerchants: QuestMapPreset = {
    name: "Free the Merchants",
    description: "Rescue merchants from bandits in the forest",
    region: "t26",
    connections: [],
    rooms: [
        {
            sections: [
                {
                    type: "forest1", x: 0, y: 0, rotation: 270
                },
                {
                    type: "forest2", x: 10, y: 0, rotation: 90,
                    options: {
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
        {
            type: "monster",
            variant: "human_bandit",
            position: { x: 12, y: 7, facing: 1 },
            options: {
                weaponLoadout: "broadsword",
                armorLoadout: "shield"
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
            type: "monster",
            variant: "human_bandit",
            position: { x: 8, y: 3, facing: 2 },
            options: {
                weaponLoadout: "axe",
                minHeroes: 2
            }
        },
        {
            type: "monster",
            variant: "warhound",
            position: { x: 4, y: 7, facing: 1 },
            options: {
                minHeroes: 3
            }
        },
        {
            type: "monster",
            variant: "warhound",
            position: { x: 3, y: 7, facing: 1 },
            options: {
                minHeroes: 3
            }
        },
        {
            type: "monster",
            variant: "shooter",
            position: { x: 9, y: 5, facing: 1 },
            options: {
                weaponLoadout: "shortbow",
                minHeroes: 4
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
}