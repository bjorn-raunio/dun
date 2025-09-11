import { faction_demons } from "../../creatures/monsters/factions/demons";
import { QuestMapPreset } from "../../maps";

export const magicPortalQuestThread = `
Blacian, one of the old consellors in the royal palace, observes the dagger you recovered from the attack. His little eyes scrutinize its carved wooden handle from behind the thick lenses of his glasses.

"I wouldn't have been surprised if this murderer had been commissioned by the governor of Verneck or one of the most influential families in that city," says the old man. "Their power is growing and they probably 
think they can destabilize Bibal this way. But the origins of this dagger makes me doubt, There are charcters that only a master of dark magic could reproduce. They are word alluding to underworld creatures."

"Demons," one of you mumbles.

"That's right. That murderer could serve the sorcerer of the underworld who lives in the nearby hills. It wouldn't be unreasonable. We have suffered his curses for years, and we have not yet found his lair, 
but there are not too many areas left to search in this region."
`;

export const theMagicPortal: QuestMapPreset = {
    id: "theMagicPortal",
    name: "The Magic Portal",
    description: `
    The old counselor's words are resolute:

    — It is of vital importance that you find that sorcerer from the underworld and capture him. His dark practices must have an end behind bars.

    You all nod in agreement. You can't afford to falter when you get a mission straight from a king. The counselor stiffens his beard before proceeding:

    —Of course, the king will generously reward you if you give us that bastard. One of you dares to ask about the kind of creatures that escort the sorcerer. That scoundrel has been summoning demons for years.

    —the counselor mumbles—. It seems that he hides in a secret chamber protected by a magic portal that only opens once certain mechanisms have been activated. After you manage to open the portal you will have a 
    limited time to get through it and capture the sorcerer. Two of our best scouts will help you find the entrance to his lair.
    `,
    goal: `Capture the Underworld Sorcerer, Knocking him Out.`,
    region: "t2",
    faction: faction_demons,
    victoryCondition: () => true,
    success: {
        description: `
        You have captured Zhorfund, the sorcerer from the underworld, and you take him back to Bibal, tied up.

        You have captured the sorcerer from the underworld, Zhorfund, and brought him back to Bibal, handcuffed. You have built some sort of cart with an improvised jail on top made with branches. Branches that you hit 
        hard every time you listen to Zhorfund cursing in a low voice and whenever he utters what you fear are enchantments to manipulate your minds. You would cut off his tongue but you know that it is important 
        that he keeps it.

        Once in Bibal, Bocepian himself ewlcomes you in his throne room after his guard have taken Zhorfund down to the dungeons below the surface of the lake of the same name as the city. The king is accompanies 
        by several advisors, among them the old Blacian. 

        "Is seems that new events are unleashed with rge speed of a river in spring," says the monarch. "Now perhaps we can extract information from Zhorfund. My executioners have tools to make him speak." 

        "But," adds the old Blacian, as he steps forward among the other councillors, "dires news has come from the east. A crow has brought a message. They ask for help from Menon. They need groups of adventurers and 
        explorers able to travel and pass unnoticed in distant lands."

        "I think this is the first time in the history of this city that a request for help has been recieved from a civilization as old as the kamaerin," argues the king, nodding as he watches you, "and we believe 
        that Zhorfund may be involved. Since you have proved your efficiency and good services to this crown, I am going to choose you as the group of heroes that my house will send to Kämaer in order to help them. 
        You will also carry a message to King Avatarin, offering militart support if required. You will depart tomorrow at dawn. Tonight I will pay for your rest at an inn of your choice. Before leaving you will 
        be given the message that you must deliver to Avatarian and any useful information extracted frin the sorcerer of the underworld."        
        `,
        newQuests: [], //TO BE CONTINUED
        reward: () => {
            return { experience: 2 };
        },
    },
    failure: {
        description: `
        You have failed to capture the Underworld Sorcerer. The king will not be happy with you.
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