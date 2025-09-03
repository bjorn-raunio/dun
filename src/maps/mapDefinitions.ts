import { QuestMap } from './types';
import { createQuestMapFromPreset, getAvailableQuestMapPresets } from './presets';

// Create the default map using the preset system
export const mapDefinition = createQuestMapFromPreset('freeTheMerchants')

// Export available presets for easy access
export const availableQuestMaps = getAvailableQuestMapPresets();

// Helper function to create a map from any preset
export function createMapFromPreset(presetId: string): QuestMap | null {
  return createQuestMapFromPreset(presetId);
}