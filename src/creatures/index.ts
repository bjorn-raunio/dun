// Import types for type alias
import { Hero } from './hero';
import { Monster } from './monster';
import { Mercenary } from './mercenary';

// Export all creature-related modules
export { Creature, CREATURE_GROUPS, type CreatureGroup } from './base';
export { Hero } from './hero';
export { Monster } from './monster';
export { Mercenary } from './mercenary';
export { CreatureMovement } from './movement';
export { CreatureCombat } from './combat';
export { createMonster, monsterPresets, type MonsterPreset, createMercenary, mercenaryPresets, type MercenaryPreset } from './presets';

// Type alias for union type
export type CreatureInstance = Hero | Monster | Mercenary;
