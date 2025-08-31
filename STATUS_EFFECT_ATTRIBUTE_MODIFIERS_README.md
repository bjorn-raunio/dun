# Status Effect Attribute Modifiers Implementation

## Overview

Status effects now properly apply modifiers to all creature attributes, including movement, combat, strength, agility, courage, intelligence, perception, and dexterity. This creates a more realistic and impactful status effect system where creatures are truly weakened when affected by conditions like poison, wounds, or stun.

## Implementation Details

### 1. Modified Base Creature Class

The `Creature` class in `src/creatures/base.ts` now has attribute getters that automatically apply status effect modifiers:

```typescript
// Before: Raw attribute values
get movement(): number { 
  return this.attributes.movement;
}

// After: Effective attribute values with status effect modifiers
get movement(): number { 
  return this.getEffectiveAttribute('movement');
}
```

### 2. New getEffectiveAttribute Method

A private method was added to calculate effective attribute values:

```typescript
private getEffectiveAttribute(attributeName: keyof Attributes): number {
  return SkillProcessor.getEffectiveAttribute(
    this.attributes[attributeName] ?? 0,
    attributeName,
    this.skills,
    this.isWounded(),
    this.getActiveStatusEffects()
  );
}
```

### 3. SkillProcessor Integration

The existing `SkillProcessor.getEffectiveAttribute` method already handled status effect modifiers, so we leveraged that existing functionality:

```typescript
static getEffectiveAttribute(
  baseValue: number,
  attributeName: keyof Attributes,
  skills: Skills,
  isWounded: boolean = false,
  statusEffects: any[] = []
): number {
  let effectiveValue = baseValue;
  
  // Apply skill modifiers
  const modifiers = this.getAttributeModifiers(attributeName, skills);
  for (const modifier of modifiers) {
    effectiveValue += modifier.value;
  }
  
  // Apply status effect modifiers
  for (const effect of statusEffects) {
    if (effect.attributeModifiers && effect.attributeModifiers[attributeName]) {
      effectiveValue += effect.attributeModifiers[attributeName];
    }
  }
  
  // Apply wounding penalty
  if (isWounded) {
    effectiveValue = Math.max(1, effectiveValue - 1);
  }
  
  return effectiveValue;
}
```

## Status Effects with Attribute Modifiers

### Standard Status Effects

All standard status effects now apply -1 to all attributes:

- **Poison**: -1 to all attributes
- **Wounded**: -1 to all attributes  
- **Stunned**: -1 to all attributes
- **Knocked Down**: -1 to all attributes + movement/action penalties

### Example Usage

```typescript
// Create a wounded status effect
const woundedEffect = CommonStatusEffects.wounded(creature);
creature.addStatusEffect(woundedEffect);

// All attribute getters now return modified values
console.log(creature.movement);    // 4 (was 5)
console.log(creature.combat);      // 3 (was 4)
console.log(creature.strength);    // 5 (was 6)
console.log(creature.agility);     // 4 (was 5)
```

## Benefits

1. **Realistic Gameplay**: Status effects now have meaningful impact on all creature capabilities
2. **Consistent System**: All attributes are affected uniformly by status effects
3. **Stacking Effects**: Multiple status effects stack properly
4. **Backward Compatible**: Existing code continues to work, but now gets modified values
5. **Performance**: Modifiers are calculated on-demand when attributes are accessed

## Testing

The implementation is thoroughly tested in `src/creatures/skillProcessor.test.ts` with test cases covering:

- Basic attribute modifier application
- Multiple status effect stacking
- Wounding penalty integration
- Optional attribute handling
- Combined effects

## Future Enhancements

1. **Attribute-Specific Modifiers**: Some status effects could affect only specific attributes
2. **Temporary vs Permanent**: Distinguish between temporary and permanent attribute changes
3. **Resistance System**: Creatures could have resistance to certain status effects
4. **Healing Effects**: Positive status effects that boost attributes

## Files Modified

- `src/creatures/base.ts` - Added getEffectiveAttribute method and updated attribute getters
- `src/creatures/skillProcessor.ts` - Already supported status effect modifiers
- `src/creatures/types.ts` - Already defined attributeModifiers in StatusEffect interface
- `src/creatures/presets/statusEffectPresets.ts` - Already defined attribute modifiers for status effects

## Conclusion

Status effect attribute modifiers are now fully implemented and working. Creatures will experience meaningful reductions in all their capabilities when affected by status effects, making the game more strategic and realistic. The system is designed to be extensible for future status effects and maintains full backward compatibility.
