import { Armor } from './Armor';
import { armorPresets } from './presets';
import { createItem } from '../factories';

/**
 * Create armor using the generic factory
 */
export function createArmor(presetId: string, overrides?: Partial<ConstructorParameters<typeof Armor>[0]> & { id?: string }): Armor {
  return createItem(Armor, presetId, armorPresets, overrides);
}
