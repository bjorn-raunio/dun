import { NaturalWeapon, NaturalWeaponPreset } from './types';
import { createItem } from '../factories';

// --- Natural Weapon Presets ---

export const NATURAL_WEAPON_PRESETS: Record<string, NaturalWeaponPreset> = {
    // Canine natural weapons
    fangs: {
        name: "Fangs",
        attack: { },
        hands: 1,
        properties: [],
    },
    claws: {
        name: "Claws",
        attack: { },
        hands: 1,
        properties: [],
    },
};

// --- Factory Function ---

export function createNaturalWeapon(weaponId: string): NaturalWeapon {
    return createItem(NaturalWeapon, weaponId, NATURAL_WEAPON_PRESETS);
}

