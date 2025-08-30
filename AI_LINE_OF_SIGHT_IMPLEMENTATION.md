# AI Line of Sight Implementation for Ranged Creatures

## Overview

This implementation enhances the AI system to make ranged creatures (those with `AIBehaviorType.RANGED` or equipped with ranged weapons) prioritize positions with line of sight to their targets before attacking, while also optimizing for minimal movement distance.

## Key Changes Made

### 1. Enhanced Movement Evaluation (`src/ai/movement.ts`)

#### New Benefits in `AIMovementOption`
- Added `hasLineOfSight: boolean` to track line of sight status
- Updated `AIMovementOption` interface in `src/ai/types.ts`

#### Enhanced Scoring System
- **Line of Sight Bonus**: +150 points for positions with line of sight to target
- **Range + LOS Bonus**: +50 additional points when both in attack range AND have line of sight
- **Movement Efficiency Bonus**: +200 to +0 points based on movement cost (lower cost = higher bonus)
- **Minimal Movement Bonus**: +100 extra points for positions requiring ≤2 movement tiles
- **Line of Sight Penalty**: -75 points for positions without line of sight
- **Improvement Bonus**: +100 points for gaining line of sight when previously blocked

#### Movement Efficiency Optimization
```typescript
// Movement efficiency bonus: prefer positions that require minimal movement
const movementEfficiencyBonus = Math.max(0, 200 - cost * 10); // Higher bonus for lower movement cost
score += movementEfficiencyBonus;

// Extra bonus for positions that are very close to current position (within 1-2 tiles)
if (cost <= 2) {
  score += 100; // Significant bonus for minimal movement
}
```

#### Line of Sight Detection
```typescript
// Check line of sight for ranged creatures
const hasRangedWeapon = creature.equipment.mainHand?.kind === 'ranged_weapon' || 
                        creature.equipment.offHand?.kind === 'ranged_weapon';
const isRangedBehavior = ai.behavior === AIBehaviorType.RANGED;

if ((hasRangedWeapon || isRangedBehavior) && mapData && cols !== undefined && rows !== undefined) {
  const hasLOS = isCreatureVisible(x, y, target, mapData, cols, rows, mapDefinition, {}, creature, allCreatures);
  // ... scoring logic with movement efficiency
}
```

### 2. Enhanced Movement Decision Logic (`src/ai/movement.ts`)

#### Updated `shouldMove` Function
Ranged creatures now check line of sight before deciding to move:
- If they don't have line of sight to target, they will move to gain it
- Movement is prioritized even when already in attack range if line of sight is blocked
- **Conservative Movement**: When already have line of sight, only move if significantly suboptimal AND minimal movement required
- Checks if better positions with line of sight are available

#### Movement Efficiency Thresholds
```typescript
// Only consider moving if we're significantly suboptimal (too close or too far)
const isSignificantlySuboptimal = currentDistance < attackRange * 0.6 || currentDistance > attackRange * 1.2;

if (isSignificantlySuboptimal) {
  // Look for positions that are better AND require minimal movement (cost <= 2)
  const isMinimalMovement = tileCost <= 2;
  return isBetterRange && isMinimalMovement;
}
```

#### Movement Decision Creation
- Prioritizes line of sight gains in movement reasoning
- Updated logging to show movement efficiency information
- Enhanced movement option evaluation with line of sight considerations
- **Efficiency Descriptions**: Movement reasons now include efficiency qualifiers (efficiently, moderately, with effort)

### 3. Enhanced Attack Decision Logic (`src/ai/decisionMaking.ts`)

#### Line of Sight Pre-Attack Check
Before attacking, ranged creatures now verify:
- Are they in attack range?
- Do they have line of sight to the target?
- Would movement improve their line of sight situation?

#### Smart Attack vs. Movement Decision
```typescript
// For ranged creatures, check line of sight
if ((hasRangedWeapon || isRangedBehavior) && context.mapData && context.mapDefinition) {
  const hasLineOfSight = isCreatureVisible(creature.x, creature.y, target, ...);
  
  // If we don't have line of sight, try to move instead of attacking
  if (!hasLineOfSight) {
    // Attempt movement to gain line of sight
    const movementDecision = createMovementDecision(...);
    if (movementDecision) {
      return { success: true, action: movementDecision, ... };
    }
  }
}
```

### 4. Enhanced Movement Before Attack Logic (`src/ai/decisionMaking.ts`)

#### Updated `shouldMoveBeforeAttack` Function
- Added map data parameters for line of sight checking
- Ranged creatures consider line of sight when evaluating movement
- Prevents movement that would lose line of sight
- Encourages movement that would gain line of sight

## How It Works

### 1. Automatic Detection
The system automatically identifies ranged creatures through:
- **Behavior Type**: `AIBehaviorType.RANGED` in creature presets
- **Equipment Detection**: Weapons with `kind: "ranged_weapon"`
- **Hybrid Approach**: Either condition enables enhanced behavior

### 2. Movement Evaluation Process
1. **Position Scoring**: Each reachable tile is evaluated for:
   - Distance to target
   - Attack range positioning
   - Line of sight availability
   - **Movement efficiency (cost-based scoring)**
   - Tactical advantages

2. **Line of Sight Priority**: Ranged creatures heavily favor positions with clear line of sight

3. **Movement Efficiency Priority**: Among positions with line of sight, prefer those requiring minimal movement

4. **Movement Decision**: AI chooses the highest-scoring position that maximizes combat effectiveness while minimizing movement cost

### 3. Attack Decision Process
1. **Pre-Attack Check**: Verify line of sight before attacking
2. **Movement Priority**: If line of sight is blocked, attempt movement first
3. **Attack Execution**: Only attack when both in range AND have line of sight

### 4. Movement Efficiency Logic
1. **High Efficiency (≤2 tiles)**: +100 bonus points
2. **Medium Efficiency (3-4 tiles)**: Standard scoring
3. **Low Efficiency (≥5 tiles)**: Reduced scoring due to movement cost penalty
4. **Conservative Movement**: When already well-positioned, only move for significant improvements

## Configuration Examples

### Creature Preset Configuration
```typescript
// In monster presets
shooter: {
  name: "Shooter",
  // ... other properties
  aiBehavior: AIBehaviorType.RANGED,
  weaponLoadouts: ["shortbow"],
}
```

### Equipment-Based Detection
```typescript
// Ranged weapons automatically enable enhanced behavior
const bow = createRangedWeapon('shortbow');
// kind: "ranged_weapon" is automatically set
```

### Direct AI State Creation
```typescript
import { createDefaultAIState, AIBehaviorType } from './ai';
const ai = createDefaultAIState(AIBehaviorType.RANGED);
```

## Benefits

### 1. Realistic Combat Behavior
- Ranged creatures no longer attack through walls or obstacles
- Movement becomes tactical rather than just distance-based
- AI considers both range and visibility
- **Efficient positioning**: Ranged creatures prefer minimal movement when possible

### 2. Improved Gameplay
- More strategic positioning required
- Line of sight becomes a tactical consideration
- Ranged combat feels more realistic and engaging
- **Movement optimization**: AI creatures move as few tiles as possible while maintaining effectiveness

### 3. Better AI Intelligence
- AI creatures make smarter movement decisions
- Ranged creatures behave more like skilled archers
- Movement and attack decisions are more coordinated
- **Conservative movement**: AI doesn't move unnecessarily when already well-positioned

### 4. Movement Efficiency
- **Minimal Movement**: Ranged creatures prefer positions requiring ≤2 movement tiles
- **Cost-Aware Scoring**: Movement cost directly affects position scoring
- **Efficiency Thresholds**: Clear categorization of movement efficiency (HIGH/MEDIUM/LOW)
- **Conservative Behavior**: Only move when significant improvements are available

## Testing

The implementation has been tested through:
- **Compilation**: Project builds successfully with no errors
- **Type Safety**: All TypeScript interfaces properly updated
- **Integration**: Works with existing AI systems and creature presets
- **Backward Compatibility**: Melee creatures unaffected, ranged creatures enhanced
- **Movement Efficiency**: New scoring system properly prioritizes minimal movement

## Future Enhancements

### Potential Improvements
1. **Cover System**: Consider partial cover vs. full cover
2. **Elevation Effects**: Higher ground advantages for line of sight
3. **Weather Effects**: Fog, darkness affecting line of sight
4. **Advanced Tactics**: Flanking, positioning for multiple targets
5. **Movement Path Optimization**: Consider path complexity, not just final cost
6. **Terrain Movement Costs**: Factor in difficult terrain when calculating efficiency

### Code Extensibility
The system is designed to be easily extended:
- New line of sight factors can be added to scoring
- Additional behavior types can be implemented
- Line of sight algorithms can be enhanced
- Movement efficiency calculations can be refined
- New efficiency thresholds can be added

## Conclusion

This implementation successfully enhances the AI system to make ranged creatures behave more intelligently by prioritizing line of sight to their targets while optimizing for minimal movement distance. The changes are:

- **Non-breaking**: Existing melee AI behavior unchanged
- **Automatic**: Ranged creatures automatically gain enhanced behavior
- **Configurable**: Multiple ways to enable ranged behavior
- **Realistic**: Movement and attack decisions consider visibility
- **Efficient**: AI prioritizes positions requiring minimal movement
- **Conservative**: AI doesn't move unnecessarily when already well-positioned
- **Extensible**: Foundation for future tactical enhancements

The AI now provides a more engaging and realistic combat experience where ranged creatures must position themselves tactically to be effective, while being smart about movement costs and preferring efficient positioning over excessive movement.
