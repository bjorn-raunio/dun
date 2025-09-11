import { AI_BEHAVIORS } from "../../../ai";
import { SKILL_PRESETS } from "../../../skills";
import { MonsterGroup } from "../Faction";

export type ForestType = "forest";

export const faction_forests = new MonsterGroup<ForestType>([
    {
        type: "forest",
        name: "Bear",
        image: "creatures/bandit.png",
        attributes: {
            movement: 5,
            combat: 3,
            ranged: 3,
            strength: 3,
            agility: 3,
            courage: 3,
            intelligence: 4,
        },
        vitality: 4,
        cost: 1,
        rank: "grunt",
        aiBehavior: AI_BEHAVIORS.MELEE,
        skills: [
        ]
    }
]);