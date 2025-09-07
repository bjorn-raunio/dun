import { QuestMap } from '../maps/types';
import { Region } from '../worldmap/Region';

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

  // Enter a region without automatically loading a quest map
  enterRegion(region: Region): void {
    this._currentRegionId = region.id;
    // Don't automatically load a quest map - let the player choose
    this._currentQuestMap = undefined;
  }


  // Clone method for creating copies
  clone(): Party {
    return new Party(this._currentRegionId, this._currentQuestMap);
  }
}
