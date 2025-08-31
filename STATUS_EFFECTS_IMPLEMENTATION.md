# Status Effects System Implementation

## Overview

The status effects system allows creatures to have various temporary or permanent effects applied to them that modify their attributes, movement, combat abilities, and trigger special behaviors.

## Features

### Core Functionality
- **Temporary Effects**: Effects with a fixed duration in turns
- **Permanent Effects**: Effects that persist until manually removed
- **Stacking**: Multiple instances of the same effect can stack up to a maximum
- **Priority System**: Effects are displayed and processed in priority order
- **Automatic Cleanup**: Expired effects are automatically removed

### Effect Types

#### Combat Debuffs
- **Poison**: Deals damage over time, reduces strength and agility
- **Wounded**: **AUTOMATIC** - Applied when creature health drops below threshold, reduces all attributes
- **Burning**: Deals fire damage, reduces intelligence
- **Stunned**: Prevents actions for the duration

#### Automatic Effects
- **Wounded**: Automatically applied when `creature.isWounded()` returns true
  - Threshold: Size < 4: vitality ≤ 1, Size ≥ 4: vitality ≤ 5
  - Effect: -1 to all attributes (movement, combat, strength, agility, etc.)
  - Duration: Permanent until creature is healed above threshold
  - Marked with `isAutomatic: true` for identification

#### Movement Effects
- **Slowed**: Reduces movement points
- **Hasted**: Increases movement and actions

#### Combat Buffs
- **Strengthened**: Increases strength, combat, and damage
- **Protected**: Increases armor value
- **Regenerating**: Heals over time

#### Special Effects
- **Invisible**: Provides combat advantages
- **Silenced**: Prevents magic use
- **Confused**: Randomizes actions
- **Fearful**: Reduces combat effectiveness

## Architecture

### Components

1. **StatusEffect Interface** (`src/creatures/types.ts`)
   - Defines the structure of status effects
   - Includes modifiers, callbacks, and visual properties
   - New `isAutomatic` property for automatically generated effects

2. **CreatureStatusEffectManager** (`src/creatures/statusEffects.ts`)
   - Manages all status effects for a creature
   - Handles adding, removing, updating, and stacking effects
   - **NEW**: Automatically generates wounded status effects based on creature health
   - **NEW**: Provides `getAllActiveEffects()` method for complete status effect state

3. **StatusEffectsSection** (`src/components/CreaturePanel/SkillsSection/StatusEffectsSection.tsx`)
   - UI component displaying active status effects
   - Shows effect details, duration, and modifiers

4. **Status Effects Utilities** (`src/utils/statusEffects.ts`)
   - Helper functions for applying common effects
   - Predefined effect configurations

### Integration Points

- **Turn System**: Effects are processed at turn start/end
- **Creature Base Class**: All creatures have a status effect manager
- **UI**: Status effects are displayed in the creature panel
- **Combat**: Effects can modify combat attributes and trigger special behaviors

## Usage

### Applying Effects

```typescript
import { CommonStatusEffects } from '../utils/statusEffects';

// Apply a 3-turn poison effect
CommonStatusEffects.poison(creature, 3);

// Apply a permanent effect
CommonStatusEffects.strengthened(creature, null, 2, 3);
```

### Custom Effects

```typescript
import { createStatusEffect } from '../creatures/statusEffects';

const customEffect = createStatusEffect('poison', 5, 1, 1, {
  onTurnStart: (creature) => {
    // Custom turn start behavior
    creature.takeDamage(5);
  },
  attributeModifiers: {
    strength: -3,
    agility: -2
  }
});

creature.addStatusEffect(customEffect);
```

### Effect Modifiers

Effects can modify:
- **Attributes**: strength, agility, combat, etc.
- **Movement**: movement points per turn
- **Actions**: available actions and quick actions
- **Combat**: damage, armor, accuracy
- **Special**: custom behaviors via callbacks

### New API Methods

#### `getAllActiveEffects()`
- Returns all active effects including automatic effects like wounded
- This is the main method to use for getting complete status effect state
- Automatically includes wounded effect when creature health is below threshold

#### `hasEffect(type)` and `getEffect(type)`
- Now check both manual and automatic effects
- Wounded effect is automatically detected when creature is wounded
- No need to manually check health state - the manager handles it automatically

### Effect Callbacks

- `onTurnStart`: Triggered when a creature's turn begins
- `onTurnEnd`: Triggered when a creature's turn ends
- `onCombatStart`: Triggered when combat begins
- `onCombatEnd`: Triggered when combat ends
- `onDeath`: Triggered when the creature dies

## Turn Processing

### Turn Start
1. Update all status effects (decrement duration)
2. Remove expired effects
3. Execute `onTurnStart` callbacks
4. Apply attribute and movement modifiers

### Turn End
1. Execute `onTurnEnd` callbacks
2. Reset temporary modifiers

## UI Features

### Status Effects Display
- **Visual Indicators**: Icons and colors for each effect type
- **Stack Counters**: Show multiple instances of the same effect
- **Duration Display**: Turn countdown or permanent indicator
- **Modifier Summary**: Clear display of all active modifiers

### Demo Interface
- **Test Buttons**: Apply various effects for testing
- **Effect Categories**: Organized by effect type
- **Remove All**: Clear all effects at once

## Future Enhancements

### Planned Features
- **Effect Resistance**: Creatures can resist certain effect types
- **Effect Interactions**: Effects that modify other effects
- **Conditional Effects**: Effects that only apply under certain conditions
- **Effect Transfer**: Effects that can spread between creatures

### Integration Opportunities
- **Magic System**: Spells that apply status effects
- **Equipment**: Items that grant status effect resistance
- **Skills**: Abilities that can remove or transfer effects
- **AI**: AI creatures that use status effects strategically

## Testing

The system includes a demo interface in the creature panel that allows testing of all effect types. Use this to verify:

1. **Effect Application**: Effects are properly applied and displayed
2. **Duration Tracking**: Effects expire after the correct number of turns
3. **Stacking**: Multiple effects of the same type stack correctly
4. **Modifier Application**: Attribute and movement modifiers work as expected
5. **Callback Execution**: Turn start/end behaviors trigger properly

## Performance Considerations

- Effects are stored in a Map for O(1) lookup
- Effect updates only occur at turn boundaries
- UI updates are optimized to only re-render when effects change
- Effect processing is batched during turn advancement

## Code Organization

```
src/
├── creatures/
│   ├── types.ts              # Status effect interfaces
│   ├── statusEffects.ts      # Effect manager implementation
│   └── base.ts               # Creature base class integration
├── components/
│   └── CreaturePanel/
│       └── SkillsSection/
│           ├── StatusEffectsSection.tsx  # Effect display
│           └── StatusEffectsDemo.tsx     # Testing interface
└── utils/
    └── statusEffects.ts      # Utility functions and common effects
```

This implementation provides a robust foundation for status effects that can be easily extended with new effect types and integrated with other game systems.
