import { Spell } from "../spell";
import { SpellSchool } from "../spellSchool";

export const SPELLS_WATER = new SpellSchool({
    name: "Water",
    spells: {
        "crushingWave": new Spell({
            name: "Crushing Wave",
            type: "projectile",
            range: 12,
            targetType: "enemy",
            effect: {
                damage: { damageModifier: 2 },
                areaOfEffect: 1
            }
        }),
        "iceArrows": new Spell({
            name: "Ice Arrows",
            type: "projectile",
            range: 12,
            targetType: "enemy",
            effect: {
                damage: { damageModifier: 5 },
                aoeDamage: { damageModifier: 3 },
                areaOfEffect: 1
            }
        }),
        "iceBridge": new Spell({
            name: "Ice Bridge",
            type: "protection",
            cost: 2,
            range: 3,
            targetType: "ground",
            effect: {
            }
        }),
        "iceWall": new Spell({
            name: "Ice Wall",
            type: "protection",
            cost: 2,
            range: 1,
            targetType: "ground",
            effect: {
            }
        }),
        "treacherousWaters": new Spell({
            name: "Treacherous Waters",
            type: "control",
            range: 12,
            targetType: "enemy",
            effect: {
                areaOfEffect: 2
            }
        }),
        "walkingOnWater": new Spell({
            name: "Walking on Water",
            type: "enhancement",
            range: 3,
            targetType: "ally",
            effect: {
            }
        }),
        "waterElemental": new Spell({
            name: "Water Elemental",
            type: "control",
            cost: 2,
            range: 1,
            targetType: "ground",
            effect: {
            }
        }),
        "waterOfLife": new Spell({
            name: "Water of Life",
            type: "healing",
            range: 1,
            targetType: "ally",
            effect: {
                heal: 4
            }
        }),
        "waterShield": new Spell({
            name: "Water Shield",
            type: "protection",
            range: 0,
            targetType: "self",
            effect: {
                areaOfEffect: 1
            }
        }),
        "waterWhip": new Spell({
            name: "Water Whip",
            type: "projectile",
            range: 0,
            targetType: "self",
            effect: {
                areaOfEffect: 2
            }
        }),
    }
});