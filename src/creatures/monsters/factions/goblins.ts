import { AI_BEHAVIORS } from "../../../ai";
import { SKILL_PRESETS } from "../../../skills";
import { Faction } from "../Faction";

export type GoblinType = "goblin_chief" | "goblin_warrior" | "goblin_archer" | "goblin_scout";

export const faction_goblins = new Faction<GoblinType>([], [
    {
        type: "goblin_chief",
        name: "Goblin Chief",
        image: "creatures/bandit.png", // Using bandit image as placeholder
        attributes: {
            movement: 6,
            combat: 4,
            ranged: 2,
            strength: 3,
            agility: 4,
            courage: 4,
            intelligence: 3,
        },
        vitality: 5,
        cost: 1,
        rank: "grunt",
        aiBehavior: AI_BEHAVIORS.MELEE,
        skills: [
            SKILL_PRESETS.lostInTheDark,
            SKILL_PRESETS.dirtyFighter,
            SKILL_PRESETS.ambush,
        ]
    },
    {
        type: "goblin_warrior",
        name: "Goblin Warrior",
        image: "creatures/bandit.png", // Using bandit image as placeholder
        attributes: {
            movement: 6,
            combat: 3,
            ranged: 2,
            strength: 3,
            agility: 4,
            courage: 3,
            intelligence: 2,
        },
        vitality: 4,
        cost: 1,
        rank: "grunt",
        aiBehavior: AI_BEHAVIORS.MELEE,
        skills: [
            SKILL_PRESETS.lostInTheDark,
            SKILL_PRESETS.dirtyFighter,
        ]
    },
    {
        type: "goblin_archer",
        name: "Goblin Archer",
        image: "creatures/bandit.png", // Using bandit image as placeholder
        attributes: {
            movement: 6,
            combat: 2,
            ranged: 4,
            strength: 2,
            agility: 4,
            courage: 2,
            intelligence: 3,
        },
        vitality: 3,
        cost: 1,
        rank: "grunt",
        aiBehavior: AI_BEHAVIORS.RANGED,
        skills: [
            SKILL_PRESETS.lostInTheDark,
            SKILL_PRESETS.ambush,
        ]
    },
    {
        type: "goblin_scout",
        name: "Goblin Scout",
        image: "creatures/bandit.png", // Using bandit image as placeholder
        attributes: {
            movement: 8,
            combat: 2,
            ranged: 3,
            strength: 2,
            agility: 5,
            courage: 2,
            intelligence: 3,
        },
        vitality: 3,
        cost: 1,
        rank: "grunt",
        aiBehavior: AI_BEHAVIORS.RANGED,
        skills: [
            SKILL_PRESETS.lostInTheDark,
            SKILL_PRESETS.ambush,
        ]
    }
]);
