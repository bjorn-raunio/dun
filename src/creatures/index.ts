// Import types for type alias
import { Hero } from './hero';
import { Monster } from './monster';
import { Mercenary } from './mercenary';

// Initialize the creature system
import './init';

// Export all creature-related modules
export { Creature } from './base';
export { CREATURE_GROUPS, type CreatureGroup } from './types';
export { Hero } from './hero';
export { Monster, MONSTER_FACTIONS, MONSTER_FACTIONS_KEYS, type MonsterFaction, type MonsterFactionInfo } from './monster';
export { Mercenary } from './mercenary';
export { CreatureMovement } from './movement';
export { createMonster, monsterPresets, monsterPresetsByFaction, type MonsterPreset, createMercenary, mercenaryPresets, type MercenaryPreset } from './presets';

// Export new interfaces and services
export * from './interfaces';
export { CreatureServiceLocator } from './services';
export { CombatExecutor } from './combatExecutor';

// Type alias for union type
export type CreatureInstance = Hero | Monster | Mercenary;
