import { QuestMap, Room } from '../types';
import { QuestMapPreset, QuestMapPresetCategory } from './types';
import { questMapPresets, questMapPresetsByCategory } from './questMapPresets';
import { createSection } from '../section/presets';
import { createMonster, createMercenary, CREATURE_GROUPS, Creature } from '../../creatures/index';

// --- QuestMap Factory Functions ---

/**
 * Create a QuestMap instance from a preset
 */
export function createQuestMapFromPreset(presetId: string, numberOfHeroes: number): QuestMap | null {
  const preset = questMapPresets[presetId];
  if (!preset) {
    return null;
  }

  try {
    // Create rooms from preset
    const rooms = preset.rooms.map(roomPreset => {
      const sections = roomPreset.sections.map(sectionPreset => {
        const options = sectionPreset.options || {};
        return createSection(sectionPreset.type, sectionPreset.x, sectionPreset.y, {
          rotation: options.rotation || 0,
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

    // Create the QuestMap
    const questMap = new QuestMap(
      preset.name,
      preset.width,
      preset.height,
      rooms,
      creatures,
      preset.startingTiles
    );
    questMap.updateLighting(creatures);

    creatures.forEach(creature => {
      if (creature.x !== undefined && creature.y !== undefined) {
        creature.enterTile(creature.x, creature.y, questMap);
      }
    });

    return questMap;

  } catch (error) {
    return null;
  }
}

/**
 * Get all available QuestMap presets
 */
export function getAvailableQuestMapPresets(): Record<string, QuestMapPreset> {
  return questMapPresets;
}

/**
 * Get QuestMap presets by category
 */
export function getQuestMapPresetsByCategory(): Record<string, QuestMapPresetCategory> {
  return questMapPresetsByCategory;
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

/**
 * Get QuestMap presets by difficulty
 */
export function getQuestMapPresetsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): QuestMapPreset[] {
  return Object.values(questMapPresets).filter(preset => preset.difficulty === difficulty);
}

/**
 * Get QuestMap presets suitable for a given level
 */
export function getQuestMapPresetsByLevel(level: number): QuestMapPreset[] {
  return Object.values(questMapPresets).filter(preset =>
    !preset.recommendedLevel || preset.recommendedLevel <= level
  );
}
