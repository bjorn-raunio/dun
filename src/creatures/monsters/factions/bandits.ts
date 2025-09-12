import { AI_BEHAVIORS } from "../../../ai";
import { SKILL_PRESETS } from "../../../skills";
import { SPELLS_FIRE } from "../../../spells";
import { Faction } from "../Faction";

export type BanditType = "bandit_leader" | "bandit_wizard" | "human_bandit" | "shooter" | "warhound";

export const faction_bandits = new Faction<BanditType>([], [
    {
        type: "bandit_leader",
        name: "Bandit leader",
        image: "creatures/bandit.png",
        attributes: {
            movement: 6,
            combat: 5,
            ranged: 4,
            strength: 4,
            agility: 4,
            courage: 5,
            intelligence: 4,
        },
        vitality: 5,
        cost: 1,
        rank: "grunt",
        weaponLoadouts: ["broadswordShield", "shortswordShield", "scimitarShield", "maceShield", "bastardsword"],
        armorLoadouts: ["chainmail"],
        aiBehavior: AI_BEHAVIORS.MELEE,
        skills: [
            SKILL_PRESETS.lostInTheDark,
            SKILL_PRESETS.inspiring,
        ]
    },
    {
        type: "bandit_wizard",
        name: "Bandit Wizard",
        image: "creatures/bandit.png",
        attributes: {
            movement: 5,
            combat: 3,
            ranged: 2,
            strength: 3,
            agility: 4,
            courage: 4,
            intelligence: 6,
        },
        vitality: 4,
        mana: 8,
        cost: 2,
        rank: "elite",
        weaponLoadouts: ["staff", "dagger"],
        armorLoadouts: ["leather"],
        aiBehavior: AI_BEHAVIORS.CASTER,
        skills: [
            SKILL_PRESETS.lostInTheDark,
        ],
        spellSchools: [SPELLS_FIRE]
    },
    {
        type: "human_bandit",
        name: "Human bandit",
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
        weaponLoadouts: ["broadsword", "axe", "mace"],
        armorLoadouts: ["shield", "leatherArmor"],
        aiBehavior: AI_BEHAVIORS.MELEE,
        skills: [
            SKILL_PRESETS.lostInTheDark,
            SKILL_PRESETS.dirtyFighter,
            SKILL_PRESETS.ambush,
        ]
    },
    {
        type: "shooter",
        name: "Shooter",
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
        inventory: [
            { type: "weapon", preset: "broadsword" },
        ],
        weaponLoadouts: ["shortbow"],
        armorLoadouts: [],
        aiBehavior: AI_BEHAVIORS.RANGED,
        skills: [
            SKILL_PRESETS.lostInTheDark,
            SKILL_PRESETS.dirtyFighter,
            SKILL_PRESETS.ambush,
        ]
    },
    {
        type: "warhound",
        name: "Warhound",
        image: "creatures/warhound.png",
        attributes: {
            movement: 7,
            combat: 4,
            ranged: 0,
            strength: 3,
            agility: 4,
            courage: 5,
            intelligence: 1,
        },
        vitality: 4,
        cost: 1,
        rank: "grunt",
        aiBehavior: AI_BEHAVIORS.ANIMAL,
        skills: [
            SKILL_PRESETS.sharpSenses,
        ],
        naturalWeapons: ["fangs"]
    }
]);