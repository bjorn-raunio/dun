// Import types for type alias
import { Hero } from './hero';
import { Monster } from './monster';
import { Mercenary } from './mercenary';

// Export all creature-related modules
export { Creature, CREATURE_GROUPS, type CreatureGroup, type Attributes } from './base';
export { Hero } from './hero';
export { Monster, MONSTER_FACTIONS, MONSTER_FACTIONS_KEYS, type MonsterFaction, type MonsterFactionInfo } from './monster';
export { Mercenary } from './mercenary';
export { CreatureMovement } from './movement';
export { createMonster, monsterPresets, monsterPresetsByFaction, type MonsterPreset, createMercenary, mercenaryPresets, type MercenaryPreset } from './presets';

// Type alias for union type
export type CreatureInstance = Hero | Monster | Mercenary;
