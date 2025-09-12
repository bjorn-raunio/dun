import { Spell } from "../spell";
import { SpellSchool } from "../spellSchool";

export const SPELLS_FIRE = new SpellSchool({
    name: "Fire",
    spells: {
        "fireball": new Spell({
            name: "Fireball",
            type: "projectile",
            range: 12,
            targetType: "enemy",
            effect: {
                damage: { damageModifier: 5 },
                aoeDamage: { damageModifier: 3 },
                areaOfEffect: 1
            }
        }),
    }
});