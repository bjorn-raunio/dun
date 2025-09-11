import { faction_insects } from "../../creatures/monsters/factions/insects";
import { QuestMapPreset } from "../../maps";

export const theSpidersNest: QuestMapPreset = {
    id: "theSpidersNest",
    name: "The Spiders Nest",
    description: `
    Plump tells you about a nest of giant spiders that one of the castle's scouts discovered while he was hunting. It is located a few miles from the southern edge of the Troll Forest. He informs you that giant spiders happen 
    to like shiny objects and it is very likely that they keep many riches that once belonged to their victims.
    —Be very careful with the poison in their fangs —he warns you—. Rudf, the scout that discovered the place, will go with you. The more fangs of these creatures you bring to Norkfall, the safer the forest and the better 
    your reward. If you find the Queen Spider, slay it and destroy the eggs it might protect.
    `,
    goal: `Knock Out the Queen Spider.`,
    region: "t2",
    faction: faction_insects,
    victoryCondition: () => true,
    success: {
        description: `
        "Oh, that's amazing!" Plump exclaims as soon as you reveal the contents of a bag where you kept all the fangs plucked from the spiders. "That colony of spiders was really a growing danger. I'm glad to know they won't be 
        causing any more trouble."

        Count Buchter's scribe and personal assistant pays you a coin each for each spider eliminated, and another five coins for the queen spider.

        "I hope you found some interesting treasures there. I must inform you that I will soon be traveling north to a city in the Torath forest. I must speak in the Counts name, and I need good escorts. Of course, 
        the reward will be generous."
        `,
        reward: () => {
            let numberOfSpidersSlain = 10; //TO BE CHANGED TO THE NUMBER OF SPIDERS KILLED
            return { gold: 5 + numberOfSpidersSlain, experience: 1, experienceTimeBonus: 1 };
        },
        newQuests: ["escortPlump"]
    },
    failure: {
        description: `After your failure, Plump decides you are not worthy of his confidence and does not offer you new missions.`,
        newQuests: []
    },
    connections: [],
    rooms: [
    ],
    creatures: [
    ],
    startingTiles: [
        { x: 0, y: 0 },
    ]
}