# Equipment Module

This module provides a comprehensive equipment system for the game, organized into logical components to improve maintainability and separation of concerns.

## Module Structure

### `validation.ts`
- **EquipmentValidator**: Handles all equipment validation logic
- **EquipmentSlot**: Type definitions for equipment slots
- **EquipmentSlots**: Interface for equipment configuration
- **EquipmentValidation**: Validation result interface

### `combat.ts`
- **CombatCalculator**: Static methods for combat-related calculations
- Handles weapon damage, range, armor calculations, and combat bonuses
- Separated from equipment management to maintain single responsibility

### `system.ts`
- **EquipmentSystem**: Core equipment management class
- Handles equipping/unequipping items
- Manages equipment slots and queries
- Delegates combat calculations to CombatCalculator

### `manager.ts`
- **EquipmentManager**: Creature-specific equipment operations
- Bridges between creatures and the equipment system
- Handles creature state updates when equipment changes

### `index.ts`
- Main export file that provides access to all equipment functionality
- Maintains backward compatibility with existing imports

## Benefits of This Organization

1. **Single Responsibility**: Each file has a clear, focused purpose
2. **Easier Testing**: Individual components can be tested in isolation
3. **Better Maintainability**: Changes to validation logic don't affect combat calculations
4. **Reduced Coupling**: Combat calculations are independent of equipment management
5. **Clearer Dependencies**: Import relationships are more explicit

## Usage Examples

```typescript
// Import specific components
import { EquipmentValidator } from './equipment/validation';
import { CombatCalculator } from './equipment/combat';
import { EquipmentSystem } from './equipment/system';

// Or import everything from the main index
import { EquipmentSystem, EquipmentValidator, CombatCalculator } from './equipment';
```

## Migration Notes

The existing code should continue to work without changes, as all exports are maintained through the main index file. The internal organization has been improved while preserving the public API.
