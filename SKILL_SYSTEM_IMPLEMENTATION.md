# Skill System Implementation

## Overview

The skill system has been implemented to allow skills to modify creature attributes. Skills can provide flat bonuses or percentage modifiers to various creature stats, and these modifications are automatically applied when calculating effective attributes.

## Key Components

### 1. Enhanced Skill Interface (`src/creatures/types.ts`)

The `Skill` interface now includes `attributeModifiers`:

```typescript
export interface Skill {
  name: string;
  type: SkillType;
  description?: string;
  attributeModifiers?: Array<{
    attribute: keyof Attributes;
    value: number;
  }>;
}

export interface Skill {
  name: string;
  type: SkillType;
  description?: string;
  attributeModifiers?: AttributeModifier[];
}
```

### 2. Skill Processor (`src/creatures/skillProcessor.ts`)

A new `SkillProcessor` class handles all skill-related calculations:

- **`getEffectiveAttribute()`**: Calculates effective attribute values considering skill modifiers and wounding penalties
- **`getAttributeModifiers()`**: Retrieves all modifiers for a specific attribute
- **`getSkillEffectsSummary()`**: Generates a human-readable summary of all skill effects
- **`hasSkill()`**: Checks if a creature has a specific skill
- **`getSkillsByType()`**: Filters skills by type

### 3. Updated Skill Presets (`src/creatures/presets/skills.ts`)

Skills now include actual attribute modifiers:

```typescript
"strong": {
  name: "Strong",
  type: "combat",
  description: "+1 strength",
  attributeModifiers: [
    { attribute: "strength", value: 1 }
  ]
},

"warrior": {
  name: "Warrior",
  type: "combat",
  description: "+1 combat, +1 strength",
  attributeModifiers: [
    { attribute: "combat", value: 1 },
    { attribute: "strength", value: 1 }
  ]
}
```

### 4. Enhanced Combat Manager (`src/creatures/combat.ts`)

The `CreatureCombatManager` now:
- Accepts skills as a constructor parameter
- Uses `SkillProcessor` to calculate effective attributes
- Applies skill modifiers before wounding penalties

### 5. Updated Base Creature Class (`src/creatures/base.ts`)

The base `Creature` class now:
- Passes skills to the combat manager
- Provides skill management methods:
  - `getSkills()`: Returns all skills
  - `hasSkill(skillName)`: Checks for specific skills
  - `getSkillsByType(type)`: Filters skills by type
  - `getSkillEffectsSummary()`: Shows all active skill effects

## How It Works

### 1. Skill Application

When a creature's effective attributes are calculated:

1. **Base Value**: Start with the creature's base attribute value
2. **Skill Modifiers**: Apply all relevant skill modifiers (flat or percentage)
3. **Wounding Penalty**: Apply wounding penalty if applicable (minimum value of 1)

### 2. Example Calculation

```typescript
// Base strength: 3
// Skills: Strong (+1), Warrior (+1)
// Total skill bonus: +2
// Effective strength: 3 + 2 = 5

// If wounded: 5 - 1 = 4 (minimum 1)
```

### 3. Multiple Skills

Skills stack additively. A creature with both "Strong" and "Warrior" skills gets:
- Strength: +2 (from both skills)
- Combat: +1 (from Warrior skill)

## Usage Examples

### Creating Skills

```typescript
const mySkill: Skill = {
  name: "Marksman",
  type: "combat",
  description: "+2 ranged combat",
  attributeModifiers: [
    { attribute: "ranged", value: 2 }
  ]
};
```

### Applying Skills to Creatures

```typescript
const creature = new Hero({
  // ... other parameters
  skills: {
    strong: SKILL_PRESETS.strong,
    agile: SKILL_PRESETS.agile
  }
});
```

### Checking Skill Effects

```typescript
// Get effective strength (includes skill bonuses)
const effectiveStrength = creature.strength;

// Check if creature has a skill
if (creature.hasSkill("Strong")) {
  console.log("This creature is strong!");
}

// Get all skill effects
const effects = creature.getSkillEffectsSummary();
// Output: ["Strong: +1 strength", "Agile: +1 agility"]
```

## Skill Types

The system supports four skill types:

1. **Combat**: Skills that enhance combat-related attributes
2. **Stealth**: Skills that improve stealth and agility
3. **Academic**: Skills that boost intelligence and perception
4. **Natural**: Skills that enhance natural abilities and vitality

## Modifier Types

All skill modifiers are **flat** modifiers that add or subtract a fixed value (e.g., +1, -2) from the base attribute value.

## Integration Points

### Existing Systems

- **Combat System**: Skills automatically affect combat calculations
- **Movement System**: Movement-related skills affect movement range
- **Equipment System**: Skills work alongside equipment bonuses
- **Wounding System**: Skill bonuses are applied before wounding penalties

### Preset System

Skills are already integrated into the creature preset system:
- Monster presets include skills (e.g., bandits have "Agile" skill)
- Mercenary presets include skills (e.g., civilians have "Tough" skill)
- Skills are automatically applied when creatures are created from presets

## Benefits

1. **Flexible**: Easy to create new skills with different effects
2. **Stackable**: Multiple skills can affect the same attribute
3. **Integrated**: Works seamlessly with existing game systems
4. **Maintainable**: Centralized skill processing logic
5. **Extensible**: Easy to add new modifier types or skill effects

## Future Enhancements

Potential areas for expansion:

1. **Temporary Skills**: Skills that activate under certain conditions
2. **Skill Trees**: Prerequisites and progression systems
3. **Skill Synergies**: Special effects when certain skills are combined
4. **Dynamic Skills**: Skills that change based on equipment or conditions
5. **Skill Experience**: Skills that improve with use

## Testing

The system includes comprehensive tests in `src/creatures/skills.test.ts` that verify:
- Single skill effects
- Multiple skill stacking
- Wounding penalty integration
- Skill effect summaries
- Skill queries and filtering

## Conclusion

The skill system successfully provides a flexible and powerful way for skills to modify creature attributes. It integrates seamlessly with existing game systems while maintaining clean separation of concerns. The implementation is robust, well-tested, and ready for use in the game.
