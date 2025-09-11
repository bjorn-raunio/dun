import { QuestMapPreset } from "../../maps";
import { faction_bandits } from "../../creatures/monsters/factions/bandits";

export const freeTheMerchants: QuestMapPreset = {
    id: "freeTheMerchants",
    name: "Free the Merchants",
    description: `In this area of the grove the road descends to a hollow where the leaves and branches of shrubs are piled 
    up dragged by the rains. It is a perfect place to take a false step on a hidden trap or be the victim of an 
    ambush. The wagon of a merchant couple moves slowly. The draught horses are exhausted. They have 
    no escort... Suddenly, the man, covered by an overcoat and a wide hat, hears a cracking sound coming 
    from one side of the road. He tells himself it's just a bird or a squirrel climbing up a tree. He looks up 
    and detects no movement. His wife, who travels behind him, alerts him with a shriek. Several shadows 
    appear between the tree trunks and the first arrows whistle. The driver tries to herd the horses with the 
    whip, but soon discovers that the road is cut by a trunk. There is no escape.`,
    goal: `prevent at least one of the two merchants from being Knocked Out before the end of the heroes' last turn.`,
    region: "t26",
    faction: faction_bandits,
    victoryCondition: () => true,
    success: {
        description: `
        The bandits do not achieve their goal and some are made prisoners by you. You know how to be persuasive and they acknowledge that Count Ricierd rewards them for these attacks on the caravans. 
    Rorg and his minions agreed with Ricierd one year ago that they would not attack any travelers heading north. However, they were allowed to assault any caravans heading west of Verneck. In addition, Ricierd had 
    given the gang a manor house withing his own lands where they could hide and avoid being pursued by Verneck's soldiers. You take the prisoners to Hart, the governor of Verneck. The plump mandatary orders the bandits
    to be hanged in the cathederal square and later summons you to meet him in his chambers. Arthos, the chief of the guard, comes forward to offer you the promised reward. Later, Hart explains the quarrels he has with 
    the northern region and his willingness to tackle the problem of the assaults. He knocks on the oak table in his office before forwarding his request: "I promise 10 gold coins if you manage to discover Rorg's lair and
    end up with that wretch, seizing him and bringing him before our presence."
    `,
    reward: () => {
        return { goldPerHero: 4, experience: 1 };
    },
    newQuests: ["rorgsLair"]
    },
    failure: {
        description: `
        The bandits achieve their goal and several of them escape with bags loaded with spice jars, clothes and silver ornaments. The bandits are quicker but, despite your injuries and accumulated fatigue, 
    you manage to follow their trail to the forest that rises to the north. On the way you cross by farms and small towns where the bandits have stolen some animals and beaten several locals. They describe them so 
    accurately that you could recognize them in a crowd. Some of their faces carved side to side by a scar. Others are toothless or one-eyed. Already in the forest of Rohuan, you follow the track of the outlaws crossing 
    streams, clearings and ravines, until you finally reach Rorg's lair.
    `,
    newQuests: ["rorgsLair"]
    },
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
            position: { x: 4, y: 7, facing: 2 },
            options: {
                minHeroes: 3
            }
        },
        {
            type: "monster",
            variant: "warhound",
            position: { x: 3, y: 7, facing: 2 },
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