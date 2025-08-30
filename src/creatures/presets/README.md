# Monster Preset Weapon Loadouts

This system allows monster presets to have different weapon configurations, providing variety in combat encounters. Loadouts are now centralized and reusable across different monster types.

## Overview

Monster presets now support multiple weapon loadouts, each with different equipment, inventory, and AI behavior. The key improvement is that **loadouts are predefined and reusable** - the same loadout can be used by different monster types, making the system more maintainable and flexible.

## Centralized Loadout System

All weapon loadouts are defined in `src/creatures/presets/loadouts.ts` and can be reused across different monster presets. This means:

- **Consistency**: Same loadout always has the same equipment and behavior
- **Maintainability**: Changes to a loadout affect all monsters using it
- **Reusability**: Different monster types can share the same fighting styles
- **Scalability**: Easy to add new loadouts without duplicating code

## Available Loadouts

### Light Melee
- **light_melee_dagger**: Dagger + leather armor
- **light_melee_scimitar**: Scimitar + leather armor  
- **light_melee_defensive**: Dagger + buckler shield + leather armor

### Medium Melee
- **medium_melee_sword**: Broadsword + leather armor
- **medium_melee_sword_shield**: Broadsword + shield + leather armor

### Heavy Melee
- **heavy_melee_twohanded**: Battleaxe + chain mail
- **heavy_melee_commander**: Broadsword + chain mail

### Ranged
- **ranged_archer**: Longbow + leather armor
- **ranged_crossbow**: Crossbow + leather armor
- **ranged_skirmisher**: Dagger + leather armor (melee variant)

### Specialized
- **specialized_berserker**: Battleaxe + chain mail
- **specialized_tactician**: Broadsword + shield + chain mail

### Unarmed
- **unarmed_light**: Leather armor only
- **unarmed_heavy**: Chain mail only

## Usage

### Creating Monsters with Specific Loadouts

```typescript
import { createMonster } from './factories';

// Create a bandit with aggressive loadout (scimitar)
const aggressiveBandit = createMonster("bandit", { 
  x: 10, y: 5, loadout: "aggressive" 
});

// Create a skeleton with the same aggressive loadout
const aggressiveSkeleton = createMonster("skeleton", { 
  x: 15, y: 8, loadout: "aggressive" 
});

// Both monsters now use the same "light_melee_scimitar" loadout
```

### Loadout Mapping in Monster Presets

Each monster preset maps friendly names to centralized loadout IDs:

```typescript
bandit: {
  // ... other properties ...
  weaponLoadouts: {
    standard: "light_melee_dagger",      // Maps to centralized loadout
    aggressive: "light_melee_scimitar",  // Maps to centralized loadout
    defensive: "light_melee_defensive",  // Maps to centralized loadout
  },
  defaultLoadout: "light_melee_dagger",
}
```

### Available Monster Types and Their Loadouts

#### Bandits
- **bandit**: standard, aggressive, defensive
- **bandit_archer**: archer, crossbowman, skirmisher  
- **bandit_leader**: commander, berserker, tactician

#### Undead
- **skeleton**: basic, aggressive, defensive
- **skeleton_archer**: archer, crossbowman, skirmisher
- **skeleton_warrior**: warrior, berserker, tactician

## Loadout Categories

Loadouts are organized into categories for easy selection:

```typescript
import { LOADOUT_CATEGORIES, getLoadoutsByCategory, getRandomLoadoutFromCategory } from './loadouts';

// Get all light melee loadouts
const lightMeleeLoadouts = getLoadoutsByCategory('LIGHT_MELEE');

// Get a random loadout from the ranged category
const randomRangedLoadout = getRandomLoadoutFromCategory('RANGED');
```

## Benefits

1. **Variety**: Same monster type can have different fighting styles
2. **Tactical Depth**: Different loadouts require different strategies
3. **Replayability**: Encounters feel different each time
4. **Easy Configuration**: Simple loadout parameter in monster creation
5. **AI Adaptation**: AI behavior can change based on equipment
6. **Reusability**: Loadouts can be shared between different monster types
7. **Maintainability**: Centralized loadout definitions are easier to manage
8. **Consistency**: Same loadout always behaves the same way

## Adding New Loadouts

### 1. Add to Centralized Loadouts

```typescript
// In src/creatures/presets/loadouts.ts
export const WEAPON_LOADOUTS: Record<string, WeaponLoadout> = {
  // ... existing loadouts ...
  new_loadout: {
    name: "New Loadout Name",
    description: "Description of this loadout",
    equipment: {
      mainHand: { type: "weapon", preset: "weaponName" },
      // ... other equipment
    },
    inventory: [
      // ... inventory items
    ],
    aiBehavior: AIBehaviorType.MELEE, // optional override
  },
};
```

### 2. Add to Loadout Categories

```typescript
export const LOADOUT_CATEGORIES = {
  // ... existing categories ...
  NEW_CATEGORY: ['new_loadout', 'other_new_loadout'],
} as const;
```

### 3. Use in Monster Presets

```typescript
// In any monster preset
weaponLoadouts: {
  // ... existing loadouts ...
  newVariant: "new_loadout", // Reference the centralized loadout
}
```

## Example: Loadout Reusability

The same `light_melee_scimitar` loadout is used by:

- **Bandit** (aggressive variant)
- **Skeleton** (aggressive variant)

This means both monster types will have identical equipment and AI behavior when using the aggressive loadout, but maintain their unique base attributes, vitality, and other characteristics.

## Backward Compatibility

The system is fully backward compatible:
- Existing code continues to work
- Monsters without specified loadouts use their default configuration
- The `loadout` parameter is optional
