import { Consumable } from './Consumable';
import { consumablePresets } from './presets';
import { createItem } from '../factories';

/**
 * Create a consumable using the generic factory
 */
export function createConsumable(presetId: string, overrides?: Partial<ConstructorParameters<typeof Consumable>[0]> & { id?: string }): Consumable {
  return createItem(Consumable, presetId, consumablePresets, overrides);
}
