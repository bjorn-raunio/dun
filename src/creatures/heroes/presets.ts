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
            combat: 5,
            ranged: 3,
            strength: 3,
            agility: 4,
            courage: 5,
            intelligence: 4,
        },
        actions: 1,
        size: 2,
        equipment: {
            mainHand: { type: "weapon", preset: "mace" },
            offHand: { type: "shield", preset: "shield" },
            armor: { type: "armor", preset: "chainMail" },
        },
        inventory: [
            { type: 'consumable', preset: 'healingPotion' },
            { type: 'consumable', preset: 'strengthPotion' },
            { type: 'consumable', preset: 'heroicPotion' },
        ],
        vitality: 4,
        mana: 4,
        fortune: 6,
        group: CreatureGroup.PLAYER,
        skills: [
            SKILL_PRESETS.lostInTheDark,
            SKILL_PRESETS.ironWill,
        ]
    },

    berbod: {
        name: 'Taeral',
        image: 'creatures/elf.png',
        attributes: {
            movement: 5,
            combat: 4,
            ranged: 5,
            strength: 3,
            agility: 4,
            courage: 4,
            intelligence: 5,
        },
        actions: 1,
        size: 2,
        equipment: {
            mainHand: { type: "ranged_weapon", preset: "longbow" },
            armor: { type: "armor", preset: "leatherArmor" },
        },
        inventory: [
            { type: 'weapon', preset: 'scimitar' },
        ],
        vitality: 4,
        mana: 5,
        fortune: 5,
        group: CreatureGroup.PLAYER,
        skills: [            
            SKILL_PRESETS.sharpSenses,
            SKILL_PRESETS.battleWizard,
            SKILL_PRESETS.tamingAnimals,
            SKILL_PRESETS.scout,
        ]
    }
};
