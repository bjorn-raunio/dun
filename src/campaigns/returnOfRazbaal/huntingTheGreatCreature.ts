import { faction_insects } from "../../creatures/monsters/factions/insects";
import { QuestMapPreset } from "../../maps";

const questThreadEnd = `
You're resting in a tavern on the road. A person approaches you cautiously. He is a man, thin as a reed and with an angular face highlighted by a broad moustache:

"Please, I need help. I am Plump, scribe of Norkfall Castle. Some evildoers have captured Daniel, Count Buchter's eldest son, and have him imprisoned somewhere in the region. They threaten to kill him if Buchter does not 
pay a generous ransom, but my lord doesn't want to show weakness. His position is delicate, in an area near the domains of the powerful Bibal, under the pressure of the barbarians in the North and with the course of the 
river Asdurag preventing any retreat. We need someone who can locate and rescue his son."

You don't know whether to accept the mission. In another conversation, a traveler has assured you that in the nearby castle of Aris'Thai the chief of the guard is looking for a group of people capable of investigating 
the theft of several horses.
`;

export const huntingTheGreatCreature: QuestMapPreset = {
    id: "huntingTheGreatCreature",
    name: "Hunting the Great Creature",
    description: `
    The creature's tracks sink into the hard ground like the footprints of a human on a sand beach. Its weight must be incredible. Now you come to understand the terror of the locals. Some have told you that 
    they have seen it drag huge oxen with one hand. It is easy to follow the trail of such a large creature, but no one dares to enter the cave where it lurks. Who knows what kind of objects and belongings lie among the 
    carcasses of its unfortunate victims?
    `,
    goal: `Knock Out the Quest's Leader.`,
    region: "t28",
    faction: faction_insects,
    victoryCondition: () => true,
    success: {
        description: `
        You managed to slay the giant. If you travel to Barrock, the governor will reward you. After this remarkable deed you feel skillful enough to face any kind of creature. It is a feat that you'll be asked to narrate 
        in every tavern.
        
        ` + questThreadEnd,
        reward: () => {
            return { goldPerHero: 10, experience: 1, experienceTimeBonus: 1 };
        },
        newQuests: ["rescueDaniel"]
    },
    failure: {
        description: `
        Unfortunately, you weren't able to kill the giant that was ravaging the area. You understand that, as adventurers, you must get more experience before you embark on difficult missions like this.
        
        ` + questThreadEnd,
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