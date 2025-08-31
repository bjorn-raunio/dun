# Stunned Status Effect Test

This document demonstrates that the stunned status effect now properly applies -1 to all creature attributes and includes automatic recovery on a d6 roll of 4+ at turn start.

## Test Setup

### 1. Create a Test Creature

```typescript
import { Hero } from './src/creatures/hero';
import { CommonStatusEffects } from './src/utils/statusEffects';

// Create a creature with known base attributes
const testCreature = new Hero({
  name: "Test Hero",
  x: 0,
  y: 0,
  attributes: {
    movement: 4,
    combat: 3,
    ranged: 2,
    strength: 4,
    agility: 3,
    courage: 2,
    intelligence: 1,
    perception: 2,
    dexterity: 3
  },
  actions: 2,
  vitality: 20,
  mana: 10,
  fortune: 5,
  size: 1,
  group: "player"
});

console.log("Base attributes:");
console.log(`Movement: ${testCreature.movement}`);      // Should be 4
console.log(`Combat: ${testCreature.combat}`);          // Should be 3
console.log(`Ranged: ${testCreature.ranged}`);          // Should be 2
console.log(`Strength: ${testCreature.strength}`);      // Should be 4
console.log(`Agility: ${testCreature.agility}`);        // Should be 3
console.log(`Courage: ${testCreature.courage}`);        // Should be 2
console.log(`Intelligence: ${testCreature.intelligence}`); // Should be 1
console.log(`Perception: ${testCreature.perception}`);  // Should be 2
console.log(`Dexterity: ${testCreature.dexterity}`);    // Should be 3
```

### 2. Apply Stunned Status Effect

```typescript
// Apply stunned status effect
CommonStatusEffects.stunned(testCreature, 2); // 2 turn duration

console.log("\nAfter applying stunned status effect:");
console.log(`Movement: ${testCreature.movement}`);      // Should be 3 (4 - 1)
console.log(`Combat: ${testCreature.combat}`);          // Should be 2 (3 - 1)
console.log(`Ranged: ${testCreature.ranged}`);          // Should be 1 (2 - 1)
console.log(`Strength: ${testCreature.strength}`);      // Should be 3 (4 - 1)
console.log(`Agility: ${testCreature.agility}`);        // Should be 2 (3 - 1)
console.log(`Courage: ${testCreature.courage}`);        // Should be 1 (2 - 1)
console.log(`Intelligence: ${testCreature.intelligence}`); // Should be 0 (1 - 1)
console.log(`Perception: ${testCreature.perception}`);  // Should be 1 (2 - 1)
console.log(`Dexterity: ${testCreature.dexterity}`);    // Should be 2 (3 - 1)
```

### 3. Check Status Effects Display

```typescript
// Get active status effects
const activeEffects = testCreature.getActiveStatusEffects();
console.log("\nActive status effects:");
activeEffects.forEach(effect => {
  console.log(`${effect.name}: ${effect.description}`);
  if (effect.attributeModifiers) {
    console.log("Attribute modifiers:");
    Object.entries(effect.attributeModifiers).forEach(([attr, value]) => {
      console.log(`  ${attr}: ${value > 0 ? '+' : ''}${value}`);
    });
  }
});
```

### 4. Test Stun Recovery

```typescript
// Simulate turn start processing to test stun recovery
console.log("\nTesting stun recovery at turn start...");

// Get the stunned effect
const stunnedEffect = testCreature.getStatusEffectManager().getEffect('stunned');
if (stunnedEffect && stunnedEffect.onTurnStart) {
  // Trigger the onTurnStart callback (this would normally happen automatically)
  stunnedEffect.onTurnStart(testCreature);
  
  // Check if the effect was removed
  const remainingEffects = testCreature.getActiveStatusEffects();
  const stillStunned = remainingEffects.some(effect => effect.type === 'stunned');
  
  if (stillStunned) {
    console.log("Stun effect remains - recovery roll failed (1-3 on d6)");
    console.log(`Movement: ${testCreature.movement}`);      // Should still be 3
  } else {
    console.log("Stun effect removed - recovery roll succeeded (4-6 on d6)");
    console.log(`Movement: ${testCreature.movement}`);      // Should be back to 4
  }
} else {
  console.log("No stunned effect found or no onTurnStart callback");
}
```

## Expected Behavior

### Before Stunned Effect:
- **Movement**: 4
- **Combat**: 3
- **Ranged**: 2
- **Strength**: 4
- **Agility**: 3
- **Courage**: 2
- **Intelligence**: 1
- **Perception**: 2
- **Dexterity**: 3

### After Stunned Effect:
- **Movement**: 3 (-1)
- **Combat**: 2 (-1)
- **Ranged**: 1 (-1)
- **Strength**: 3 (-1)
- **Agility**: 2 (-1)
- **Courage**: 1 (-1)
- **Intelligence**: 0 (-1)
- **Perception**: 1 (-1)
- **Dexterity**: 2 (-1)

### Stun Recovery:
- **Automatic Recovery**: At the start of each turn, the creature rolls a d6
- **Recovery Threshold**: On a roll of 4 or higher, the stun effect is automatically removed
- **Recovery Chance**: 50% chance of recovery each turn (4, 5, or 6 on d6)
- **No Manual Action Required**: Recovery happens automatically during turn processing

## How It Works

The stunned status effect now properly applies attribute modifiers and includes automatic recovery through the following flow:

1. **Status Effect Creation**: `CommonStatusEffects.stunned()` creates a status effect with `attributeModifiers` for all attributes and an `onTurnStart` callback
2. **Effect Storage**: The effect is stored in the creature's `StatusEffectManager`
3. **Attribute Calculation**: When accessing creature attributes (e.g., `creature.strength`), the getter calls `getEffectiveStrength()`
4. **Status Effect Integration**: `getEffectiveStrength()` calls `SkillProcessor.getEffectiveAttribute()` with status effects
5. **Modifier Application**: The processor applies all status effect modifiers to the base attribute value
6. **Turn Start Processing**: At the beginning of each turn, the `onTurnStart` callback is triggered
7. **Recovery Roll**: The callback rolls a d6 and removes the stun effect on a roll of 4+

## Key Changes Made

1. **Updated `SkillProcessor.getEffectiveAttribute()`**: Now accepts and applies status effect modifiers
2. **Modified `CreatureCombatManager`**: All effective attribute methods now accept status effects parameter
3. **Updated Creature Base Class**: Attribute getters now pass status effects to combat manager
4. **Fixed Interface**: Updated `ICreatureCombatManager` to match implementation
5. **Enhanced Stun Effect**: Added `onTurnStart` callback for automatic recovery on d6 roll of 4+
6. **Turn Processing Integration**: Stun recovery is automatically processed during turn start phase

## Testing in the Game

To test this in the actual game:

1. **Apply Stunned Effect**: Use the status effects UI to apply stunned to a creature
2. **Check Attributes**: View the creature's stats panel to see reduced attributes
3. **Verify Movement**: The creature should have reduced movement points
4. **Check Combat**: Combat rolls should be affected by the reduced attributes
5. **Test Recovery**: Advance turns to see automatic stun recovery on d6 roll of 4+
6. **Verify Removal**: Confirm the stun effect disappears when recovery succeeds

The stunned status effect now properly represents a creature that is temporarily incapacitated and unable to perform at their normal level across all attributes, with a chance to recover at the start of each turn.
