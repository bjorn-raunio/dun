import { Spell } from "../spell";
import { SpellSchool } from "../spellSchool";

export const SPELLS_CHANNELING = new SpellSchool({
    name: "Channeling",
    spells: {
        "boilingBlood": new Spell({
            name: "Boiling Blood",
            type: "damage",
            range: 6,
            targetType: "enemy",
            effect: {
                damage: { damageModifier: 4, ignoresArmor: true },
            }
        }),
        "detectEvil": new Spell({
            name: "Detect Evil",
            type: "enhancement",
            range: 1,
            targetType: "ally",
            effect: {
            }
        }),
        "dexterityEnhancement": new Spell({
            name: "Dexterity Enhancement",
            type: "enhancement",
            range: 1,
            targetType: "ally",
            effect: {
            }
        }),
        "empower": new Spell({
            name: "Empower",
            type: "enhancement",
            range: 3,
            targetType: "ally",
            effect: {
            }
        }),
        "evanesence": new Spell({
            name: "Evanesence",
            type: "control",
            range: 6,
            targetType: "enemy",
            effect: {
            }
        }),
        "favourite": new Spell({
            name: "Favourite",
            type: "protection",
            range: 1,
            targetType: "ally",
            effect: {
            }
        }),
        "heal": new Spell({
            name: "Heal",
            type: "healing",
            range: 1,
            targetType: "ally",
            effect: {
                heal: 4
            }
        }),
        "healInjuries": new Spell({
            name: "Heal Injuries",
            type: "healing",
            archMage: true,
            range: 1,
            targetType: "ally",
            effect: {
                heal: 999
            }
        }),
        "placateTempers": new Spell({
            name: "Placate Tempers",
            type: "control",
            range: 0,
            targetType: "self",
            effect: {
                areaOfEffect: 6
            }
        }),
        "immunity": new Spell({
            name: "Immunity",
            type: "enhancement",
            range: 3,
            targetType: "ally",
            effect: {
            }
        }),
    }
});