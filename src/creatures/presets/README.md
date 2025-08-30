# Monster Preset Loadout System

This system allows monster presets to have different weapon and armor configurations, providing variety in combat encounters. Loadouts are now centralized and reusable across different monster types.

## Overview

Monster presets now support **separate weapon and armor loadouts** that can be mixed and matched independently. This provides maximum variety - for example, a monster can use a "broadsword" weapon loadout combined with "leather_buckler" armor loadout, or mix and match any combination.

**Key Benefits:**
- **Modular Design**: Weapon and armor loadouts are completely separate
- **Maximum Variety**: Any weapon loadout can be combined with any armor loadout
- **Reusable Components**: Same loadouts can be used across different monster types
- **Easy Maintenance**: Changes to a loadout affect all monsters using it

## Centralized Loadout System

All weapon loadouts are defined in `src/creatures/presets/loadouts.ts` and can be reused across different monster presets. This means:

- **Consistency**: Same loadout always has the same equipment and behavior
- **Maintainability**: Changes to a loadout affect all monsters using it
- **Reusability**: Different monster types can share the same fighting styles
- **Scalability**: Easy to add new loadouts without duplicating code

## Available Loadouts

### Weapon Loadouts
- **dagger**: Light melee fighter with dagger
- **broadsword**: Medium melee fighter with sword
- **greatsword**: Heavy two-handed sword fighter
- **ranged_archer**: Ranged fighter with longbow
- **sword_shield**: Defensive fighter with sword and shield
- **dual_dagger**: Fast dual-wielding fighter
- **invalid_greatsword_shield**: Testing loadout for equipment validation

### Armor Loadouts
- **leather**: Light leather armor for mobility
- **chain_mail**: Medium chain mail armor for balance
- **plate_mail**: Heavy plate mail armor for maximum protection
- **buckler**: Small buckler shield for light defense
- **round_shield**: Medium round shield for balanced defense
- **tower_shield**: Large tower shield for maximum defense
- **leather_buckler**: Light leather armor with small buckler shield
- **chain_round_shield**: Medium chain mail with round shield
- **plate_tower_shield**: Heavy plate mail with tower shield

**Note**: Weapon and armor loadouts can be mixed and matched independently!

## Separate Weapon & Armor System

Weapon and armor loadouts are completely separate, allowing for maximum variety:

```typescript
// Weapon Loadout Example
export const WEAPON_LOADOUTS = {
  broadsword: {
    name: "Medium Melee - Sword",
    description: "Balanced melee fighter with sword",
    mainHand: { type: "weapon", preset: "broadsword" },
    aiBehavior: AIBehaviorType.MELEE,
  }
};

// Armor Loadout Example
export const ARMOR_LOADOUTS = {
  leather_buckler: {
    name: "Light Armor + Buckler",
    description: "Light leather armor with small buckler shield",
    armor: { type: "armor", preset: "leather" },
    shield: { type: "shield", preset: "buckler" },
  }
};
```

This creates independent combinations: Any weapon loadout can be combined with any armor loadout!

### Advanced Usage: Specifying Weapon and Armor Loadouts

You can specify which weapon and armor loadouts to use:

```typescript
// Use broadsword weapon loadout with leather armor loadout
const lightBandit = createMonster("human_bandit", "bandits", {
  x: 10, y: 5, 
  weaponLoadout: "broadsword",
  armorLoadout: "leather"
});

// Use broadsword weapon loadout with leather + buckler armor loadout
const defensiveBandit = createMonster("human_bandit", "bandits", {
  x: 15, y: 5,
  weaponLoadout: "broadsword", 
  armorLoadout: "leather_buckler"
});

// Mix and match: dagger weapon loadout with chain mail + round shield
const agileBandit = createMonster("human_bandit", "bandits", {
  x: 20, y: 5,
  weaponLoadout: "dagger",
  armorLoadout: "chain_round_shield"
});
```

## Usage

### Creating Monsters with Loadouts

```typescript
import { createMonster } from './factories';

// Create a bandit with random loadout selection
const randomBandit = createMonster("human_bandit", "bandits", { 
  x: 10, y: 5
});

// Create a shooter with random loadout selection
const randomShooter = createMonster("shooter", "bandits", { 
  x: 15, y: 8
});

// Create a bandit with specific weapon loadout but random armor
const specificWeaponBandit = createMonster("human_bandit", "bandits", { 
  x: 20, y: 5, weaponLoadout: "broadsword"
});

// Create a bandit with specific weapon and armor loadouts
const specificLoadoutBandit = createMonster("human_bandit", "bandits", { 
  x: 25, y: 5, weaponLoadout: "dagger", armorLoadout: "leather_buckler"
});

// When no loadouts are specified, monsters randomly select from their available options
```

### Loadout Mapping in Monster Presets

Each monster preset defines available loadout options. When a monster is created without specifying a loadout, one is randomly selected from the available options:

```typescript
bandit: {
  // ... other properties ...
  weaponLoadouts: ["light_melee_dagger", "light_melee_scimitar", "light_melee_defensive"],
  armorLoadouts: ["leather", "chain_mail", "leather_buckler"]
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

1. **Maximum Variety**: Any weapon loadout can be combined with any armor loadout
2. **Modular Design**: Weapon and armor are completely independent
3. **Tactical Depth**: Different loadouts require different strategies
4. **Replayability**: Encounters feel different each time
5. **Easy Configuration**: Simple weaponLoadout and armorLoadout parameters
6. **AI Adaptation**: AI behavior can change based on equipment
7. **Reusability**: Same loadouts can be used across different monster types
8. **Maintainability**: Centralized loadout definitions are easier to manage
9. **Consistency**: Same loadout always behaves the same way
10. **Flexibility**: Choose random variants or specify exact weapon/armor combinations
11. **Equipment Rules**: Automatic validation ensures equipment combinations are valid
12. **Inventory Fallback**: Conflicting items are automatically moved to inventory

## Adding New Loadouts

### 1. Add Weapon Loadouts

```typescript
// In src/creatures/presets/loadouts.ts
export const WEAPON_LOADOUTS: Record<string, WeaponLoadout> = {
  // ... existing loadouts ...
  new_weapon_loadout: {
    name: "New Weapon Loadout",
    description: "Description of this weapon loadout",
    mainHand: { type: "weapon", preset: "weaponName" },
    offHand: { type: "shield", preset: "shieldName" }, // optional
    inventory: [
      // ... weapon-related inventory items
    ],
    aiBehavior: AIBehaviorType.MELEE, // optional override
  },
};
```

### 2. Add Armor Loadouts

```typescript
export const ARMOR_LOADOUTS: Record<string, ArmorLoadout> = {
  // ... existing loadouts ...
  new_armor_loadout: {
    name: "New Armor Loadout",
    description: "Description of this armor loadout",
    armor: { type: "armor", preset: "armorName" },
    shield: { type: "shield", preset: "shieldName" }, // optional
    inventory: [
      // ... armor-related inventory items
    ],
  },
};
```

This creates independent combinations: Any weapon loadout can be combined with any armor loadout!

### 3. Add to Loadout Categories

```typescript
// For weapon loadouts
export function getWeaponLoadoutsByCategory(category: 'melee' | 'ranged' | 'defensive' | 'agile' | 'testing'): string[] {
  const categoryMap: Record<string, string[]> = {
    // ... existing categories ...
    new_category: ['new_weapon_loadout', 'other_weapon_loadout']
  };
  
  return categoryMap[category] || [];
}

// For armor loadouts
export function getArmorLoadoutsByCategory(category: 'light' | 'medium' | 'heavy' | 'shield_only' | 'combined'): string[] {
  const categoryMap: Record<string, string[]> = {
    // ... existing categories ...
    new_category: ['new_armor_loadout', 'other_armor_loadout']
  };
  
  return categoryMap[category] || [];
}
```

### 4. Use in Monster Presets

```typescript
// In any monster preset
weaponLoadouts: ["dagger", "broadsword", "new_weapon_loadout"],
armorLoadouts: ["leather", "chain_mail", "new_armor_loadout"]
```

## Example: Loadout Reusability

The same loadouts can be used by different monster types:

- **Bandit** with `broadsword` + `leather_buckler` loadouts
- **Skeleton** with `greatsword` + `chain_mail` loadouts
- **Orc** with `dual_dagger` + `plate_tower_shield` loadouts

Each combination creates a unique fighting style and equipment setup!

This means both monster types can share the same fighting style while maintaining variety through different weapon and armor combinations. Each monster gets a random combination of:
- **Weapon**: Sword only
- **Armor**: Leather armor, Chain mail, Leather+Shield, or Chain+Shield

This creates 4 possible combinations per monster, making each encounter feel unique!

## Backward Compatibility

The system is fully backward compatible:
- Existing code continues to work
- Monsters without specified loadouts use their default configuration
- The `loadout` parameter is optional
