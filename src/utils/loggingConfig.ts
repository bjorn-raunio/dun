// --- Logging Configuration ---
import { logger, LogLevel } from './logging';

// Default logging configuration
export const DEFAULT_LOGGING_CONFIG = {
  // Global log level (can be overridden by category-specific settings)
  globalLevel: LogLevel.DEBUG,
  
  // Category-specific log levels
  categories: {
    MOVEMENT: LogLevel.DEBUG,
    COMBAT: LogLevel.DEBUG,
    AI: LogLevel.DEBUG,
    TURN: LogLevel.INFO,
    GAME: LogLevel.INFO,
    VALIDATION: LogLevel.WARN,
    PATHFINDING: LogLevel.DEBUG,
    EQUIPMENT: LogLevel.INFO,
    CREATURE: LogLevel.INFO,
    MAP: LogLevel.INFO,
    UI: LogLevel.INFO,
    NETWORK: LogLevel.WARN,
    PERFORMANCE: LogLevel.DEBUG
  },
  
  // Console output settings
  console: {
    enabled: true,
    showTimestamp: true,
    showPrefix: true,
    showData: true
  },
  
  // Performance settings
  performance: {
    maxLogHistory: 1000,
    enablePerformanceLogging: true,
    logSlowOperations: true,
    slowOperationThreshold: 100 // milliseconds
  }
};

// Initialize logging with default configuration
export function initializeLogging(): void {
  // Set global log level
  logger.setLogLevel(DEFAULT_LOGGING_CONFIG.globalLevel);
  
  // Configure console output
  logger.setConsoleEnabled(DEFAULT_LOGGING_CONFIG.console.enabled);
  logger.setTimestampEnabled(DEFAULT_LOGGING_CONFIG.console.showTimestamp);
  logger.setPrefixEnabled(DEFAULT_LOGGING_CONFIG.console.showPrefix);
  logger.setMaxLogHistory(DEFAULT_LOGGING_CONFIG.performance.maxLogHistory);
  
  // Log initialization
  logger.info('LOGGING', 'Logging system initialized', DEFAULT_LOGGING_CONFIG);
}

// Environment-based configuration
export function configureLoggingForEnvironment(environment: 'development' | 'production' | 'test'): void {
  switch (environment) {
    case 'development':
      logger.setLogLevel(LogLevel.DEBUG);
      logger.setConsoleEnabled(true);
      logger.setTimestampEnabled(true);
      logger.setPrefixEnabled(true);
      break;
      
    case 'production':
      logger.setLogLevel(LogLevel.WARN);
      logger.setConsoleEnabled(false);
      logger.setTimestampEnabled(false);
      logger.setPrefixEnabled(false);
      break;
      
    case 'test':
      logger.setLogLevel(LogLevel.ERROR);
      logger.setConsoleEnabled(false);
      logger.setTimestampEnabled(false);
      logger.setPrefixEnabled(false);
      break;
  }
  
  logger.info('LOGGING', `Logging configured for ${environment} environment`);
}

// Category-specific log level configuration
export function setCategoryLogLevel(category: keyof typeof DEFAULT_LOGGING_CONFIG.categories, level: LogLevel): void {
  DEFAULT_LOGGING_CONFIG.categories[category] = level;
  logger.debug('LOGGING', `Category ${category} log level set to ${LogLevel[level]}`);
}

// Toggle specific logging categories on/off
export function toggleCategory(category: keyof typeof DEFAULT_LOGGING_CONFIG.categories, enabled: boolean): void {
  const level = enabled ? DEFAULT_LOGGING_CONFIG.categories[category] : LogLevel.NONE;
  setCategoryLogLevel(category, level);
}

// Get current logging configuration
export function getLoggingConfig() {
  return {
    ...DEFAULT_LOGGING_CONFIG,
    current: logger.getConfig()
  };
}

// Export convenience functions for common configurations
export const enableDebugLogging = () => logger.setLogLevel(LogLevel.DEBUG);
export const enableInfoLogging = () => logger.setLogLevel(LogLevel.INFO);
export const enableWarningLogging = () => logger.setLogLevel(LogLevel.WARN);
export const disableLogging = () => logger.setLogLevel(LogLevel.NONE);
export const enableConsoleLogging = () => logger.setConsoleEnabled(true);
export const disableConsoleLogging = () => logger.setConsoleEnabled(false);

// Auto-initialize logging for development
if (process.env.NODE_ENV === 'development') {
  initializeLogging();
}
