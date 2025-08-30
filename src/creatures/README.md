# Creature System

This directory contains the modular creature system, split from the original monolithic `creatures.ts` file for better organization and maintainability.

## Group System

Creatures belong to groups that determine their relationships and control:

### Available Groups
- **`hero`**: Player-controlled creatures
- **`enemy`**: AI-controlled creatures (monsters, bandits, etc.)
- **`neutral`**: Neutral creatures (not controlled by player or AI)

### Group Relationships
- Creatures of the same group are **friendly** to each other
- Creatures of different groups are **hostile** to each other
- Creatures in the `hero` group are player-controlled
- Creatures in the `enemy` group are AI-controlled
- Neutral creatures are hostile to all other groups

### Group Methods
```typescript
// Check group relationships
creature.isHostileTo(otherCreature)     // Returns true if hostile
creature.isFriendlyTo(otherCreature)    // Returns true if friendly
creature.isHeroGroup()                  // Returns true if in hero group
creature.isPlayerControlled()           // Returns true if player-controlled
creature.isAIControlled()               // Returns true if AI-controlled

// Get creatures by relationship
creature.getHostileCreaturesByGroup(allCreatures)   // Get all hostile creatures
creature.getFriendlyCreaturesByGroup(allCreatures)  // Get all friendly creatures
```

### Action System
Creatures have two types of actions:
- **Regular Actions**: Standard actions like attacking, using abilities, etc.
- **Quick Actions**: Faster actions that can be performed more frequently

Both action types are tracked and reset as part of the group-based turn management system.

### Group-Based Action Tracking
The system tracks which creatures have moved or used actions within the same group. When a creature acts (moves or attacks), other creatures in the same group that have already acted have their remaining movement and actions reset to 0, ensuring each creature takes a full turn before the next creature starts.

#### Action Tracking Methods
```typescript
// Check if creature has taken actions this turn
creature.hasTakenActionsThisTurn()     // Returns true if moved or used actions

// Reset actions for group-based turn management
creature.resetRemainingActions()        // Reset remaining movement/actions to 0
creature.resetGroupActions(allCreatures) // Reset actions for other creatures in same group

// Use actions
creature.useAction()                    // Use a regular action
creature.useQuickAction()               // Use a quick action
```

## Automatic ID Generation

Creatures and items automatically generate unique IDs when created, eliminating the need to manually specify IDs in constructors:

```typescript
// IDs are automatically generated
const hero = new Hero({
  name: "Knight",
  x: 1,
  y: 1,
  // ... other properties
  // No need to specify id - it's auto-generated as "creature-1", "creature-2", etc.
});

const monster = createMonster("bandit", {
  x: 5,
  y: 5,
  // No need to specify id
});

const weapon = createWeapon("dagger");
// Weapon gets auto-generated ID like "item-1", "item-2", etc.
```

### ID Generation Functions
- `generateCreatureId()`: Generates unique creature IDs (creature-1, creature-2, etc.)
- `generateItemId()`: Generates unique item IDs (item-1, item-2, etc.)

## Structure

### `base.ts`
Contains the abstract `Creature` class with core functionality:
- Basic properties (id, name, position, stats, etc.)
- Equipment and inventory management
- Zone of control and engagement logic
- Turn management (movement, actions)
- Utility methods (facing, dimensions, etc.)
- Automatic ID generation

### `hero.ts`
Contains the `Hero` class that extends `Creature`:
- Player character specific logic
- Placeholder for hero-specific abilities, experience, leveling, etc.

### `monster.ts`
Contains the `Monster` class that extends `Creature`:
- Enemy specific logic
- **AI State Management**: Each monster has an `aiState` property that tracks:
  - Current behavior type (MELEE, RANGED, ANIMAL)
  - Current target
  - Last known player positions
  - Tactical memory (last moves, attacks, preferred positions)
- **AI State Methods**:
  - `getAIState()`: Returns the current AI state
  - `updateAIState(newState)`: Updates the AI state after decisions
  - `isAIControlled()`: Returns true (all monsters are AI controlled)
- Note: AI logic is handled in the `src/ai/` module

### `mercenary.ts`
Contains the `Mercenary` class that extends `Creature`:
- Player-controllable hired fighters
- Loyalty and payment system
- Experience and leveling system
- Desertion mechanics for low loyalty

### `movement.ts`
Contains the `CreatureMovement` class with all movement and pathfinding logic:
- Reachable tiles calculation
- Pathfinding with engagement restrictions
- Terrain and obstacle handling
- Zone of control movement rules

### Combat Logic
Combat logic is now centralized in `src/utils/combatUtils.ts`:
- Attack execution via `executeCombat()` function
- Damage calculation and dice rolling utilities
- Combat validation and range checking

### `presets.ts`
Contains monster and mercenary presets and factory functions:
- `MonsterPreset` type definition
- `monsterPresets` configuration object
- `createMonster()` factory function
- `MercenaryPreset` type definition
- `mercenaryPresets` configuration object
- `createMercenary()` factory function

### `index.ts`
Main export file that re-exports all modules for easy importing.

## Usage

### Basic Import
```typescript
import { Creature, Hero, Monster, Mercenary, createMonster, createMercenary } from '../creatures/index';
```

### Specific Module Import
```typescript
import { CreatureMovement } from '../creatures/movement';
import { executeCombat } from '../utils/combatUtils';
import { monsterPresets, mercenaryPresets } from '../creatures/presets';
```

### Creating Creatures
```typescript
// Create a hero
const hero = new Hero({
  name: 'Adventurer',
  x: 5,
  y: 5,
  attributes: {
    movement: 6,
    combat: 4,
    ranged: 2,
    strength: 3,
    agility: 3,
    courage: 3,
    intelligence: 3,
  },
  actions: 2,
  quickActions: 1,  // Optional: defaults to 0 if not specified
  size: 2,
  vitality: 6,
  mana: 3,
  fortune: 3,
  group: 'hero'  // Automatically set for Hero class
});

// Create a monster from preset
const bandit = createMonster('bandit', {
  x: 10,
  y: 10
  // group: 'enemy' is automatically set by Monster constructor
  // AI state is automatically initialized based on preset
});

// Create a monster with custom AI behavior
const customMonster = new Monster({
  name: "Custom Enemy",
  x: 15,
  y: 15,
  preset: { aiBehavior: AIBehaviorType.RANGED }, // Custom AI behavior
  // ... other properties
});

// Access and update AI state
const aiState = monster.getAIState();
console.log('Current behavior:', aiState.behavior);
console.log('Current target:', aiState.currentTarget?.name);

// Update AI state after AI decisions
monster.updateAIState(newAIState);

// Create a monster with custom group
const neutralCreature = createMonster('bandit', {
  x: 15,
  y: 15,
  group: 'neutral'  // Override default group
});

// Create a mercenary from preset
const archer = createMercenary('archer', {
  x: 10,
  y: 10,
  loyalty: 90  // Override default loyalty
});

// Create a custom mercenary
const customMercenary = new Mercenary({
  name: 'Veteran Fighter',
  x: 12,
  y: 12,
  attributes: {
    movement: 6,
    combat: 5,
    ranged: 1,
    strength: 4,
    agility: 3,
    courage: 3,
    intelligence: 3,
  },
  actions: 2,
  size: 2,
  vitality: 6,
  mana: 3,
  fortune: 3,
  hireCost: 150,
  group: 'hero'
});
```

### Movement
```typescript
// Get reachable tiles
const { tiles, costMap } = creature.getReachableTiles(allCreatures, mapData, cols, rows);

// Move creature through a path
const path = [{x: creature.x, y: creature.y}, {x: newX, y: newY}]; // Path from current position to destination
const result = creature.moveTo(path, allCreatures);
if (result.success) {
  console.log('Moved successfully');
} else {
  console.log('Move failed:', result.message);
}
```

### Combat
```typescript
// Attack a target
const result = attacker.attack(target, allCreatures);
if (result.hit) {
  console.log(`Hit for ${result.damage} damage!`);
  if (result.targetDefeated) {
    console.log('Target defeated!');
  }
}
```

### Mercenary Management
```typescript
// Hire a mercenary
const success = mercenary.hire(100); // Returns true if cost >= hireCost

// Pay mercenary to increase loyalty
mercenary.pay(50); // Increases loyalty by 5

// Check loyalty and reliability
if (mercenary.isLoyal()) {
  console.log('Mercenary will follow orders');
}
console.log(`Reliability: ${mercenary.getReliability()}/10`);

// Gain experience and level up
mercenary.gainExperience(150);
if (mercenary.level > 1) {
  console.log('Mercenary leveled up!');
}

// Check for desertion risk
if (mercenary.mightDesert()) {
  console.log('Mercenary might desert!');
}
```

## Migration Notes

The original `creatures.ts` file has been replaced with a re-export of the new modular structure to maintain backward compatibility. All existing imports should continue to work without changes.

For new code, consider importing from specific modules to reduce bundle size and improve clarity:

```typescript
// Instead of importing everything
import { Creature, Hero, Monster, createMonster } from '../creatures/index';

// Import only what you need
import { Creature } from '../creatures/base';
import { createMonster } from '../creatures/presets';
```

## Available Presets

### Monster Presets
- `bandit`: Basic enemy with dagger and leather armor
- `goblin`: Small, fast enemy with dagger
- `orc`: Strong enemy with broadsword and leather armor

### Mercenary Presets
- `archer`: Ranged specialist with longbow
- `tank`: Heavy fighter with broadsword, shield, and chain mail
- `scout`: Fast scout with dagger and leather armor
- `healer`: Support specialist with basic equipment

### Weapon Presets
- `unarmed`: Default weapon for creatures without equipment (0 damage, -1 combat modifier, 0 armor modifier)
- `dagger`: Light weapon with finesse and thrown properties (-1 combat modifier, 0 armor modifier)
- `scimitar`: Light weapon with finesse property (0 armor modifier)
- `broadsword`: Versatile weapon with +1 damage (0 armor modifier)
- `armorPiercingSword`: Armor-piercing weapon that reduces target armor (-1 armor modifier)
- `mace`: Bludgeoning weapon that reduces target armor (-2 armor modifier)

## Unarmed Combat System

Creatures without weapons equipped automatically use an "unarmed" weapon with the following properties:
- **Damage**: 0 (no bonus damage)
- **Combat Modifier**: -1 (penalty to attack rolls)
- **Range**: 1 tile (melee only)
- **Properties**: Light

This ensures that all creatures can engage in combat, even without weapons. The unarmed weapon is automatically applied when:
- No weapon is equipped in main hand or off hand
- Using `getMainWeapon()` function
- Calculating weapon damage or attack bonuses

### Example
```typescript
// Creature without weapons
const unarmedCreature = new Hero({
  name: "Bare Fists",
  x: 0,
  y: 0,
  attributes: {
    movement: 5,
    combat: 3,
    ranged: 2,
    strength: 3,
    agility: 3,
    courage: 3,
    intelligence: 3,
  },
  actions: 1,
  size: 2,
  vitality: 5,
  mana: 3,
  fortune: 3,
  equipment: {}, // No weapons
  group: 'hero',
});

// Will automatically use unarmed weapon
const weapon = getMainWeapon(unarmedCreature); // Returns unarmed weapon
const damage = getWeaponDamage(unarmedCreature); // Returns 0
const attackBonus = getAttackBonus(unarmedCreature); // Returns combat - 1
```

## Armor Modifier System

Weapons and ranged weapons can modify the armor of targets they attack. This allows for armor-piercing weapons that can bypass or reduce the effectiveness of enemy armor.

### How it Works
- **Armor Modifier**: A bonus or penalty applied to the target's armor value during combat
- **Target Armor**: Base armor (equipped armor or natural armor) + attacker's weapon armor modifier
- **Combat Impact**: Negative armor modifiers reduce target armor, making it easier to deal damage

### Example Weapons with Armor Modifiers
- **Armor Piercing Sword**: -1 armor modifier (reduces target armor by 1)
- **Mace**: -2 armor modifier (reduces target armor by 2)

### Example
```typescript
// Creature with armor-piercing weapon
const armorPiercer = new Hero({
  name: "Armor Piercer",
  x: 0,
  y: 0,
  attributes: {
    movement: 5,
    combat: 4,
    ranged: 2,
    strength: 4,
    agility: 3,
    courage: 3,
    intelligence: 3,
  },
  actions: 1,
  size: 2,
  vitality: 5,
  mana: 3,
  fortune: 3,
  equipment: {
    mainHand: createWeapon("armorPiercingSword"), // -1 armor modifier
  },
  group: 'hero',
});

// When attacking a target with 5 armor
// Target's effective armor becomes: 5 + (-1) = 4
// This makes it easier to deal damage to the target
```

## Future Enhancements

- Add hero-specific abilities and progression system
- Add monster-specific abilities and behaviors
- Expand preset system with more monster and mercenary types
- Add equipment and inventory management utilities
- Add creature serialization/deserialization for save/load
- Add mercenary recruitment and management UI
