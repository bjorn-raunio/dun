import { QuestMap } from '../maps/types';
import { Region } from '../worldmap/Region';
import { WorldMap } from '../worldmap/WorldMap';

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

  // Travel method - validates that the target region is adjacent
  travelToRegion(regionId: string, worldMap: WorldMap): void {
    const currentRegion = worldMap.getRegion(this._currentRegionId);
    if (!currentRegion) {
      throw new Error(`Current region ${this._currentRegionId} not found`);
    }

    // Check if the target region is adjacent (connected)
    if (!currentRegion.isConnectedTo(regionId)) {
      throw new Error(`Cannot travel to ${regionId}: Region is not adjacent to current region ${this._currentRegionId}`);
    }

    const targetRegion = worldMap.getRegion(regionId);
    if (!targetRegion) {
      throw new Error(`Target region ${regionId} not found`);
    }

    if (!targetRegion.isAccessible) {
      throw new Error(`Cannot travel to ${regionId}: Region is not accessible`);
    }

    this._currentRegionId = regionId;
  }

  // Enter a region without automatically loading a quest map - validates adjacency
  enterRegion(region: Region, worldMap: WorldMap): void {
    const currentRegion = worldMap.getRegion(this._currentRegionId);
    if (!currentRegion) {
      throw new Error(`Current region ${this._currentRegionId} not found`);
    }

    // Check if the target region is adjacent (connected)
    if (!currentRegion.isConnectedTo(region.id)) {
      throw new Error(`Cannot travel to ${region.id}: Region is not adjacent to current region ${this._currentRegionId}`);
    }

    if (!region.isAccessible) {
      throw new Error(`Cannot travel to ${region.id}: Region is not accessible`);
    }

    this._currentRegionId = region.id;
    // Don't automatically load a quest map - let the player choose
    this._currentQuestMap = undefined;
  }


  // Clone method for creating copies
  clone(): Party {
    return new Party(this._currentRegionId, this._currentQuestMap);
  }
}
