import { faction_devastators } from "../../creatures/monsters/factions/devastators";
import { QuestMapPreset } from "../../maps";

const questThreadEnd = `You dared to enter Krogal's abode and that almost meant death. Luckily, you managed to get out before it was too late. Now, you need some rest. During the trip you heard that your services ¨
might be needed in Norkfall, since it is a troubled region. There are barbarians and trolls to the north of the castle that dominates the region. You decide to travel there to get your strength back.`;

export const theMirrorRoom: QuestMapPreset = {
    id: "theMirrorRoom",
    name: "The Mirror Room",
    description: `
    You have been ascending the cliffs from the beach for so long that you think it is impossible that you have not reached the sky. The almost vertical staircase makes it difficult for you to breathe and you have to 
    hold on to the rock so that the weight of your luggage does not drag you into the void. Down there, where the sea breaks against the rocks and washes the small coves of sand, you see the keels of the shipwrecks, 
    so tiny that they look like skeletons of wooden insects. You are well sheltered but the icy air lacers your throats like razors. You reach the limit of the cliff and from there you can behold the extension of the sea 
    that separates you from the continent. You discover that the road forks into several narrow paths. One of them leads you to the entrance to the abode of Krogal, one of the oracles of the Blood Kingdom which is also 
    known for his mastery of dark magic. The place, protected by several guardians, has become a sanctuary which the great chiefs of devastator clans visit from time to time, starting their incursions in the continent 
    or declaring war against a neighbouring clan.
    `,
    goal: `Knock Out the Quest's Leader.`,
    region: "t2",
    faction: faction_devastators,
    victoryCondition: () => true,
    success: {
        description: questThreadEnd,
        reward: () => {
            return { experience: 2, experienceTimeBonus: 1 };
        },
        newQuests: ["rescueDaniel"]
    },
    failure: {
        description: questThreadEnd,
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