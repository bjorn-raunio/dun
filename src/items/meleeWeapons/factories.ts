import { Weapon } from './Weapon';
import { weaponPresets } from './presets';
import { createItem } from '../factories';

/**
 * Create a weapon using the generic factory
 */
export function createWeapon(presetId: string, overrides?: Partial<ConstructorParameters<typeof Weapon>[0]> & { id?: string }): Weapon {
  return createItem(Weapon, presetId, weaponPresets, overrides);
}
