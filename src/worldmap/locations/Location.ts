import { QuestMapPreset } from "../../maps";

export class WorldLocation {
    public questMap?: QuestMapPreset;

    constructor({ questMap }: { questMap?: QuestMapPreset }) {
        this.questMap = questMap;
    }

    get name() {
        return this.questMap?.name || "Unknown location";
    }
}
