// --- Main Campaign Class ---

import { QuestMapPreset } from "../maps";
import { WorldMap } from "../worldmap";

export class Campaign {
  
  background: string;
  startingMap: QuestMapPreset;

  constructor(
    background: string,
    startingMap: QuestMapPreset
  ) {
    this.background = background;
    this.startingMap = startingMap;
  }

  startCampaign(worldMap: WorldMap) {
    let region = this.startingMap.region;
    if(!region) {
      return;
    }    
    const targetRegion = worldMap.regions.get(region);
    if (targetRegion) {
      targetRegion.addQuestMap(this.startingMap);
    }
  }
}
