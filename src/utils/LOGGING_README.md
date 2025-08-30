# Centralized Logging System

This module provides a comprehensive logging system that replaces scattered `console.log` statements throughout the codebase with a centralized, configurable logging utility.

## Features

- **Configurable Log Levels**: ERROR, WARN, INFO, DEBUG, TRACE
- **Category-based Logging**: Different log levels for different parts of the system
- **Toggle On/Off**: Easy to enable/disable logging for production
- **Structured Data**: Support for logging objects and arrays alongside messages
- **Performance Logging**: Built-in timing functions
- **Log History**: In-memory log storage with export capabilities

## Quick Start

### Basic Usage

```typescript
import { logInfo, logDebug, logError } from '../utils/logging';

// Simple logging
logInfo('GAME', 'Game started');
logDebug('COMBAT', 'Attack roll: 15');
logError('VALIDATION', 'Invalid creature position');

// Logging with data
logDebug('MOVEMENT', 'Creature moved', { 
  from: { x: 5, y: 5 }, 
  to: { x: 6, y: 5 },
  cost: 2 
});
```

### Category-Specific Convenience Functions

```typescript
import { logMovement, logCombat, logAI, logTurn, logGame } from '../utils/logging';

logMovement('Hero moved to (10, 15)');
logCombat('Attack hit for 5 damage');
logAI('AI chose movement option');
logTurn('Turn 3 started');
logGame('Player selected new target');
```

### Advanced Usage

```typescript
import { logger, LogLevel } from '../utils/logging';

// Configure logging
logger.setLogLevel(LogLevel.DEBUG);
logger.setConsoleEnabled(true);
logger.setTimestampEnabled(true);

// Performance logging
logger.time('pathfinding');
// ... pathfinding code ...
logger.timeEnd('pathfinding');

// Get log history
const history = logger.getLogHistory();
const exportedLogs = logger.exportLogs();
```

## Configuration

### Environment-Based Configuration

```typescript
import { configureLoggingForEnvironment } from '../utils/loggingConfig';

// Automatically configure for different environments
configureLoggingForEnvironment('development');  // Full logging
configureLoggingForEnvironment('production');   // Warnings only
configureLoggingForEnvironment('test');         // Errors only
```

### Category-Specific Configuration

```typescript
import { setCategoryLogLevel, toggleCategory } from '../utils/loggingConfig';
import { LogLevel } from '../utils/logging';

// Set specific category levels
setCategoryLogLevel('COMBAT', LogLevel.DEBUG);
setCategoryLogLevel('MOVEMENT', LogLevel.INFO);

// Toggle categories on/off
toggleCategory('AI', false);  // Disable AI logging
toggleCategory('COMBAT', true); // Enable combat logging
```

### Quick Configuration Functions

```typescript
import { 
  enableDebugLogging, 
  enableInfoLogging, 
  disableLogging,
  enableConsoleLogging,
  disableConsoleLogging 
} from '../utils/loggingConfig';

enableDebugLogging();      // Set to DEBUG level
enableInfoLogging();       // Set to INFO level
disableLogging();          // Disable all logging
enableConsoleLogging();    // Enable console output
disableConsoleLogging();   // Disable console output
```

## Log Levels

- **ERROR (1)**: Critical errors that need immediate attention
- **WARN (2)**: Warning conditions that might indicate problems
- **INFO (3)**: General information about application state
- **DEBUG (4)**: Detailed debugging information
- **TRACE (5)**: Very detailed tracing information

## Categories

The system includes predefined categories for common game systems:

- **MOVEMENT**: Creature movement and pathfinding
- **COMBAT**: Combat calculations and results
- **AI**: AI decision making and behavior
- **TURN**: Turn management and progression
- **GAME**: General game state and events
- **VALIDATION**: Data validation and error checking
- **PATHFINDING**: Pathfinding algorithms and results
- **EQUIPMENT**: Equipment and inventory management
- **CREATURE**: Creature state and properties
- **MAP**: Map rendering and tile management
- **UI**: User interface interactions
- **NETWORK**: Network communication (if applicable)
- **PERFORMANCE**: Performance monitoring and timing

## Migration from console.log

### Before (Old Pattern)
```typescript
console.log(`Hero at (${x}, ${y}) moving to (${newX}, ${newY})`);
console.log('Path:', path);
console.log('Cost:', cost);
```

### After (New Pattern)
```typescript
logMovement(`Hero at (${x}, ${y}) moving to (${newX}, ${newY})`, {
  path,
  cost
});
```

## Benefits

1. **Centralized Control**: All logging can be controlled from one place
2. **Production Ready**: Easy to disable logging in production builds
3. **Structured Data**: Better debugging with structured log data
4. **Performance**: No logging overhead when disabled
5. **Consistency**: Uniform logging format across the entire codebase
6. **Debugging**: Better debugging experience with categorized logs
7. **Maintenance**: Easier to maintain and modify logging behavior

## Best Practices

1. **Use Appropriate Categories**: Choose the most specific category for your log
2. **Include Relevant Data**: Log objects and arrays that provide context
3. **Use Descriptive Messages**: Make log messages clear and actionable
4. **Set Appropriate Levels**: Use ERROR for errors, DEBUG for detailed info
5. **Disable in Production**: Use environment-based configuration
6. **Group Related Logs**: Use the same category for related operations

## Example Integration

```typescript
// In your game component or hook
import { logGame, logTurn } from '../utils/logging';

function useGameState() {
  const [turn, setTurn] = useState(1);
  
  const advanceTurn = useCallback(() => {
    logTurn(`Advancing from turn ${turn} to ${turn + 1}`);
    setTurn(prev => prev + 1);
  }, [turn]);
  
  const startGame = useCallback(() => {
    logGame('Starting new game', { initialTurn: 1 });
    setTurn(1);
  }, []);
  
  return { turn, advanceTurn, startGame };
}
```
