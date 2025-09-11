import { AI_BEHAVIORS } from "../../../ai";
import { SKILL_PRESETS } from "../../../skills";
import { Faction } from "../Faction";

export type FomrorClanType = "fomrorClan";

export const faction_fomrorClans = new Faction<FomrorClanType>([], [
    {
        type: "fomrorClan",
        name: "Fomror Clan",
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