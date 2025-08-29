# Items Module

This module contains all item-related functionality for the game, organized into separate files for better maintainability.

## File Structure

### `types.ts`
Contains the base item class hierarchy:
- `Item` - Base class for all items
- `Weapon` - Melee weapons
- `RangedWeapon` - Ranged weapons (bows, crossbows, etc.)
- `Armor` - Protective equipment
- `Shield` - Defensive equipment

Also includes the `generateItemId()` utility function for creating unique item identifiers.

### `presets.ts`
Contains predefined item configurations and their type definitions:
- `WeaponPreset` and `weaponPresets` - Melee weapon configurations
- `RangedWeaponPreset` and `rangedPresets` - Ranged weapon configurations
- `ArmorPreset` and `armorPresets` - Armor configurations
- `ShieldPreset` and `shieldPresets` - Shield configurations

### `factories.ts`
Contains factory functions for creating items from presets:
- `createWeapon()` - Creates weapons from weapon presets
- `createRangedWeapon()` - Creates ranged weapons from ranged weapon presets
- `createArmor()` - Creates armor from armor presets
- `createShield()` - Creates shields from shield presets

### `index.ts`
Main export file that re-exports all functionality from the other files, maintaining backward compatibility with existing imports.

## Usage

```typescript
import { 
  Weapon, 
  createWeapon, 
  weaponPresets 
} from '../items';

// Create a weapon from a preset
const sword = createWeapon('broadsword');

// Create a weapon with custom overrides
const customSword = createWeapon('broadsword', {
  name: 'Magic Sword',
  damage: 2,
  value: 100
});

// Create a weapon directly
const dagger = new Weapon({
  name: 'Dagger',
  damage: 0,
  hands: 1,
  properties: ['finesse', 'light', 'thrown'],
  weight: 1,
  value: 2
});
```

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a specific responsibility
2. **Maintainability**: Easier to find and modify specific functionality
3. **Scalability**: Easy to add new item types or presets
4. **Backward Compatibility**: Existing imports continue to work unchanged
5. **Type Safety**: Strong typing throughout the module
