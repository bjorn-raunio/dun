import { QuestMap, Room } from '../types';
import { QuestMapPreset, QuestMapPresetCategory } from './types';
import { questMapPresets } from './questMapPresets';
import { createSection } from '../section/presets';
import { createConnection } from '../connection/presets';
import { createMonster, createMercenary, CREATURE_GROUPS, Creature } from '../../creatures/index';
import { logError } from '../../utils';
import { generateRandomWeather, WeatherEffect } from '../../game/weather';

// --- QuestMap Factory Functions ---

/**
 * Create a QuestMap instance from a preset with random weather
 */
export function createQuestMapFromPreset(preset: QuestMapPreset, numberOfHeroes: number): QuestMap | null {

  try {
    // Create rooms from preset
    const rooms = preset.rooms.map(roomPreset => {
      const sections = roomPreset.sections.map(sectionPreset => {
        const options = sectionPreset.options || {};
        return createSection(sectionPreset.type, sectionPreset.x, sectionPreset.y, {
          rotation: sectionPreset.rotation || 0,
          terrain: options.terrain || []
        });
      });

      const room = new Room(sections);

      return room;
    });

    // Create creatures from preset
    const creatures: Creature[] = [];
    preset.creatures.forEach(creaturePreset => {
      if(creaturePreset.options?.minHeroes && creaturePreset.options.minHeroes > numberOfHeroes) {
        return;
      }
      const { type, variant, position, options } = creaturePreset;
      const creatureOptions = options || {};

      switch (type) {
        case 'monster':
          creatures.push(createMonster(variant, 'bandits', {
            position,
            weaponLoadout: creatureOptions.weaponLoadout,
            armorLoadout: creatureOptions.armorLoadout
          }));
          break;
        case 'mercenary':
          creatures.push(createMercenary(variant, {
            position,
            group: creatureOptions.group === 'player' ? CREATURE_GROUPS.PLAYER : CREATURE_GROUPS.NEUTRAL
          }));
          break;
        default:
          break;
      }
    });

    // Create connections from preset
    const connections = preset.connections.map(connectionPreset => {
      return createConnection(
        connectionPreset.presetId,
        connectionPreset.x,
        connectionPreset.y,
        connectionPreset.rotation,
        connectionPreset.overrides
      );
    });

    // Create the QuestMap
    const questMap = new QuestMap(
      preset.name,
      100,
      100,
      rooms,
      creatures,
      preset.startingTiles,
      connections
    );
    questMap.updateLighting(creatures);

    creatures.forEach(creature => {
      if (creature.x !== undefined && creature.y !== undefined) {
        creature.enterTile(creature.x, creature.y, questMap);
      }
    });

    return questMap;

  } catch (error) {
    logError(`Map generation`, `Unable to create map from preset ${preset.name}`, error);
    return null;
  }
}

/**
 * Create a QuestMap instance from a preset with random weather
 * @returns Object containing the quest map and random weather effect
 */
export function createQuestMapFromPresetWithWeather(preset: QuestMapPreset, numberOfHeroes: number): { questMap: QuestMap | null; weather: WeatherEffect } {
  const questMap = createQuestMapFromPreset(preset, numberOfHeroes);
  const weather = generateRandomWeather();
  
  return { questMap, weather };
}


/**
 * Get all available QuestMap presets
 */
export function getAvailableQuestMapPresets(): Record<string, QuestMapPreset> {
  return questMapPresets;
}

/**
 * Get a specific QuestMap preset by ID
 */
export function getQuestMapPreset(presetId: string): QuestMapPreset | null {
  return questMapPresets[presetId] || null;
}

/**
 * Get all QuestMap preset IDs
 */
export function getQuestMapPresetIds(): string[] {
  return Object.keys(questMapPresets);
}