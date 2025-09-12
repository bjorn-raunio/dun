import { Spell } from "../spell";
import { SpellSchool } from "../spellSchool";

export const SPELLS_BLESSINGS = new SpellSchool({
    name: "Blessings",
    spells: {
        "callOfThePhoenix": new Spell({
            name: "Call of the Phoenix",
            type: "healing",
            cost: 2,
            range: 1,
            targetType: "ally",
            effect: {
            }
        }),
        "defenderOfTruth": new Spell({
            name: "Defender of Truth",
            type: "protection",
            range: 0,
            targetType: "self",
            effect: {
                areaOfEffect: 3
            }
        }),
        "divineEnergy": new Spell({
            name: "Divine Energy",
            type: "enhancement",
            range: 3,
            targetType: "ally",
            effect: {
            }
        }),
        "fate": new Spell({
            name: "Fate",
            type: "enhancement",
            cost: 2,
            range: 1,
            targetType: "ally",
            effect: {
            }
        }),
        "hammerOfjustice": new Spell({
            name: "Hammer of Justice",
            type: "enhancement",
            range: 1,
            targetType: "ally",
            effect: {
            }
        }),
        "healingHands": new Spell({
            name: "Healing Hands",
            type: "healing",
            range: 1,
            targetType: "ally",
            effect: {
                heal: 4
            }
        }),
        "heartOfTheTiger": new Spell({
            name: "Heart Of The Tiger",
            type: "enhancement",
            range: 0,
            targetType: "self",
            effect: {
                areaOfEffect: 3
            }
        }),
        "risenGod": new Spell({
            name: "Risen God",
            type: "damage",
            archMage: true,
            range: 0,
            targetType: "self",
            effect: {
            }
        }),
        "scourgeOfEvil": new Spell({
            name: "Scourge of Evil",
            type: "damage",
            range: 3,
            targetType: "enemy",
            effect: {
            }
        }),
    }
});