import { Miscellaneous } from './Miscellaneous';

export interface MiscellaneousPreset {
  name: string;
  weight?: number;
  value?: number;
}

export const miscellaneousPresets: Record<string, MiscellaneousPreset> = {
  
  picklocks: {
    name: "Picklocks",
    weight: 2,
    value: 5
  },
  ratPoison: {
    name: "Rat poison",
    weight: 2,
    value: 5
  },
  rope: {
    name: "Rope",
    weight: 2,
    value: 5
  },
  squeakyBird: {
    name: "Squeaky bird",
    weight: 2,
    value: 5
  },
};

export function createMiscellaneousFromPreset(presetName: string): Miscellaneous | null {
  const preset = miscellaneousPresets[presetName];
  if (!preset) {
    return null;
  }

  return new Miscellaneous({
    name: preset.name,
    weight: preset.weight,
    value: preset.value
  });
}
