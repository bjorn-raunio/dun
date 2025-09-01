import { MapDefinition, Terrain } from './types';
import { Room } from './room';
import { createRoom, roomPresets } from './room/presets';
import { createWeapon, createRangedWeapon, createArmor, createShield, createConsumable } from '../items';
import { Hero, createMonster, createMercenary, CREATURE_GROUPS } from '../creatures/index';
import { SKILL_PRESETS } from '../skills';

// --- Generate tiles from map definition ---
// Generate typeToImage mapping from room presets
export const typeToImage: Record<string, string> = Object.entries(roomPresets).reduce((acc, [presetId, preset]) => {
  acc[presetId] = preset.image;
  return acc;
}, {} as Record<string, string>);

// Reusable terrain presets (use Terrain type)
export const terrainPresets: Record<string, Terrain> = {
  tree: { image: "", mapWidth: 2, mapHeight: 2, height: 4 },
  wagon: { image: "wagon.jpg", mapWidth: 1, mapHeight: 2, height: 1 },
  horse: { image: "horse.jpg", mapWidth: 1, mapHeight: 2, height: 1 },
};

export const mapDefinition: MapDefinition = {
  name: "Exempelkarta med rumstyper",
  width: 40,
  height: 30,
  rooms: [
    // Using room presets with different configurations
    createRoom("forest1", 0, 0, { rotation: 270 }),
    createRoom("forest2", 10, 0, { rotation: 90 }),
  ],
  terrain: [
    { preset: "tree", x: 10, y: 5 },
    { preset: "tree", x: 12, y: 1 },
    { preset: "tree", x: 17, y: 1 },
    { preset: "wagon", x: 16, y: 4, rotation: 90 },
    { preset: "horse", x: 18, y: 4, rotation: 270 },
  ],
  terrainTypes: {
    "tree": { blocksLineOfSight: true, height: 4, mapWidth: 2, mapHeight: 2 },
    "wagon": { blocksLineOfSight: false, height: 1, mapWidth: 1, mapHeight: 2 },
    "horse": { blocksLineOfSight: false, height: 1, mapWidth: 1, mapHeight: 2 },
    "wall": { blocksLineOfSight: true, height: 3 },
    "mountain": { blocksLineOfSight: true, height: 5 },
    "forest": { blocksLineOfSight: true, height: 4 },
    "building": { blocksLineOfSight: true, height: 4 },
  },
  startingTiles: [
    { x: 0, y: 1 },
    { x: 0, y: 3 },
  ],
  creatures: [
    createMonster("human_bandit", "bandits", { position: { x: 12, y: 7, facing: 1 }, weaponLoadout: "broadsword", armorLoadout: "shield" }),
    createMonster("shooter", "bandits", { position: { x: 10, y: 1, facing: 3 }, weaponLoadout: "shortbow" }),
    
    createMercenary("civilian", { 
      position: { x: 16, y: 4, facing: 6 },
      group: CREATURE_GROUPS.PLAYER
    }),
    createMercenary("civilian", { position: { x: 17, y: 4, facing: 6 }, group: CREATURE_GROUPS.PLAYER, facing: 6 }),
    new Hero({
      name: "Herbod",
      image: "creatures/human.png",
      attributes: {
        movement: 5,
        combat: 5,
        ranged: 3,
        strength: 3,
        agility: 4,
        courage: 5,
        intelligence: 4,
      },
      actions: 1,
      size: 2,
      inventory: [
        createConsumable("healingPotion"),
        createConsumable("strengthPotion"),
      ],
      equipment: {
        mainHand: createWeapon("mace"),
        offHand: createShield("shield"),
        armor: createArmor("chainMail"),
      },
      vitality: 5,
      mana: 0,
      fortune: 3,
      group: CREATURE_GROUPS.PLAYER,
      skills: [
        SKILL_PRESETS.lostInTheDark,
      ]
    }),
  ],
};
