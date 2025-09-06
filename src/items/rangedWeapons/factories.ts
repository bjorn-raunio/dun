import { RangedWeapon } from './RangedWeapon';
import { rangedPresets } from './presets';
import { createItem } from '../factories';

/**
 * Create a ranged weapon using the generic factory
 */
export function createRangedWeapon(presetId: string, overrides?: Partial<ConstructorParameters<typeof RangedWeapon>[0]> & { id?: string }): RangedWeapon {
  return createItem(RangedWeapon, presetId, rangedPresets, overrides);
}
