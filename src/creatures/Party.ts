import { QuestMap } from '../maps/types';
import { Region } from '../worldmap/Region';
import { createQuestMapFromPreset } from '../maps/presets';

export class Party {
  private _currentRegionId: string;
  private _currentQuestMap: QuestMap | undefined;

  constructor(currentRegionId: string, currentQuestMap?: QuestMap) {
    this._currentRegionId = currentRegionId;
    this._currentQuestMap = currentQuestMap;
  }

  // Getters
  get currentRegionId(): string {
    return this._currentRegionId;
  }

  get currentQuestMap(): QuestMap | undefined {
    return this._currentQuestMap;
  }

  // Setters
  set currentRegionId(regionId: string) {
    this._currentRegionId = regionId;
  }

  set currentQuestMap(questMap: QuestMap | undefined) {
    this._currentQuestMap = questMap;
  }

  // Travel method
  travelToRegion(regionId: string): void {
    this._currentRegionId = regionId;
  }

  // Enter a region and create quest map from first preset
  enterRegion(region: Region): void {
    this._currentRegionId = region.id;
    
    // Get the first quest map preset for this region
    const firstPresetId = region.getFirstQuestMapPreset();
    
    if (firstPresetId) {
      // Create quest map from preset
      const questMap = createQuestMapFromPreset(firstPresetId);
      this._currentQuestMap = questMap || undefined;
    } else {
      // No quest map presets available, clear current quest map
      this._currentQuestMap = undefined;
    }
  }

  // Clone method for creating copies
  clone(): Party {
    return new Party(this._currentRegionId, this._currentQuestMap);
  }
}
