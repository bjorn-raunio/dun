import { LocationService } from "../service/service";

export type SettlementType = 'town' | 'village' | 'castle';

export class Settlement {
    name: string;
    type: SettlementType;
    services: LocationService[];
    
    constructor({ name, type, services }: { name: string, type: SettlementType, services: LocationService[] }) {
        this.name = name;
        this.type = type;
        this.services = services;
    }
}