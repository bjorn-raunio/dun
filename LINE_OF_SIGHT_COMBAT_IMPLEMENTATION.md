# Line of Sight Combat Implementation

## Overview
This implementation adds line of sight checking to the combat system, ensuring that creatures cannot attack targets that are not visible due to terrain obstacles or other blocking elements.

## What Was Implemented

### 1. Enhanced Combat Validation
- **File**: `src/validation/combat.ts`
- **Change**: Added line of sight validation to the `validateCombat` function
- **Logic**: After range and basic validation, the system now checks if there's a clear line of sight between attacker and target

### 2. Updated Combat Execution
- **File**: `src/utils/combat/execution.ts`
- **Change**: Modified `executeCombat` function to accept and pass `mapData` parameter
- **Purpose**: Enables line of sight checking during combat execution

### 3. Enhanced Combat Interfaces
- **Files**: `src/creatures/interfaces.ts`, `src/creatures/combatExecutor.ts`
- **Changes**: Updated interfaces to include `mapData` parameter in combat methods
- **Impact**: Ensures type safety and consistency across the combat system

### 4. Updated Creature Attack Method
- **File**: `src/creatures/base.ts`
- **Change**: Modified `attack` method to accept and pass `mapData` parameter
- **Purpose**: Enables line of sight validation when creatures attack

### 5. Enhanced Mouse Handlers
- **File**: `src/handlers/mouseHandlers.ts`
- **Change**: Updated attack calls to pass `mapData` parameter
- **Impact**: Player attacks now respect line of sight rules

### 6. Enhanced AI Combat
- **File**: `src/ai/decisionMaking.ts`
- **Change**: Updated AI attack calls to pass `mapData` parameter
- **Impact**: AI creatures now also respect line of sight rules

## How It Works

### Line of Sight Algorithm
The system uses the existing `LineOfSightSystem` which implements:
- **DDA Algorithm**: Digital Differential Analyzer for comprehensive tile coverage
- **Terrain Blocking**: Checks if terrain types block line of sight
- **Elevation Consideration**: Accounts for height differences and creature sizes
- **Creature Blocking**: Considers if other creatures block the line of sight

### Validation Flow
1. **Basic Checks**: Creature alive, has actions, target alive, not friendly fire
2. **Range Check**: Target within attack range
3. **Line of Sight Check**: Clear path between attacker and target (NEW)
4. **Elevation Check**: Height difference acceptable for melee attacks
5. **Combat Execution**: If all checks pass, proceed with attack

### Error Handling
- **Message**: Uses existing `TARGET_NOT_VISIBLE` validation message
- **Consistency**: Maintains the same error handling pattern as other validations
- **User Experience**: Clear feedback when line of sight is blocked

## Benefits

### 1. Realistic Combat
- Creatures cannot attack through walls or other obstacles
- Terrain features now matter for combat positioning
- More strategic gameplay requiring proper positioning

### 2. Consistent Rules
- Both player and AI creatures follow the same line of sight rules
- Validation happens at the same level for all attack types
- Maintains game balance and fairness

### 3. Enhanced Immersion
- Combat feels more realistic and tactical
- Players must consider positioning and terrain when planning attacks
- Encourages strategic movement and positioning

## Technical Details

### Data Flow
```
Mouse Click → Mouse Handler → Creature.attack() → Combat Executor → 
Combat Execution → Combat Validation → Line of Sight Check → 
Attack Proceeds/Blocked
```

### Parameters Added
- `mapData?: { tiles: string[][] }` - Added to combat validation and execution
- Maintains backward compatibility (optional parameter)
- Only performs line of sight checks when map data is available

### Performance Considerations
- Line of sight checking only occurs when map data is provided
- Uses efficient DDA algorithm for path calculation
- Caches terrain information to avoid repeated lookups

## Testing

The implementation has been tested for:
- ✅ TypeScript compilation (no errors)
- ✅ Build process completion
- ✅ Interface consistency
- ✅ Parameter passing through all layers

## Future Enhancements

### Potential Improvements
1. **Visual Feedback**: Show line of sight path in UI
2. **Debug Mode**: Highlight blocking terrain/creatures
3. **Performance**: Cache line of sight results for repeated checks
4. **Advanced Terrain**: Support for partial cover, windows, etc.

### Integration Points
- **Pathfinding**: Could integrate with movement planning
- **AI Decision Making**: Consider line of sight in tactical positioning
- **UI**: Show valid attack targets based on line of sight

## Conclusion

This implementation successfully adds line of sight validation to the combat system, making combat more realistic and strategic. The changes are minimal, well-integrated, and maintain backward compatibility while adding significant gameplay depth.

The system now ensures that:
- Creatures cannot attack through walls or obstacles
- Terrain features affect combat capabilities
- Both players and AI follow the same rules
- The game maintains its tactical depth and immersion
