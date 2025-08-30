# Three-Part Attack System

The combat system has been refactored to use a clear three-part attack resolution with separate functions for each phase:

## Overview

Each attack is now resolved in three distinct phases, each handled by its own function:

1. **To-Hit Roll** - Determines if the attack connects
2. **Block Roll** - Determines if the target can block/parry the attack
3. **Damage Roll** - Determines how much damage is dealt

## Phase 1: To-Hit Roll

### Functions
- `executeToHitRollMelee(attacker, target, mapDefinition)` - Melee combat to-hit resolution
- `executeToHitRollRanged(attacker, target)` - Ranged combat to-hit resolution

### Mechanics
- **Melee Combat**: 2d6 + attacker's combat bonus vs 2d6 + defender's combat bonus
- **Ranged Combat**: 2d6 + attacker's ranged bonus vs target number (typically 10+)
- **Critical Hits**: Any die rolling a 6 provides a critical hit bonus
- **Double Criticals**: Both dice rolling 6 provides automatic hit and bonus damage

### Modifiers
- Back attack bonus (+1 if attacker was behind target at turn start) - applies to both melee and ranged attacks
- Elevation bonus (+1 for higher ground)
- Weapon combat modifiers
- Equipment bonuses

## Phase 2: Block Roll

### Function
- `executeBlockRoll(attacker, target, attackerDoubleCritical, criticalHit)` - Shield blocking resolution

### Mechanics
- **Shield Blocking**: If the target has a shield, they can attempt to block
- **Block Value**: Shield block value determines the difficulty (e.g., 4+ to block)
- **Critical Hit Modifier**: Critical hits make shields harder to use (+1 to block value)
- **Back Attack**: Shields cannot block attacks from behind
- **Double Critical**: Double criticals are unblockable

## Phase 3: Damage Roll

### Functions
- `executeDamageRollMelee(attacker, target, attackerDoubleCritical, criticalHit)` - Melee damage calculation
- `executeDamageRollRanged(attacker, target, attackerDoubleCritical, criticalHit)` - Ranged damage calculation

### Mechanics
- **Melee Damage**: Weapon damage + strength in dice (e.g., 3d6 for sword + strength)
- **Ranged Damage**: Weapon damage only (no strength bonus)
- **Critical Bonus**: Critical hits add +1 damage, double criticals add +2
- **Armor**: Target's armor reduces damage (each die must meet or exceed armor value)

## Implementation Details

### Main Combat Functions
- `executeCombat(attacker, target, allCreatures, mapDefinition)` - Main entry point
- `executeMeleeCombat(attacker, target, allCreatures, mapDefinition)` - Melee combat orchestrator
- `executeRangedCombat(attacker, target, allCreatures)` - Ranged combat orchestrator

### Dice Functions
- `calculateCombatRoll(bonus)` - Returns { total, dice } for all 2d6 + bonus rolls (attack, defense, etc.)
- `calculateDamageRoll(baseDice, strength)` - Returns array of damage dice (use strength=0 for ranged attacks)

### Combat Result Structure
```typescript
interface CombatResult {
  success: boolean;
  message: string;
  damage: number;
  targetDefeated: boolean;
  toHitMessage?: string;    // Phase 1 result
  blockMessage?: string;    // Phase 2 result  
  damageMessage?: string;   // Phase 3 result
}
```

### Message Display
The UI now displays each phase separately:
1. To-hit roll result (always shown)
2. Block attempt result (if applicable)
3. Damage calculation (if attack hits and isn't blocked)

## Benefits

- **Modularity**: Each phase is a separate function that can be tested and modified independently
- **Clarity**: Each phase is clearly separated and explained
- **Transparency**: Players can see exactly what happened at each step
- **Debugging**: Easier to identify issues in specific phases
- **Balance**: Clear separation makes it easier to balance each phase independently
- **Reusability**: Individual phases can be reused in different contexts
- **Maintainability**: Changes to one phase don't affect the others

## Function Flow

```
executeCombat()
├── executeMeleeCombat() / executeRangedCombat()
    ├── executeToHitRollMelee() / executeToHitRollRanged()  // Phase 1
    ├── executeBlockRoll()                                  // Phase 2
    └── executeDamageRollMelee() / executeDamageRollRanged() // Phase 3
```
