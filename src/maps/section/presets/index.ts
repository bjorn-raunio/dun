// --- Section Presets Exports ---

export type { SectionPreset, SectionPresetCategory } from './types';
export { sectionPresets, sectionPresetsByCategory } from './sectionPresets';
export { 
  createSection, 
  getAvailableSectionPresets, 
  getSectionPreset
} from './factory';
