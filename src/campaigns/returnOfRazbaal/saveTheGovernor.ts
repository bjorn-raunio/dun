import { faction_bandits } from "../../creatures/monsters/factions/bandits";
import { QuestMapPreset } from "../../maps";
import { magicPortalQuestThread } from "./theMagicPortal";

export const bibalQuestThread = `
Governor Sir Baucian desses in silk clothes that are hard to find among the nobility of any latitude. The wide carpets that cover the floors of the palace rival the golden candlesticks and the marble of the massive 
columns that support the domes. You are amazed at such exuberant riches.

Sir Baucian agrees to meet you even though he claims to have limited time. The line of petitioners and heralds reaches the street and the official looks tired and bored in his seat.

After listening to your valuable information and your request for work, he entrusts you with a surveillance task. Soon he will have a meeting in one of the great halls of the city. He's going to parley with the 
nobles of Alania and fears a conspiracy ahainst him. The kingdom of Bibal exploits most of the mining sites on that side of the world and that generates a lot of distrust even among its supposed allies.

"My best warriors will be stationed at the entrances and by my side, but I will need some people to come incognito and watch any strange movement."
`;

export const saveTheGovernor: QuestMapPreset = {
    id: "saveTheGovernor",
    name: "Save The Governor",
    description: `
    Sir Baucian is gathered in the great hall of one of Bibal's stately homes. Several noblemen from Alania share a conversation with him. They talk about trade agreements, boundary disputes and property titles. 
    These are not heated discussions and the meeting takes place in an atmosphere of cordiality. However, someone plans to attack the governor of Bibal. You are located at different parts of that floor of the manor 
    and stay alert to the slightest suspicious movement. On that floor of the building there are practically only counselors, some servants and cooks, and a couple of guards. The rest of the soldiers protect the 
    entrances and the upper floor. Perhaps there is a murderer among the servants or among one of the advisors or even the nobles. There are several suspects but you can't do anything if you haven't seen a sudden 
    move or a weapon drawn. All the employees and noblemen are supposed to have entered the room unarmed, except for the two guards in the living room. 
    `,
    goal: `Prevent Sir Baucian from being Knocked Out. All assassins must be Knocked Out.`,
    region: "t2",
    faction: faction_bandits,
    victoryCondition: () => true,
    success: {
        description: `
        You have managed to intercept the assassin and many of the nobles thank you for your swift action. Some, on the other hand, look at you with certain mistrust. Sir Baucian himself raises his voice to strike 
        at the supposed instigators.

        "I don't know who hired that wrongdoer, or whether the one to blame or someone working for him is in this room. In any case, this affects my trust towards all of you. My king Bocepian will not tolerate this. 
        You know that we have agreed to share the exploitation of some mines, but, quite possibly, from now on those relations will end. In fact, we will establish a new tax for those who wish to trade in our city."

        Sir Baucian turns his back with disdain on all those present and orders you to accompany him outside, along with his soldiers. You hasten to take the assassin's dagger and wrap it in cloth.

        "I will thank you forever for your assistance and success in ridding me if this attack," says the influential ruler. "I will relate your feat to the king and I'll make sure you are properly rewarded."
        
        ` + magicPortalQuestThread,
        reward: () => {
            return { goldPerHero: 10, experience: 1 };
        },
        newQuests: ["theMagicPortal"]
    },
    failure: {
        description: `
        Probably no one could have reacted quickly enough to save Sir Baucian. The governor lies on the ground in the middle of a pool of blood that grows like the high tide. He has been stabbed in the heart and some 
        unintelligible words emerge from his death rattles. Although the murderer has been apprehended, a shadow covers all the faces of the nobles and advisors present there. Everyone knows what that attack means. 
        At the very least, the breaking of all the agreements reached in recent years. Perhaps even a war. Bibal has numerical inferiority, however, all the noblemen dread its well-equipped army. Besides, its powerful 
        economy might easily gather armies of mercenaries from every corner of the world. Some of the people present try to get closer to the deceased but you forbid them to do it. You take the weapon with which the 
        crime was perpetrated and wrap it in a cloth. You warn the soldiers stationed below, who quickly take charge of their lord and order you to accompany them to relate what happened before king Bocepian V.
        
        ` + magicPortalQuestThread,
        newQuests: ["theMagicPortal"]
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