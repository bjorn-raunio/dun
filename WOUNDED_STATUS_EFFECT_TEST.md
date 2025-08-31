# Wounded Status Effect Test

This test demonstrates the new encapsulated status effect manager that automatically handles wounded status effects.

## Test Scenario

1. Create a creature with high vitality
2. Reduce vitality to wounded state
3. Verify that wounded status effect is automatically applied
4. Check that the effect provides proper attribute modifiers

## Code Example

```typescript
import { Hero } from './src/creatures/hero';
import { HeroPreset } from './src/creatures/presets/heroPresets';

// Create a hero with high vitality
const hero = new Hero({
  ...HeroPreset.knight,
  vitality: 20,
  remainingVitality: 20
});

// Initially, no wounded effect should be present
console.log('Initial status effects:', hero.getActiveStatusEffects().length); // Should be 0
console.log('Is wounded?', hero.isWounded()); // Should be false

// Reduce vitality to wounded state (below threshold)
hero.setRemainingVitality(3); // For size 1 creature, wounded threshold is 1

// Now the wounded effect should be automatically present
console.log('Status effects after damage:', hero.getActiveStatusEffects().length); // Should be 1
console.log('Is wounded?', hero.isWounded()); // Should be true

// Check that the wounded effect provides proper modifiers
const woundedEffect = hero.getStatusEffect('wounded');
console.log('Wounded effect:', woundedEffect);
console.log('Movement modifier:', woundedEffect?.attributeModifiers?.movement); // Should be -1

// Verify that effective attributes are reduced
console.log('Base movement:', hero.attributes.movement);
console.log('Effective movement:', hero.movement); // Should be base - 1
```

## Key Features

### Automatic Wounded Status
- The status effect manager automatically creates a wounded effect when `creature.isWounded()` returns true
- No manual application of wounded effects is needed
- The effect is marked with `isAutomatic: true` to distinguish it from manually applied effects

### Encapsulated Logic
- The status effect manager now has access to the creature instance
- Wounded status is determined by the creature's health state
- The manager provides a unified interface for all effects (manual + automatic)

### Backward Compatibility
- Existing code using `getActiveStatusEffects()` continues to work
- New `getAllActiveEffects()` method provides complete status effect state
- The wounded effect is automatically included in all status effect queries

## Implementation Details

### StatusEffectManager Interface
```typescript
export interface StatusEffectManager {
  // ... existing methods ...
  getAllActiveEffects(): StatusEffect[]; // NEW: Includes automatic effects
}
```

### Automatic Effect Creation
```typescript
private createWoundedEffect(): StatusEffect {
  return {
    id: `wounded_${this.creature.id}`,
    type: 'wounded',
    name: 'Wounded',
    description: 'Injured and suffering from reduced capabilities',
    icon: '🩸',
    duration: null, // Permanent until healed
    remainingTurns: null,
    stackCount: 1,
    maxStacks: 1,
    attributeModifiers: {
      movement: -1,
      combat: -1,
      ranged: -1,
      strength: -1,
      agility: -1,
      courage: -1,
      intelligence: -1,
      perception: -1,
      dexterity: -1
    },
    isAutomatic: true // Mark as automatic effect
  };
}
```

### Health-Based Thresholds
The wounded status is determined by the creature's size and remaining vitality:
- Size < 4: Wounded when vitality ≤ 1
- Size ≥ 4: Wounded when vitality ≤ 5

This ensures that larger creatures have a higher threshold for being considered wounded.
