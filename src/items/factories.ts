/**
 * Generic item factory function that eliminates code duplication
 * @param ItemClass The constructor class to instantiate
 * @param presetId The preset ID to use as base configuration
 * @param presetMap The preset map to look up the preset
 * @param overrides Optional overrides to apply to the preset
 * @returns A new instance of the specified item class
 */
export function createItem<T extends { new (config: any): any }>(
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
