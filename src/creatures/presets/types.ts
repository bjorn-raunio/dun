import { Attributes } from '../index';
import { AIBehaviorType } from '../../ai/types';

// --- Shared Preset Types ---

export type BasePreset = {
  name: string;
  image: string;
  attributes: Attributes;
  actions?: number; // Optional - defaults to 1
  mapWidth?: number;
  mapHeight?: number;
  size: number; // 1=small, 2=medium, 3=large, 4=huge
  facing?: number; // 0-7: 0=North, 1=NE, 2=East, 3=SE, 4=South, 5=SW, 6=West, 7=NW
  inventory?: Array<{ type: "weapon" | "ranged_weapon" | "armor" | "shield"; preset: string; id?: string }>;
  equipment?: {
    mainHand?: { type: "weapon" | "ranged_weapon"; preset: string; id?: string };
    offHand?: { type: "weapon" | "ranged_weapon" | "shield"; preset: string; id?: string };
    armor?: { type: "armor"; preset: string; id?: string };
  };
  vitality: number;
  mana: number;
  fortune: number;
  naturalArmor?: number;
  group?: string;
};

export type MonsterPreset = BasePreset & {
  aiBehavior?: AIBehaviorType; // AI behavior type (melee, ranged, animal)
  faction?: string; // Which faction this monster belongs to
};

export type MercenaryPreset = BasePreset & {
  hireCost: number;
};
