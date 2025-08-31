# Combat Skill Trigger System

This system allows skills to automatically trigger during combat based on specific events, such as rolling doubles, critical hits, or successful attacks.

## Overview

The Combat Skill Trigger System enables skills to have dynamic effects that activate during combat without requiring manual activation. Skills can now respond to combat events and apply status effects, heal the attacker, or provide other benefits automatically.

## How It Works

### 1. Combat Triggers

Skills can define `combatTriggers` that specify when and how they activate:

```typescript
{
  name: "Dirty Fighter",
  type: "combat",
  description: "stun on doubles during an attack",
  combatTriggers: [
    CombatTriggerEffects.applyStatusEffect('stunned', 1, "Stuns target for 1 turn when rolling doubles")
  ]
}
```

### 2. Trigger Types

Available trigger types include:

- `onAttackHit` - Triggers when an attack successfully hits
- `onAttackMiss` - Triggers when an attack misses
- `onDoubleCritical` - Triggers when rolling double 6s (12 total)
- `onCriticalHit` - Triggers when rolling any 6 (critical hit)
- `onTargetDefeated` - Triggers when defeating an enemy
- `onBackAttack` - Triggers when attacking from behind
- `onFirstBlood` - Triggers on the first successful attack of combat
- `onLowHealth` - Triggers when health drops below threshold

### 3. Predefined Effects

The system provides reusable effect templates:

#### `CombatTriggerEffects.applyStatusEffect()`
Applies a status effect to the target when a specific trigger occurs.

```typescript
CombatTriggerEffects.applyStatusEffect('stunned', 1, "Stuns target for 1 turn when rolling doubles")
```

#### `CombatTriggerEffects.applyStatusEffectOnCritical()`
Applies a status effect to the target on critical hits.

```typescript
CombatTriggerEffects.applyStatusEffectOnCritical('poison', 3, "Poisons target for 3 turns on critical hits")
```

#### `CombatTriggerEffects.healAttacker()`
Heals the attacker when a trigger occurs.

```typescript
CombatTriggerEffects.healAttacker(2, "Heals 2 HP when successfully hitting a target")
```

#### `CombatTriggerEffects.gainCombatBonus()`
Gives the attacker a temporary combat bonus.

```typescript
CombatTriggerEffects.gainCombatBonus(2, 2, "Gains +2 combat bonus for 2 turns on critical hits")
```

## Example Skills

### Dirty Fighter
- **Trigger**: `onDoubleCritical`
- **Effect**: Stuns target for 1 turn
- **Description**: "Stuns target for 1 turn when rolling doubles"

### Venomous Strike
- **Trigger**: `onCriticalHit`
- **Effect**: Poisons target for 3 turns
- **Description**: "Poisons target for 3 turns on critical hits"

### Vampiric Strike
- **Trigger**: `onAttackHit`
- **Effect**: Heals attacker by 2 HP
- **Description**: "Heals 2 HP when successfully hitting a target"

### Combat Focus
- **Trigger**: `onCriticalHit`
- **Effect**: Gains +2 combat bonus for 2 turns
- **Description**: "Gains +2 combat bonus for 2 turns on critical hits"

## Integration with Combat System

The system automatically integrates with the existing combat execution:

1. **To-Hit Roll Phase**: Triggers `onAttackHit`, `onAttackMiss`, `onCriticalHit`, and `onDoubleCritical`
2. **Damage Phase**: Triggers `onTargetDefeated` if the target is killed

## Creating Custom Skills

To create a custom skill with combat triggers:

1. Define the skill in `src/creatures/presets/skills.ts`
2. Use the predefined effects or create custom ones
3. Specify the trigger type and effect

```typescript
"customSkill": {
  name: "Custom Skill",
  type: "combat",
  description: "Custom combat effect",
  combatTriggers: [
    {
      type: 'onAttackHit',
      effect: (attacker, target, combatResult) => {
        // Custom effect logic
        target.addStatusEffect(/* ... */);
      },
      description: "Custom effect description"
    }
  ]
}
```

## Testing

Use the StatusEffectsDemo component to test combat skill triggers:

- **Test Double Critical Trigger**: Simulates rolling doubles
- **Test Critical Hit Trigger**: Simulates rolling a 6
- **Test Attack Hit Trigger**: Simulates a successful attack

## Benefits

1. **Automatic Activation**: Skills trigger automatically during combat
2. **Reusable Effects**: Predefined effect templates for common actions
3. **Flexible Triggers**: Multiple trigger types for different combat scenarios
4. **Status Effect Integration**: Seamlessly works with the existing status effect system
5. **Easy Extension**: Simple to add new trigger types and effects

## Future Enhancements

Potential additions to the system:

- Conditional triggers based on creature state
- Chain reactions between multiple skills
- Environmental triggers (terrain, weather, etc.)
- Team-based triggers (ally actions, group bonuses)
- Resource-based triggers (mana, fortune costs)
