import { faction_barbarians } from "../../creatures/monsters/factions/barbarians";
import { QuestMapPreset } from "../../maps";
import { bibalQuestThread } from "./saveTheGovernor";

export const capturedQuestThread = `
The scribe tells you that there is no chance that someone will be rescuing you from Norkfall or elsewhere. Count Buchter will not risk sending anyone else.

"In fact," he tells you with complete certainty, to your surprise, "I wouldn't be surprised if Buchter managed to pay one of the guards to finish us off before they torture information out of us."

In the face of your stupefaction, since Plump has been working for the nobleman for half of his life, the scribe merely shrugs his shoulders.

"That's the way he is," he says. "One cannot become a great lord in these latitudes if one shows weakness."

Therefore, there is only one option. Trying to escape as soon as you find the slightes possibility.
`;

export const sneakIntoThorzul: QuestMapPreset = {
    id: "sneakIntoThorzul",
    name: "Sneak Into Thorzul",
    description: `    
    You are on the outskirts of Thorzul Castle, hidden in the thick of the forest. The outer walls are not far away, its ashlars bathed in the red sunset. It is not the most imposing of castles, but no siege machine would 
    get there easily, nor could it be mounted at a suitable distance, which turns it into an almost inexpugnable place. Torath's dense forest is its best defense against enemy invasions, but it is also a magnificent mantle 
    that hides spies and small groups of enemies. As night falls, you must avoid the patrols at the battlements and climb the walls to then hide among the inner buildings. Then you must reach the tower keep and find its 
    library. Plump's instructions are clear. He knows the area and can accurately depict what you will find beyond the walls. You should be able to protect him as you move forward. It will not be easy. A mistake can cost 
    your lives or, at the very least, your freedom.                                                                    
    `,
    goal: `Steal the library's record books and then escape through a trapdoor that gives access to the outside. Plump cannot be Knocked Out.`,
    region: "t2",
    faction: faction_barbarians,
    victoryCondition: () => true,
    success: {
        description: `
        "Splendid!" exclaims Buchter. His round face lights up with joy as he consults the books and maps you have places before him. "Today I will irder a pigeon to be sent to the king of Bibal informing him that I have 
        obtained key information for his claims."

        The Count orders Plump to pay you 10 coins each in reward. But he doesn't just let you go. You have become a very profitable group of mercenaries for him.

        "I still have one last mission for you. You must go to Bibal and hand over one of these documents to the governor of the city, as a proof that my message is true. Perhaps ou will be lucky and the king himself will 
        recieve you. In any case, you must go early. This information must be delivered as soon as possible."

        ` + bibalQuestThread,
        reward: () => {
            return { goldPerHero: 10, experience: 1, experienceTimeBonus: 1 };
        },
        newQuests: ["saveTheGovernor"]
    },
    failure: {
        description: `
        The castle guards have captured you. They put you in shackles and send you to the dungeons together with Plump.

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