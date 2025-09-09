// --- Main Scenario Class ---

import { QuestMapPreset } from "../maps";
import { WorldMap } from "../worldmap";

export class Scenario {
  
  maps: QuestMapPreset[];

  constructor(
    maps: QuestMapPreset[]
  ) {
    this.maps = maps;
  }

  startScenario(worldMap: WorldMap) {
    let region = this.maps[0]?.region;
    if(!region) {
      return;
    }    
    const targetRegion = worldMap.regions.get(region);
    if (targetRegion) {
      targetRegion.addQuestMap(this.maps[0]);
    }
  }
}
