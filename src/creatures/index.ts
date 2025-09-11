// Import types for type alias
import { Hero } from './heroes';
import { Monster } from './monsters';
import { Mercenary } from './mercenaries';

// Initialize the creature system
import './init';

// Export all creature-related modules
export { Creature } from './base';
export { CREATURE_GROUPS, CreatureGroup } from './CreatureGroup';
export { Hero } from './heroes';
export { Monster, MONSTER_FACTIONS } from './monsters';
export { Mercenary } from './mercenaries';
export { CreatureMovement } from './movement';
export { createMonster, monsterPresets } from './monsters';
export { createMercenary, mercenaryPresets } from './mercenaries';
export { type MonsterPreset, type MercenaryPreset } from './presets';
export { createHero, heroPresets, type HeroPreset } from './heroes';
export { Party } from './Party';

// Export new interfaces and services
export * from './interfaces';
export * from './types';
export { CreatureServiceLocator } from './services';
export { CombatExecutor } from './combatExecutor';

// Type alias for union type
export type CreatureInstance = Hero | Monster | Mercenary;
