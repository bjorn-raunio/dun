import { QuestMapPreset } from "../../maps";

export const rorgsLair: QuestMapPreset = {
    name: "Rorg's Lair",
    description: "Explore Rorg's lair",
    region: "t25",
    connections: [
        {
            presetId: "doorA", x: 21, y: 17, rotation: 270
        },
        {
            presetId: "doorA", x: 19, y: 15
        },
        {
            presetId: "doorD", x: 15, y: 17, rotation: 90
        },
        {
            presetId: "doorA", x: 21, y: 12, rotation: 270
        },
        {
            presetId: "doorA", x: 5, y: 13, rotation: 270
        },
    ],
    rooms: [
        {
            sections: [
                {
                    type: "room8b", x: 22, y: 14, rotation: 90,
                    options: {}
                }
            ]
        },
        {
            sections: [
                {
                    type: "room12a", x: 16, y: 16,
                    options: {
                        terrain: [
                            { id: "boxes", x: 2, y: 3, rotation: 0 }
                        ]
                    }
                }
            ]
        },
        {
            sections: [
                {
                    type: "room18a", x: 16, y: 10,
                    options: {
                        terrain: [
                            { id: "weaponRack", x: 3, y: 1, rotation: 270 }
                        ]
                    }
                }
            ]
        },
        {
            sections: [
                {
                    type: "room20b", x: 22, y: 10, rotation: 270,
                    options: {}
                }
            ]
        },
        {
            sections: [
                {
                    type: "room2a", x: 6, y: 12, rotation: 90,
                    options: {
                        terrain: [
                            { id: "tableA", x: 2, y: 4, rotation: 270 }
                        ]
                    }
                }
            ]
        },
        {
            sections: [
                {
                    type: "room37b", x: 0, y: 12, rotation: 90,
                    options: {}
                },
                {
                    type: "room6b", x: 0, y: 13, rotation: 270,
                    options: {}
                }
            ]
        },
        {
            sections: [
                {
                    type: "stairsDown", x: 0, y: 8, rotation: 180,
                    options: {}
                }
            ]
        },
        {
            sections: [
                {
                    type: "room18a", x: 0, y: 2,
                    options: {}
                }
            ]
        },
        {
            sections: [
                {
                    type: "room2a", x: 6, y: 0, rotation: 90,
                    options: {}
                }
            ]
        }
    ],
    creatures: [],
    startingTiles: [
        { x: 26, y: 16 },
    ]
}