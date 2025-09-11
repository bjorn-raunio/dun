import { faction_undead } from "../../creatures/monsters/factions/undead";
import { QuestMapPreset } from "../../maps";

export const buriedKings: QuestMapPreset = {
    id: "buriedKings",
    name: "Buried Kings",
    description: `
    The field of barrows rises above the surrounding swamps. Twisted roots underwater make you stumble as you feel the bites of mosquito clouds. When you reach the dry terrain of the elevations you feel you have left 
    behind an almost endless obstacle. Small hills plagued with barrows stand before you. Most of them hide no treasures. They are only excavations that deep a few meters underground and house the already desecrated tomb 
    of a noble family. But you detect a Real burial mound whose lintels, carved with rich filigree, are in a perfect state, as if the continuous rains hadn't made a dent in those rocks. You get a little closer and soon 
    discover that no one has dared to go in there. The corridor is flanked by wooden faces disfigured by pain. You are intimidated by a multitude of warnings and curses written in several languages. However, you feel the 
    need to continue exploring. You are the fly entering the spider's lair.
    `,
    goal: `Knock Out the Quest's Leader.`,
    region: "t41",
    faction: faction_undead,
    victoryCondition: () => true,
    success: {
        description: `
        After defeating the reawakened kings who protected the place, you search the barrow for new objects that might have gone unnoticed. After a fake tile you discover a parchment where the existence of a ring capable 
        of dominating the most powerful of the demons is revealed. The text describes the exact place where this arcane artifact is located, very far from there, beyond the North Gate, in the Blood Kingdom, where the 
        devastators dwell. Those that each lustrum descend to spread chaos over the human kingdoms, when the sea that covers the distance from their island to the continent freezes and allow these terrible warriors 
        and their beasts to cross. That island of rugged coasts is home to several powerful oracles and sorcerers. One of them is Krogal, who protects his precious ring and other belongings behind a room covered with 
        mirrors where nothing is what it seems.
        `,
        reward: () => {
            return { experience: 2, experienceTimeBonus: 1 };
        },
        newQuests: ["theMirrorRoom"]
    },
    failure: {
        description: `
        You come out of the royal barrow battered and exhausted. Those undead creatures were truly tough amd you could not achieve your purpose. You need to rest and a swamp druid guides you to Norkfall.

        "These are tricky lands. Surely you can rest there and offer your services to the lord of the castle."

        After listening to him, you resolve to travel to Norkfall to recover your strength.
        `,
        newQuests: ["rescueDaniel"]
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