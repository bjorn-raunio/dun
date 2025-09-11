import { Attributes } from '../../statusEffects/types';
import { Faction } from '../../creatures/monsters/Faction';

// --- QuestMap Preset Type Definitions ---

export type QuestMapResolution = {
  description: string;
  reward?: () => { gold?: number, goldPerHero?: number, experience?: number, experienceTimeBonus?: number };
  newQuests?: string[];
}

export interface QuestMapPreset {
  id: string;
  name: string;
  rooms: RoomPreset[];
  creatures: CreaturePreset[];
  connections: ConnectionPreset[];
  startingTiles: StartingTilePreset[];
  description: string;
  goal: string;
  success: QuestMapResolution;
  failure: QuestMapResolution;
  region?: string;
  faction: Faction<any>;
  victoryCondition: () => boolean;
}

export interface RoomPreset {
  sections: QuestMapSectionPreset[];
  light?: 'lit' | 'darkness' | 'totalDarkness';
}

export interface QuestMapSectionPreset {
  type: string;
  x: number;
  y: number;
  rotation?: 0 | 90 | 180 | 270;
  options?: {
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
    leader?: boolean;
  };
}

export interface StartingTilePreset {
  x: number;
  y: number;
  image?: string;
}

export interface ConnectionPreset {
  presetId: string;
  x: number;
  y: number;
  rotation?: 0 | 90 | 180 | 270;
  overrides?: {
    mapWidth?: number;
    mapHeight?: number;
    image?: string;
    isOpen?: boolean;
    isLocked?: boolean;
    isBroken?: boolean;
    lockDifficulty?: number;
  };
}

export interface QuestMapPresetCategory {
  name: string;
  description: string;
  presets: Record<string, QuestMapPreset>;
}
