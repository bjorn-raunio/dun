import { QuestMapPreset } from "../../maps";
import { LocationService } from "../service/service";
import { Settlement } from "../settlement/settlement";

export class WorldLocation {
    public questMap?: QuestMapPreset;
    public service?: LocationService;
    public settlement?: Settlement;

    constructor({ questMap, service, settlement }: { questMap?: QuestMapPreset, service?: LocationService, settlement?: Settlement }) {
        this.questMap = questMap;
        this.service = service;
        this.settlement = settlement;
    }

    get name() {
        return this.questMap?.name || this.settlement?.name || this.service?.name || "Unknown location";
    }
}
