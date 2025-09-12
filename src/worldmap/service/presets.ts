import { LocationService } from "./service";

export const SERVICES = {
    "alchemist": new LocationService({
        name: "Alchemist",
    }),
    "bank": new LocationService({
        name: "Bank",
    }),
    "blacksmith": new LocationService({
        name: "Blacksmith",
    }),
    "combatSchool": new LocationService({
        name: "Combat School",
    }),
    "dock": new LocationService({
        name: "Dock",
    }),    
    "governor": new LocationService({
        name: "Governor",
    }),    
    "healer": new LocationService({
        name: "Healer",
    }),
    "inn": new LocationService({
        name: "Inn",
    }),
    "market": new LocationService({
        name: "Market",
    }),
    "moneylender": new LocationService({
        name: "Moneylender",
    }),
    "stables": new LocationService({
        name: "Stables",
    }),
    "tavern": new LocationService({
        name: "Tavern",
    }),
}