# AI System

The AI system controls the behavior of non-player creatures in the game, providing intelligent decision-making for movement, combat, and tactical positioning.

## Core Components

### Behavior Types

- **MELEE**: Close combat focused, aggressive melee attacks
- **RANGED**: Prefer ranged attacks, maintain distance, prioritize line of sight and movement efficiency
- **ANIMAL**: Instinctive behavior, pack tactics, territorial

### Decision Making

The AI makes decisions based on:
1. **Target Selection**: Choosing the most appropriate enemy to engage
2. **Movement**: Positioning for optimal combat effectiveness with minimal movement cost
3. **Combat**: Attacking when in range and conditions are favorable
4. **Tactical Positioning**: Considering terrain, line of sight, and strategic advantages

## Enhanced Ranged Behavior

### Line of Sight Prioritization

Ranged creatures (those with `AIBehaviorType.RANGED` or equipped with ranged weapons) now prioritize positions with line of sight to their targets:

- **High Priority**: Positions that provide line of sight to targets (score +150)
- **Bonus**: Additional points (+50) when both in attack range AND have line of sight
- **Penalty**: Negative points (-75) for positions without line of sight
- **Improvement Bonus**: Extra points (+100) for gaining line of sight when previously blocked

### Movement Efficiency Optimization

Ranged creatures now also prioritize **minimal movement** when positioning:

- **Movement Efficiency Bonus**: +200 to +0 points based on movement cost (lower cost = higher bonus)
- **Minimal Movement Bonus**: +100 extra points for positions requiring ≤2 movement tiles
- **Conservative Movement**: When already well-positioned with line of sight, only move for significant improvements
- **Efficiency Thresholds**: Clear categorization of movement efficiency (HIGH/MEDIUM/LOW)

### Movement Decisions

Ranged creatures will:
1. **Move to gain line of sight** even if already in attack range
2. **Avoid attacking** when they don't have line of sight to their target
3. **Prioritize positions** that maintain both optimal range and clear line of sight
4. **Consider tactical positioning** to avoid losing line of sight during movement
5. **Prefer minimal movement** when multiple positions offer similar tactical benefits
6. **Be conservative** about movement when already well-positioned

### Attack Logic

Before attacking, ranged creatures check:
- Are they in attack range?
- Do they have line of sight to the target?
- Would movement improve their line of sight situation?
- Is the movement cost justified by the tactical improvement?

If line of sight is blocked, ranged creatures will attempt to move to a better position rather than attacking ineffectively.

## Scoring System

Movement options are scored based on:

- **Distance to target**: Getting closer (+100 per tile improvement)
- **Attack range**: Being in attack range (+100)
- **Line of sight**: Having clear line of sight (+150 for ranged creatures)
- **Movement efficiency**: Preferring minimal movement (+200 to +0 based on cost)
- **Minimal movement bonus**: Extra points for very close positions (+100 for ≤2 tiles)
- **Positional advantages**: Tactical benefits and safety considerations
- **Movement costs**: Penalties for difficult terrain or dead-end positions

### Movement Efficiency Scoring

```typescript
// Movement efficiency bonus: prefer positions that require minimal movement
const movementEfficiencyBonus = Math.max(0, 200 - cost * 10); // Higher bonus for lower movement cost
score += movementEfficiencyBonus;

// Extra bonus for positions that are very close to current position (within 1-2 tiles)
if (cost <= 2) {
  score += 100; // Significant bonus for minimal movement
}
```

## Configuration

AI behavior can be configured through:
- Creature presets with `aiBehavior` property
- Equipment-based detection (ranged weapons automatically enable ranged behavior)
- Individual creature AI state overrides

## Examples

### Ranged Archer Behavior
```typescript
// Archer will move to gain line of sight even if in range
const archerAI = createAIStateForCreature(archer, { aiBehavior: AIBehaviorType.RANGED });
// Archer will prioritize positions with clear line of sight AND minimal movement
// Archer will be conservative about movement when already well-positioned
```

### Melee Fighter Behavior
```typescript
// Melee fighter focuses on getting close and engaging
const fighterAI = createAIStateForCreature(fighter, { aiBehavior: AIBehaviorType.MELEE });
// Fighter will move directly toward targets without line of sight concerns
```

## Movement Efficiency Categories

The AI system categorizes movement efficiency as:

- **HIGH**: ≤2 movement tiles (preferred for ranged creatures)
- **MEDIUM**: 3-4 movement tiles (acceptable when necessary)
- **LOW**: ≥5 movement tiles (avoided unless significant tactical advantage)

## Conservative Movement Logic

When a ranged creature already has line of sight and is reasonably well-positioned:

1. **Only move if significantly suboptimal**: Too close (<60% of optimal range) or too far (>120% of optimal range)
2. **Require minimal movement**: New position must cost ≤2 movement tiles
3. **Maintain line of sight**: New position must not lose line of sight
4. **Improve positioning**: New position must be closer to optimal range

This prevents ranged creatures from making unnecessary movements when they're already effective, while still allowing them to optimize their position when the benefits clearly outweigh the movement cost.
