import { Weapon, RangedWeapon, Armor, Shield } from './types';
import { weaponPresets, rangedPresets, armorPresets, shieldPresets } from './presets';
import { Item } from './types';

/**
 * Generic item factory function that eliminates code duplication
 * @param ItemClass The constructor class to instantiate
 * @param presetId The preset ID to use as base configuration
 * @param presetMap The preset map to look up the preset
 * @param overrides Optional overrides to apply to the preset
 * @returns A new instance of the specified item class
 */
function createItem<T extends { new (config: any): any }>(
  ItemClass: T,
  presetId: string,
  presetMap: Record<string, ConstructorParameters<T>[0]>,
  overrides?: Partial<ConstructorParameters<T>[0]> & { id?: string }
): InstanceType<T> {
  const preset = presetMap[presetId];
  if (!preset) {
    throw new Error(`Preset '${presetId}' not found in preset map`);
  }
  
  return new ItemClass({
    ...preset,
    ...overrides
  });
}

/**
 * Create a weapon using the generic factory
 */
export function createWeapon(presetId: string, overrides?: Partial<ConstructorParameters<typeof Weapon>[0]> & { id?: string }): Weapon {
  return createItem(Weapon, presetId, weaponPresets, overrides);
}

/**
 * Create a ranged weapon using the generic factory
 */
export function createRangedWeapon(presetId: string, overrides?: Partial<ConstructorParameters<typeof RangedWeapon>[0]> & { id?: string }): RangedWeapon {
  return createItem(RangedWeapon, presetId, rangedPresets, overrides);
}

/**
 * Create armor using the generic factory
 */
export function createArmor(presetId: string, overrides?: Partial<ConstructorParameters<typeof Armor>[0]> & { id?: string }): Armor {
  return createItem(Armor, presetId, armorPresets, overrides);
}

/**
 * Create a shield using the generic factory
 */
export function createShield(presetId: string, overrides?: Partial<ConstructorParameters<typeof Shield>[0]> & { id?: string }): Shield {
  return createItem(Shield, presetId, shieldPresets, overrides);
}
