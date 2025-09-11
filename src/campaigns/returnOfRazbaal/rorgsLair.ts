import { faction_bandits } from "../../creatures/monsters/factions/bandits";
import { QuestMapPreset } from "../../maps";

export const rorgsLair: QuestMapPreset = {
    id: "rorgsLair",
    name: "Rorg's Lair",
    description: `Deep inside the forest of Rohuan there is such a big manor that it could look like a small fort. At one end a tower has been erected with masonry ashlars and the windows of the ground floor of the building have been blinded with planks. That is said to be the den of Rorg, a veteran mercenary who abandoned his profession to carve out a career outside the law. He is followed by a group of faithful ones who glorify his strength and determination. Some were companions in the trade. Others have been chosen from among the best thieves and murderers in the region. Together they form a small clan of outlaws that often descend south to devastate the region of Verneck.`,
    goal: `Knock Out Rorg.`,
    region: "t25",
    faction: faction_bandits,
    victoryCondition: () => true,
    success: {
        description: `
        You take a handcuffed Rorg to Verneck. Wounded and immobilized by the ropes, he is object of mockery and insults by the inhabitants of the city who recognizes him as he advances by your side. Governor Hart 
        publicly meets you and congratulates you. He orders him to be locked up in the dungeons. Rorg will he hanged in the cathederal square on a festive day, during which Hart will announce to the merchants gathered 
        there that the road to Verneck will now be safer.

        Later, the chief of the guard meets you in a tavern and pays you the agreed amount: "I knew you wouldn't dissapoint me," he smiles. "Now that I have more confidence in your skills, I think I can count on you for 
        further work. Don't you want to be part of the city guard? I understand, the continuous watch is tedious and fighting sleep at night is really hard in winter, when your fingers freeze in the heat of the bonfires on 
        the walls. You prefer adventures, as used to happen to me in my youth. I think it's perfect you know? I've heard that in Barrock they need adventurers like you. There is a huge creature that roams the hills and 
        ravages the farms in its path. They still don't know if it's a giant or an ettin, perhaps a huge troll that has wandered too far from its forest. You can also cross the Asdurag and head north through the swampy 
        lands to the edge of the barbarian steppes. In that area there are some barrows where nobles of old protect great treasures and relics."
        `,
        reward: () => {
            return { gold: 10, experience: 1, experienceTimeBonus: 1 };
        },
        newQuests: ["huntingTheGreatCreature"]
    },
    failure: {
        description: `
        You have not achieved your mission and you are ashamed of it before Arthos, who tears the contract which he had signed for your services. 

        "There will be no new chance for you. You have lost all my confidence. I believe you have no future as adventurers and sooner or later you will perish in some ambush or be slaughtered in a dungeon. I will have 
        to take care of Rorg myself. Get out of my sight!"

        As you leave the governor's house, you decide to reflect on your future. You have truly lost all self-confidence. At that moment, as you walk through the streets crowded with wagons carrying all sorts of things, you hear an 
        interesting conversation being held between two merchants.

        "They say it might be a troll, though its footsteps seem to be the size of a horse."

        "Then it can only be on thing. A giant. No troll has reached that size, not even the beasts that emerge from the caves of Bandmor or further east."

        "If there reallty is a creature that size haunting the area, I won't risk going further up north. The road to Bibal is now the most dangerous."

        You approach the merchants and ask for more information.

        "In Barrock they need some adventurer ti go into the Guardian Hills and find the den if that creature," explains a merchant with a leafy beard. "If anyone were able to kill it he would gain the favor of the Count of 
        the region and also of all the ranchers and farmers."        
        `,
        newQuests: ["huntingTheGreatCreature"]
    },
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
    creatures: [
        {
            type: "monster",
            variant: "bandit_leader",
            position: { x: 12, y: 7, facing: 1 },
            options: {
                weaponLoadout: "broadsword",
                armorLoadout: "shield",
                leader: true
            }
        },
    ],
    startingTiles: [
        { x: 26, y: 16 },
    ]
}