import { faction_bandits } from "../../creatures/monsters/factions/bandits";
import { QuestMapPreset } from "../../maps";

export const rescueDaniel: QuestMapPreset = {
    id: "rescueDaniel",
    name: "Rescue Daniel",
    description: `
    Count Buchter of Norkfall has hired you to free his first-born son, Daniel, kidnapped by a group of bandits who demand a ransom. The nobleman refuses to pay them so as not to show weakness and asks you to 
    find and release his son, and bring him home safe and sound. Less than a day's walk away you find a house where the prisoner might be found, according to some information provided by several locals who have seen 
    suspicious movements. As you study the place, the possible accesses and escapes, you notice that several men leave the building and take the road to a nearby village. If they took long enough to return you might be 
    able to face the few guards who remain at the site.
    `,
    goal: `Free Daniel from his cell and help him reach the goal  (he mustn't be Knocked Out) before the end of the last turn of the heroes.`,
    region: "t30",
    faction: faction_bandits,
    victoryCondition: () => true,
    success: {
        description: `
        You've managed to rescue Daniel. When you arrive in Norkfall, the young man's parents come out to greet you, accompanied by the castle guards. You are greeted a gift of 6 gold coins each. In addition, 
        you are invited to a feast that lasts for hours. During the celebration, Count Buchter asks you to escort his scribe, Plump, to a city under the domination of the barbarians of the north.

        "Plump must come to parliament on trade matters," says Buchter. "Although he has a safeguard from the lord of the city, you know that all places can be dangerous, and I cannot trust the promises of 
        barbarians used to living in the wilderness like beasts."
        `,
        reward: () => {
            return { experience: 2 };
        },
        newQuests: ["escortPlump"]
    },
    failure: {
        description: `
        Buchter looks at you with a heavy face when you inform him of the failure of the mission. He meets with you, the countess, his scribe Plump and a few guards on the upper floor of the keep. He has lost his son 
        and, while his wife cries in anguish, he tries to stand firm despite his desire to shed tears and tear down the walls knocking them with his knuckles.

        "We all knew that the mission was complicated and also that time was against us. I thank you for accepting the mission, despite your failure. You can rest here. On the other hand, Plump can surelt inform you 
        of some place where you can earn some money and be useful to us at the same time. From the nearby forests creatures emerge that plague our lands. Bears, great spiders, witches, even trolls."
        `,
        newQuests: ["theSpidersNest"]
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