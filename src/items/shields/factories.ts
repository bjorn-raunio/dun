import { Shield } from './Shield';
import { shieldPresets } from './presets';
import { createItem } from '../factories';

/**
 * Create a shield using the generic factory
 */
export function createShield(presetId: string, overrides?: Partial<ConstructorParameters<typeof Shield>[0]> & { id?: string }): Shield {
  return createItem(Shield, presetId, shieldPresets, overrides);
}
