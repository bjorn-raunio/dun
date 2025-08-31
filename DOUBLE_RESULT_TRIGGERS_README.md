# Double Result Combat Skill Triggers

This document describes the new double result combat skill trigger system that allows skills to activate when a creature rolls doubles (e.g., 2&2, 3&3, 4&4, etc.) during combat.

## Overview

The double result trigger system detects when both dice in a combat roll show the same number and triggers appropriate skills. This adds a new layer of tactical depth to combat, where lucky rolls can activate powerful abilities.

## How It Works

### 1. Trigger Detection

The system provides helper functions to detect double results:

```typescript
import { isDoubleResult, getDoubleResultValue } from '../creatures/combatSkillTriggers';

// Check if rolls are doubles
if (isDoubleResult(roll1, roll2)) {
  const doubleValue = getDoubleResultValue(roll1, roll2); // e.g., 2 for 2&2
  // Process double result triggers
}
```

### 2. Trigger Processing

To process double result triggers during combat:

```typescript
import { CombatSkillTriggerManager } from '../creatures/combatSkillTriggers';

// Call this when doubles are detected
CombatSkillTriggerManager.processDoubleResultTriggers(
  attacker, 
  target, 
  combatResult, 
  roll1, 
  roll2
);
```

### 3. Skill Definition

Skills can now include double result triggers:

```typescript
const mySkill: Skill = {
  name: "Double Strike",
  type: "combat",
  description: "Stuns target when rolling doubles",
  combatTriggers: [
    CombatTriggerEffects.applyStatusEffectOnDoubleResult(
      'stunned', 
      1, 
      'Double Strike stuns the target!'
    )
  ]
};
```

## Available Effects

### Status Effect Effects

- **`applyStatusEffectOnDoubleResult`**: Apply status effects to the target
  - `stunned`: Target cannot take actions
  - `weakened`: Target has reduced combat effectiveness

### Combat Bonus Effects

- **`gainCombatBonusOnDoubleResult`**: Attacker gains temporary combat bonuses
- **`dealBonusDamageOnDoubleResult`**: Deal additional damage (framework for future implementation)

## Example Skills

### Dirty Fighter
- **Effect**: Stuns target for 1 turn when rolling doubles
- **Trigger**: `onDoubleResult`

### Lucky Strike
- **Effect**: Gains +2 combat bonus for 2 turns when rolling doubles
- **Trigger**: `onDoubleResult`

### Weakening Blow
- **Effect**: Weakens target for 2 turns when rolling doubles
- **Trigger**: `onDoubleResult`

## Integration with Combat System

The combat system should call `processDoubleResultTriggers` whenever doubles are detected in combat rolls. This typically happens in the to-hit calculation phase.

### Example Integration

```typescript
// In your combat system
if (isDoubleResult(attackerRoll1, attackerRoll2)) {
  CombatSkillTriggerManager.processDoubleResultTriggers(
    attacker,
    target,
    combatResult,
    attackerRoll1,
    attackerRoll2
  );
}
```

## Benefits

1. **Tactical Depth**: Adds strategic considerations for skills that trigger on doubles
2. **Lucky Moments**: Rewards players for fortunate dice rolls
3. **Skill Variety**: Provides new ways to design combat abilities
4. **Consistent Framework**: Uses the existing combat trigger system

## Future Enhancements

- **Double Value Specificity**: Skills could trigger only on specific double values (e.g., only on 6&6)
- **Stacking Effects**: Multiple double result skills could stack or interact
- **Visual Feedback**: UI indicators when doubles are rolled
- **Sound Effects**: Audio cues for double result triggers

## Testing

To test the system:

1. Create a creature with double result skills
2. Simulate combat rolls with doubles
3. Verify that skills trigger appropriately
4. Check that status effects are applied correctly

## See Also

- [Combat Skill Triggers](../src/creatures/combatSkillTriggers.ts)
- [Skill Presets](../src/creatures/presets/skills.ts)
- [Combat Types](../src/utils/combat/types.ts)
