import { faction_barbarians } from "../../creatures/monsters/factions/barbarians";
import { QuestMapPreset } from "../../maps";
import { bibalQuestThread } from "./saveTheGovernor";

export const prisonEscape: QuestMapPreset = {
    id: "prisonEscape",
    name: "Prison Escape",
    description: `    
    The guards have deprived you of your weapons, armor and coats and, down there, in the dungeons, the cold and humidity make you shiver at night. Under the protection of the dim light of the torches the tortures 
    begin. The red iron makes you shiver with pain and fear. You are asked again and again in languages which sound the growl of a dog. The jailers, their faces cloaked with hoods, enjoy your pain and smile 
    confidently: there are many days ahead. They don't know if you have any valuable information to confess but they enjoy what they're doing all the same. Only three nights have passed when the two jailers decide 
    to get drunk while you watch them from your cell. They joke about your bruises and burns as they insult you and spit at you from time to time. One of them is so drunk that he ends up falling asleep leaning on the 
    bars of your cell. The other also falls asleep, his head resting on a table. You have a chance. The keys in the first jailer's belt are easy to reach. Try to get your weapons back. Surely there is some 
    underground passage down here that might allow you to leave the castle without passing through the walls.
    `,
    goal: `Reach the goal before the end of the last turn of the heroes. `,
    region: "t2",
    faction: faction_barbarians,
    victoryCondition: () => true,
    success: {
        description: `
        You manage to escape from Thorzul and flee crouching under the shelter of the night and the trees. You hear alarm voices behind you and some dogs barking. That quickens your hearts even more. You run as if you 
        had a lion behind you. When you rach a stream, you spend a few moments smearing all your skin and clothing with the mud of the shore, not knowing if it will work. You continue to a wide gorge crossed by a 
        catwalk. When you reach the other end, you decide to cut the rope and the fragile bridge collapses and falls into the void, assuring your escape. Plump couldn't keep up with you during the escape and you 
        lost him. Given the circumstances, you understand that you cannot return to Norkfall, so you decide to head to Bibal to ask for an audience with king Bocepian V or the governor. They might find it interesting 
        that in Thorzul there are manuscripts that could compromise the defenses of all barbarian clans. Perhaps in Bibal they will hire you to return to that castle or for some other task.

        ` + bibalQuestThread,
        reward: () => {
            return { experience: 1, experienceTimeBonus: 1 };
        },
        newQuests: ["saveTheGovernor"]
    },
    failure: {
        description: `
        Your escape attempt fails and you're caught again. From then on, the guard is redoubled in the dungeons and you have a jailer to watch over you day and night. Eventually, the day of the execution arrives and the 
        lord of the castle orders you to be executed by tying each of your limbs to the rump of a horse. When they finish each of you, the severed limbs are sent south of the Torath forest and hung on lined poles 
        as a warning to enemy spies and warriors.
        `,
        newQuests: undefined //END CAMPAIGN
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