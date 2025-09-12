# Animation System

This directory contains a comprehensive animation system for the game that provides smooth visual feedback for creature movement, attacks, and spell casting.

## Overview

The animation system consists of several key components:

- **AnimationManager**: Core animation management and timing
- **Animation Types**: Movement, attack, spell casting, damage, healing, status effects, and death
- **Easing Functions**: Smooth animation curves (linear, ease-in, ease-out, bounce, elastic)
- **Animated Components**: React components that render animated creatures and effects
- **Integration Services**: Services to integrate animations with existing game systems

## Key Features

### Movement Animations
- Smooth creature movement between tiles with constant speed
- Distance-based duration (200ms per tile)
- Linear interpolation for consistent movement speed
- Sequential movement through path tiles

### Attack Animations
- Melee attacks with impact effects
- Ranged attacks with projectile trails
- Hit effects at target location
- Configurable timing for hit effects

### Spell Casting Animations
- Visual spell effects based on spell type
- Different effects for fire, ice, healing, etc.
- Spell name display during casting
- Configurable effect timing

### Damage/Healing Animations
- Floating damage numbers with bounce effect
- Healing numbers with upward motion
- Color-coded (red for damage, green for healing)
- Automatic fade-out

### Status Effect Animations
- Visual indicators for status effects
- Configurable duration and effects

### Death Animations
- Fade-out and scale-down effects
- Smooth creature removal

## Usage

### Basic Setup

The animation system is automatically initialized in the game context:

```typescript
import { useGameAnimations } from '../game/GameContext';

function MyComponent() {
  const animations = useGameAnimations();
  
  // Animation functions (no game logic)
  await animations.animateMovement(creatureId, path);
  await animations.animateAttack(attackerId, targetId, 'melee');
  await animations.animateSpellCast(casterId, targetId, spellName);
}
```

### Proper Integration Pattern

The animation services are designed to be **pure animation services** with no game logic. Here's the correct integration pattern:

```typescript
// ✅ CORRECT: Separate game logic from animation
async function handleMovement(creatureId: string, targetX: number, targetY: number) {
  // 1. Execute game logic first
  const creature = creatures.find(c => c.id === creatureId);
  const path = calculatePath(creature, targetX, targetY);
  const moveResult = creature.moveTo(path, allCreatures, mapDefinition);
  
  if (moveResult.status === 'success') {
    // 2. Then animate the result
    await animations.animateMovement(creatureId, path);
    
    // 3. Update UI state
    setCreatures(prev => prev.map(c => c.id === creatureId ? creature : c));
  }
}

// ❌ WRONG: Don't put game logic in animation services
// The animation services should only handle visual effects
```

### Adding Custom Animations

```typescript
import { useGameAnimations } from '../game/GameContext';

function MyComponent() {
  const animations = useGameAnimations();
  
  // Add damage animation
  animations.animateDamage(targetId, 15);
  
  // Add heal animation
  animations.animateHeal(targetId, 10);
  
  // Add status effect animation
  animations.animateStatusEffect(targetId, 'poisoned');
  
  // Add death animation
  animations.animateDeath(creatureId);
}
```

### Animation Configuration

Animations can be configured by modifying the `AnimationConfig` in `AnimationManager.ts`:

```typescript
const config: AnimationConfig = {
  movement: {
    duration: 300, // milliseconds
    easing: 'ease-out'
  },
  attack: {
    duration: 400,
    easing: 'ease-in-out',
    hitDelay: 0.6 // Show hit effect at 60% progress
  },
  // ... other animation types
};
```

## Components

### AnimatedCreatureOverlay
Replaces the standard `CreatureOverlay` to provide animated creature rendering with:
- Smooth movement animations
- Attack scaling and rotation effects
- Spell casting visual feedback
- Death animations

### AnimatedDamageIndicator
Shows floating damage and healing numbers with bounce effects.

### SpellEffectOverlay
Renders spell casting effects with different visuals for different spell types.

### AttackEffectOverlay
Shows attack impact effects and projectile trails.

## Integration

The animation system integrates with existing game systems through:

1. **Game Context**: Animations are available through `useGameAnimations()` hook
2. **Service Classes**: `AnimatedMovementService`, `AnimatedCombatService`, `AnimatedSpellService`
3. **Event System**: Animation events can be listened to for game logic integration

## Performance

The animation system is optimized for performance:
- Uses `requestAnimationFrame` for smooth 60fps animations
- Automatic cleanup of completed animations
- Efficient React component updates
- Minimal DOM manipulation

## Customization

### Adding New Animation Types

1. Add new type to `AnimationType` in `types.ts`
2. Add configuration to `AnimationConfig`
3. Add helper method to `AnimationManager`
4. Create rendering logic in appropriate overlay component

### Custom Easing Functions

Add new easing functions to `easing.ts`:

```typescript
export function customEasing(t: number): number {
  // Your custom easing logic
  return t;
}
```

## Examples

See `AnimationIntegrationExample.ts` for examples of how to integrate animations with existing game handlers.

## Future Enhancements

- Particle effects for spells
- Screen shake for powerful attacks
- Sound integration with animations
- More complex movement patterns
- Animation queuing system
- Performance monitoring
