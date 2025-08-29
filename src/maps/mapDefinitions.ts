import { MapDefinition, Terrain } from './types';
import { createWeapon, createRangedWeapon, createArmor, createShield } from '../items';
import { Hero, createMonster, createMercenary, CREATURE_GROUPS } from '../creatures/index';

// --- Generate tiles from map definition ---
export const typeToImage: Record<string, string> = {
  room1: "room1.jpg",
  room2: "room2.jpg",
  room3: "room3.jpg",
  room4: "room4.jpg",
  corridor: "corridor1.jpg",
};

// Reusable terrain presets (use Terrain type)
export const terrainPresets: Record<string, Terrain> = {
  tree: { image: "", mapWidth: 2, mapHeight: 2, height: 4 },
  wagon: { image: "wagon.jpg", mapWidth: 1, mapHeight: 2, height: 1 },
  horse: { image: "horse.jpg", mapWidth: 1, mapHeight: 2, height: 1 },
};

export const mapDefinition: MapDefinition = {
  name: "Exempelkarta med rumstyper",
  description: "En karta med olika rumstyper och korridorer.",
  width: 40,
  height: 30,
  rooms: [
    { type: "room3", x: 0, y: 0, mapWidth: 8, mapHeight: 10, rotation: 270 },
    { type: "room4", x: 10, y: 0, mapWidth: 8, mapHeight: 10, rotation: 90 },
  ],
  terrain: [
    { preset: "tree", x: 10, y: 5 },
    { preset: "tree", x: 12, y: 1 },
    { preset: "tree", x: 17, y: 1 },
    { preset: "wagon", x: 16, y: 4, rotation: 90 },
    { preset: "horse", x: 18, y: 4, rotation: 270 },
  ],
  creatures: [
    createMonster("bandit", { x: 5, y: 5 }),
    createMercenary("civilian", { x: 2, y: 2, group: CREATURE_GROUPS.HERO }),
    new Hero({
      name: "Knight",
      x: 1,
      y: 1,
      image: "creatures/knight.png",
      movement: 5,
      actions: 2,
      size: 2, // medium
      facing: 0, // North
      inventory: [
        createRangedWeapon("longbow"),
        createShield("shield"),
      ],
      equipment: {
        mainHand: createWeapon("dagger"),
        offHand: createShield("shield"),
        armor: createArmor("chainMail"),
      },
      combat: 4,
      ranged: 2,
      strength: 4,
      agility: 3,
      remainingVitality: 5,
      naturalArmor: 3,
      group: CREATURE_GROUPS.HERO,
    }),
  ],
};
