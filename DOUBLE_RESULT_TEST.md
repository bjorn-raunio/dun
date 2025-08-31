# Double Result Trigger System Test

This document demonstrates how to test the new double result combat skill trigger system.

## Test Setup

### 1. Create a Creature with Double Result Skills

```typescript
import { Creature } from './src/creatures/index';
import { SKILL_PRESETS } from './src/creatures/presets/skills';

// Create a creature with double result skills
const testCreature = new Creature({
  name: "Test Fighter",
  x: 0,
  y: 0,
  attributes: {
    movement: 4,
    combat: 3,
    ranged: 2,
    strength: 4,
    agility: 3,
    courage: 2,
    intelligence: 1
  },
  actions: 2,
  vitality: 20,
  mana: 10,
  fortune: 5,
  size: 1,
  group: "player",
  skills: {
    dirtyFighter: SKILL_PRESETS.dirtyFighter,
    luckyStrike: SKILL_PRESETS.luckyStrike,
    weakeningBlow: SKILL_PRESETS.weakeningBlow
  }
});
```

### 2. Test the Combat System

```typescript
import { executeCombat } from './src/utils/combat/execution';

// Create a target creature
const target = new Creature({
  name: "Target Dummy",
  x: 1,
  y: 0,
  attributes: {
    movement: 3,
    combat: 2,
    ranged: 1,
    strength: 3,
    agility: 2,
    courage: 1,
    intelligence: 1
  },
  actions: 1,
  vitality: 15,
  mana: 5,
  fortune: 3,
  size: 1,
  group: "enemy"
});

// Execute combat
const result = executeCombat(testCreature, target, [testCreature, target]);
console.log(result.message);
```

## Expected Behavior

### When Rolling Doubles (2&2, 3&3, 4&4, 5&5, 6&6):

1. **Dirty Fighter Skill**: Target gets stunned for 1 turn
2. **Lucky Strike Skill**: Attacker gains +2 combat bonus for 2 turns
3. **Weakening Blow Skill**: Target gets weakened for 2 turns

### Console Output:

```
Test Fighter rolled doubles: 3&3
Test Fighter's Dirty Fighter triggered: Stuns target for 1 turn when rolling doubles
Test Fighter's Lucky Strike triggered: Gains +2 combat bonus for 2 turns when rolling doubles
Test Fighter's Weakening Blow triggered: Weakens target for 2 turns when rolling doubles
```

## Testing Different Double Values

### Test 2&2:
- Roll two 2s
- All double result skills should trigger

### Test 3&3:
- Roll two 3s
- All double result skills should trigger

### Test 4&4:
- Roll two 4s
- All double result skills should trigger

### Test 5&5:
- Roll two 5s
- All double result skills should trigger

### Test 6&6:
- Roll two 6s
- This is also a double critical, so both double critical AND double result skills trigger

## Integration Points

The system integrates with:

1. **Combat Execution**: `executeCombatPhase()` processes double result triggers
2. **To-Hit Rolls**: Both melee and ranged combat pass dice results
3. **Skill System**: Skills can define `onDoubleResult` triggers
4. **Status Effects**: Double result skills can apply status effects

## Debugging

If double result triggers aren't working:

1. Check that the creature has skills with `onDoubleResult` triggers
2. Verify that `toHitResult.attackerDice` contains the dice results
3. Ensure `CombatSkillTriggerManager.processDoubleResultFromDice()` is being called
4. Check console logs for double result detection messages

## Future Enhancements

- Add visual indicators when doubles are rolled
- Implement double value specific triggers (e.g., only on 6&6)
- Add sound effects for double results
- Create more sophisticated double result effects
