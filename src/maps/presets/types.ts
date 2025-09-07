import { ICreature } from '../../creatures/index';
import { Section } from '../section';
import { Attributes } from '../../statusEffects/types';

// --- QuestMap Preset Type Definitions ---

export interface QuestMapPreset {
  name: string;
  width: number;
  height: number;
  rooms: RoomPreset[];
  creatures: CreaturePreset[];
  startingTiles: StartingTilePreset[];
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  recommendedLevel?: number;
}

export interface RoomPreset {
  sections: QuestMapSectionPreset[];
  light?: 'lit' | 'darkness' | 'totalDarkness';
}

export interface QuestMapSectionPreset {
  type: string;
  x: number;
  y: number;
  options?: {
    rotation?: 0 | 90 | 180 | 270;
    terrain?: Array<{
      id: string;
      x: number;
      y: number;
      rotation?: 0 | 90 | 180 | 270;
    }>;
  };
}

export interface CreaturePreset {
  type: string;
  variant: string;
  position: {
    x: number;
    y: number;
    facing: number;
  };
  options?: {
    weaponLoadout?: string;
    armorLoadout?: string;
    group?: string;
    name?: string;
    attributes?: Partial<Attributes>;
    skills?: string[];
    inventory?: string[];
    equipment?: Record<string, string>;
    minHeroes?: number;
  };
}

export interface StartingTilePreset {
  x: number;
  y: number;
  image?: string;
}

export interface QuestMapPresetCategory {
  name: string;
  description: string;
  presets: Record<string, QuestMapPreset>;
}
