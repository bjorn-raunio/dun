import { HeroPreset } from '../presets/types';
import { CreatureGroup } from '../CreatureGroup';
import { SKILL_PRESETS } from '../../skills';
import PROFESSIONS from './professions/presets';
import RACES from './races/presets';
import { SPELLS_BLESSINGS } from '../../spells/schools/blessings';
import { SPELLS_CHANNELING } from '../../spells/schools/channeling';
import { SPELLS_WATER } from '../../spells/schools/water';

// --- Hero Presets ---

export const heroPresets: Record<string, HeroPreset> = {

    herbod: {
        name: 'Herbod',
        profession: PROFESSIONS.warriorMonk,
        race: RACES.human,
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
        vitality: 4,
        mana: 4,
        fortune: 6,
        gold: 2,
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
        group: CreatureGroup.PLAYER,
        skills: [
            SKILL_PRESETS.ironWill,
        ],
        spellSchool: SPELLS_BLESSINGS
    },
    taeral: {
        name: 'Taeral',
        race: RACES.elf,
        profession: PROFESSIONS.forester,
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
        vitality: 4,
        mana: 5,
        fortune: 5,
        gold: 4,
        equipment: {
            mainHand: { type: "ranged_weapon", preset: "longbow" },
            armor: { type: "armor", preset: "leatherArmor" },
        },
        inventory: [
            { type: 'weapon', preset: 'scimitar' },
        ],
        group: CreatureGroup.PLAYER,
        skills: [],
        spellSchool: SPELLS_CHANNELING
    },
    bosco: {
        name: 'Bosco',
        race: RACES.halfling,
        profession: PROFESSIONS.rogue,
        image: 'creatures/halfling.png',
        attributes: {
            movement: 5,
            combat: 4,
            ranged: 4,
            strength: 2,
            agility: 4,
            courage: 4,
            intelligence: 4,
        },
        actions: 1,
        vitality: 3,
        mana: 0,
        fortune: 8,
        gold: 4,
        equipment: {
            mainHand: { type: "weapon", preset: "dagger" },
            offHand: { type: "ranged_weapon", preset: "sling" },
            armor: { type: "armor", preset: "leatherArmor" },
        },
        inventory: [
            { type: 'consumable', preset: 'dexterityPotion' },
            { type: 'miscellaneous', preset: 'picklocks' },
            { type: 'miscellaneous', preset: 'ratPoison' },
            { type: 'miscellaneous', preset: 'squeakyBird' },
        ],
        group: CreatureGroup.PLAYER,
        skills: []
    },
    cryxx: {
        name: 'Cryxx',
        race: RACES.shardmin,
        profession: PROFESSIONS.wizard,
        image: 'creatures/shardmind.png',
        attributes: {
            movement: 5,
            combat: 3,
            ranged: 3,
            strength: 3,
            agility: 4,
            courage: 5,
            intelligence: 5,
        },
        actions: 1,
        vitality: 3,
        mana: 8,
        fortune: 6,
        gold: 2,
        equipment: {
            mainHand: { type: "weapon", preset: "staff" },
        },
        inventory: [
            { type: 'miscellaneous', preset: 'rope' },
            { type: 'consumable', preset: 'mead' },
            { type: 'consumable', preset: 'provisions' },
            { type: 'consumable', preset: 'greekFire' },
            { type: 'consumable', preset: 'manaPotion' },
            { type: 'miscellaneous', preset: 'components' },
            { type: 'consumable', preset: 'dexterityPotion' },
            { type: 'consumable', preset: 'heroicPotion' },
        ],
        group: CreatureGroup.PLAYER,
        skills: [],
        spellSchool: SPELLS_WATER
    }
};
