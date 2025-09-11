import { faction_barbarians } from "../../creatures/monsters/factions/barbarians";
import { QuestMapPreset } from "../../maps";
import { capturedQuestThread } from "./sneakIntoThorzul";

export const escortPlump: QuestMapPreset = {
    id: "escortPlump",
    name: "Escort Plump",
    description: `
    You have escorted Plump to the city and your presence has been sufficient to dissuade anyone who could have meant a threat against him. However, his business there seems to have been so fruitful that he decides to treat 
    you to several rounds in a tavern. After some pints Plump is willing to try his luck at cards and manages to bust the other players. Your presence is all that saves him from getting  a good beating, since some of them 
    accuse him of cheating. You must escort him out of  this busy street full of brothels and gambling houses. You find yourselves in hostile terrain, infested with warriors thirsty of blood and gold. You must hurry or it 
    will be impossible for you to get out of here at all.
    `,
    goal: `Get Plump to reach the goal  before the end of the last turn of the heroes.`,
    region: "t2",
    faction: faction_barbarians,
    victoryCondition: () => true,
    success: {
        description: `
        "That was a narrow squeak!" Plump howls when you manage to escape and outrun your pursuers. "I never thought I could be so lucky." 

        The man takes out a small bag full of money from underneath his overcoat and gives out 6 coins for each of you.

        "This is for escorting me all the way and for helping me to escape from that wretched alley. But don't think I'm leavuing you free. Before leaving the city, I must carry out a more important mission than the one I 
        told you about in Norkfall. Indeed, the true purpose for which I have come here is not to strengthen commercial ties with the barbarians, although this is important as well. My lord also send me to secretly 
        enter the library of the nearby castle of Thorzul, which as you know is where the leader of the clans of the Thorath forest resides. There they store the maps and record books of the region that accurately describe 
        all the watchtowers arranged on the borders with our domains, as well as the number of guards in each one, the quantities of grain and groceries in their warehouses, the location of their armouries... 
        everything that is interesting to know in case of war. The kingdom of Bibal has long planned an invasion from the north and that information would be would be very valuable to them. Count Buchter will pay you very 
        generously if you help me get those maps and books."
        `,
        reward: () => {
            return { goldPerHero: 6, experience: 1, experienceTimeBonus: 1 };
        },
        newQuests: ["sneakIntoThorzul"]
    },
    failure: {
        description: `
        You're finally intercepted and beaten up. The city guards arrive before you're rats food. Plump has been accused of cheating by a crowd and you have been identified as accomplices. They put you all in shackles and send 
        you to the dungeons of Thorzul Castle.

        Plump reveals to you that it will no longer be possible to come back to Count Buchter, even if you manage to escape from prison. When asked, he reveals that he really had another secret mission to perform. He had to 
        get confidential information in order to give it to him and gain the favor of the kingdom of Bibal, as the king plans to invade the Torath forest and take all the barbarian cities inside.
        
        ` + capturedQuestThread,
        newQuests: ["prisonEscape"]
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