# CreaturePanel Component

The CreaturePanel has been refactored into smaller, more manageable components following the Single Responsibility Principle.

## Component Structure

```
CreaturePanel/
├── index.tsx              # Main container component - orchestrates sub-components
├── CreatureHeader.tsx      # Displays creature image, name, and basic info
├── CreatureStats.tsx       # Shows all creature attributes and stats
├── EquipmentSection/       # Equipment management section
│   ├── index.tsx          # Equipment section container
│   └── EquipmentSlot.tsx  # Individual equipment slot display
├── InventorySection/       # Inventory management section
│   ├── index.tsx          # Inventory section container
│   └── InventoryItem.tsx  # Individual inventory item display
├── HeroSelector.tsx        # Hero selection when no creature is selected
├── DeselectButton.tsx      # Button to deselect current creature
└── README.md              # This documentation
```

## Benefits of Refactoring

1. **Single Responsibility**: Each component has one clear purpose
2. **Maintainability**: Easier to locate and modify specific functionality
3. **Testability**: Components can be tested independently
4. **Reusability**: Components can be reused in other parts of the application
5. **Readability**: Smaller files are easier to understand and navigate

## Key Features

- **Equipment Management**: Centralized in `useEquipment` hook
- **Inventory Display**: Clean separation of inventory logic
- **Hero Selection**: Dedicated component for hero management
- **Responsive Design**: Maintains the same visual appearance

## Usage

```tsx
import { CreaturePanel } from './components/CreaturePanel';

<CreaturePanel
  selectedCreature={selectedCreature}
  creatures={creatures}
  onDeselect={handleDeselect}
  onSelectCreature={handleSelectCreature}
  onCreatureUpdate={handleCreatureUpdate}
/>
```

## Equipment Logic

All equipment-related logic is centralized in the `useEquipment` hook, which provides:
- `handleEquip`: Equip items to slots
- `handleUnequip`: Remove items from slots
- `canEquipToSlot`: Validate if items can be equipped
- `canSwitchWeaponOrShield`: Check if weapon/shield switching is allowed
- `canUnequipWeaponOrShield`: Validate unequipping operations
