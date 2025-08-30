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
  startingTiles: [
    { x: 0, y: 1, name: "Hero Starting Position 1" },
    { x: 1, y: 1, name: "Hero Starting Position 2" },
    { x: 0, y: 2, name: "Hero Starting Position 3" },
    { x: 1, y: 2, name: "Hero Starting Position 4" },
  ],
  creatures: [
    createMonster("human_bandit", "bandits", { x: 12, y: 7, facing: 1, weaponLoadout: "broadsword", armorLoadout: "shield" }),
    createMonster("shooter", "bandits", { x: 10, y: 1, facing: 3, weaponLoadout: "shortbow" }),
    
    createMercenary("civilian", { 
      x: 16, 
      y: 4, 
      group: CREATURE_GROUPS.HERO, 
      facing: 6
    }),
    createMercenary("civilian", { x: 17, y: 4, group: CREATURE_GROUPS.HERO, facing: 6 }),
    new Hero({
      name: "Knight",
      x: 0,
      y: 1,
      image: "creatures/knight.png",
      attributes: {
        movement: 5,
        combat: 4,
        ranged: 2,
        strength: 4,
        agility: 3,
        courage: 3,
        intelligence: 3,
      },
      actions: 1,
      size: 2, // medium
      facing: 2,
      inventory: [
        createRangedWeapon("longbow"),
      ],
      equipment: {
        mainHand: createWeapon("dagger"),
        offHand: createShield("shield"),
        armor: createArmor("chainMail"),
      },
      vitality: 5,
      mana: 0,
      fortune: 3,
      naturalArmor: 3,
      group: CREATURE_GROUPS.HERO,
    }),
  ],
};
