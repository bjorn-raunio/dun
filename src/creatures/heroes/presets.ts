import { HeroPreset } from '../presets/types';
import { CreatureGroup } from '../CreatureGroup';
import { SKILL_PRESETS } from '../../skills';

// --- Hero Presets ---

export const heroPresets: Record<string, HeroPreset> = {

    herbod: {
        name: 'Herbod',
        image: 'creatures/human.png',
        attributes: {
            movement: 5,
            combat: 4,
            ranged: 4,
            strength: 4,
            agility: 5,
            courage: 4,
            intelligence: 5,
        },
        actions: 1,
        size: 2,
        equipment: {
            mainHand: { type: "weapon", preset: "mace" },
            offHand: { type: "shield", preset: "shield" },
            armor: { type: "armor", preset: "chainMail" },
        },
        inventory: [
            {type: 'consumable', preset:'healingPotion'},
            {type: 'consumable', preset:'strengthPotion'},
            {type: 'consumable', preset:'heroicPotion'},
        ],
        vitality: 4,
        mana: 5,
        fortune: 6,
        group: CreatureGroup.PLAYER,
        skills: [
            SKILL_PRESETS.lostInTheDark,
            SKILL_PRESETS.ironWill,
        ]
    },

    berbod: {
        name: 'Berbod',
        image: 'creatures/knight.png',
        attributes: {
            movement: 4,
            combat: 6,
            ranged: 2,
            strength: 5,
            agility: 3,
            courage: 6,
            intelligence: 3,
        },
        actions: 1,
        size: 2,
        equipment: {
            mainHand: { type: "weapon", preset: "broadsword" },
            offHand: { type: "shield", preset: "shield" },
            armor: { type: "armor", preset: "chainMail" },
        },
        inventory: [
            {type: 'consumable', preset:'healingPotion'},
            {type: 'consumable', preset:'healingPotion'},
        ],
        vitality: 6,
        mana: 2,
        fortune: 4,
        group: CreatureGroup.PLAYER,
        skills: [
            SKILL_PRESETS.ironWill,
        ]
    }
};
