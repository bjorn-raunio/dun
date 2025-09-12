# Particle System for Spell Effects

This document describes the particle system implementation for spell casting visual effects.

## Overview

The particle system provides dynamic visual effects when spells are cast, with different particle configurations for different spell types. Particles are rendered on top of the game map and provide visual feedback for spell casting.

## Components

### 1. Particle System (`particleSystem.ts`)

- **ParticleManager**: Manages all active particle systems
- **Particle**: Individual particle with position, velocity, life, color, etc.
- **ParticleConfig**: Configuration for particle behavior (count, life, speed, colors, etc.)
- **SPELL_PARTICLE_CONFIGS**: Predefined configurations for different spell types

### 2. Particle Effect Overlay (`ParticleEffectOverlay.tsx`)

- React component that renders all active particles
- Updates particles at 60fps using requestAnimationFrame
- Renders particles as colored circles with glow effects

### 3. Enhanced Spell Service (`AnimatedSpellService.ts`)

- Extended to trigger particle effects when spells are cast
- Automatically determines particle type based on spell name
- Creates particle systems at target locations

## Spell Types and Effects

The system automatically detects spell types based on spell names and applies appropriate particle effects:

### Fire Spells
- **Keywords**: fire, flame, burn
- **Effect**: Orange/red particles with upward movement and gravity
- **Examples**: "Fireball", "Flame Strike"

### Ice Spells
- **Keywords**: ice, frost, freeze
- **Effect**: Blue/white particles with slower movement
- **Examples**: "Ice Bolt", "Frost Nova"

### Healing Spells
- **Keywords**: heal, cure, restore
- **Effect**: Green particles with upward movement (anti-gravity)
- **Examples**: "Heal", "Cure Wounds"

### Lightning Spells
- **Keywords**: lightning, shock, bolt
- **Effect**: Yellow/white particles with fast, erratic movement
- **Examples**: "Lightning Bolt", "Chain Lightning"

### Poison Spells
- **Keywords**: poison, venom, toxin
- **Effect**: Green particles with slow, spreading movement
- **Examples**: "Poison Cloud", "Venom Strike"

### Generic Magic
- **Default**: Purple/magenta particles for any spell not matching above categories
- **Examples**: "Magic Missile", "Teleport"

## Integration Points

### 1. Spell Casting Handlers
- **Mouse Handlers**: Trigger particle effects when spells are cast via targeting mode
- **Spell Panel**: Trigger particle effects for self-target spells

### 2. Animation System
- Particles are integrated with the existing animation system
- Particle effects run alongside spell casting animations
- Particles are rendered in a separate overlay layer

### 3. Game Context
- Animation services are available through `useGameAnimations()` hook
- Particle effects are automatically triggered when `animateSpellCast()` is called

## Usage

### Automatic Usage
Particle effects are automatically triggered when:
1. A player casts a spell on a target (via targeting mode)
2. A player casts a self-target spell (via spell panel)
3. AI creatures cast spells (if integrated)

### Manual Usage
```typescript
import { particleManager, SPELL_PARTICLE_CONFIGS } from '../animations/particleSystem';

// Create a custom particle effect
const systemId = particleManager.createParticleSystem(
  'custom_effect',
  x, y, // pixel coordinates
  SPELL_PARTICLE_CONFIGS.fire,
  1500 // duration in ms
);
```

## Configuration

### Particle Properties
- **count**: Number of particles to create
- **life**: How long particles live (in milliseconds)
- **size**: Min/max particle size
- **speed**: Min/max particle velocity
- **direction**: Direction range (in radians)
- **color**: Single color or array of colors
- **opacity**: Min/max opacity values
- **gravity**: Gravity effect (positive = down, negative = up)
- **friction**: Velocity damping factor
- **rotationSpeed**: How fast particles rotate
- **scaleSpeed**: How fast particles scale
- **spread**: How much particles spread from center

### Customizing Effects
To add new spell types or modify existing ones, update the `SPELL_PARTICLE_CONFIGS` object in `particleSystem.ts`:

```typescript
export const SPELL_PARTICLE_CONFIGS: Record<string, ParticleConfig> = {
  // Add new spell type
  earth: {
    count: 10,
    life: 1000,
    size: { min: 3, max: 6 },
    speed: { min: 10, max: 30 },
    direction: { min: 0, max: Math.PI * 2 },
    color: ['#8B4513', '#A0522D', '#D2691E'],
    opacity: { min: 0.7, max: 1.0 },
    gravity: 0.15,
    friction: 0.95,
    spread: 5
  }
};
```

## Performance Considerations

- Particles are automatically cleaned up when they expire
- Particle systems are removed when all particles die
- Animation loop runs at 60fps with efficient updates
- Particles use CSS transforms for smooth rendering
- No memory leaks - all particles are properly disposed

## Future Enhancements

- Particle trails for moving effects
- Particle collision detection
- Sound integration with particle effects
- More complex particle behaviors (attraction, repulsion)
- Particle texture support
- Performance monitoring and optimization
