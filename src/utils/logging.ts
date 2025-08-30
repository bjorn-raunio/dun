// --- Centralized Logging Utility ---

export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5
}

export interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableTimestamp: boolean;
  enablePrefix: boolean;
  maxLogHistory: number;
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class Logger {
  private config: LogConfig;
  private logHistory: LogEntry[] = [];
  private static instance: Logger;

  private constructor() {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableTimestamp: true,
      enablePrefix: true,
      maxLogHistory: 1000
    };
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Configuration methods
  setLogLevel(level: LogLevel): void {
    this.config.level = level;
  }

  setConsoleEnabled(enabled: boolean): void {
    this.config.enableConsole = enabled;
  }

  setTimestampEnabled(enabled: boolean): void {
    this.config.enableTimestamp = enabled;
  }

  setPrefixEnabled(enabled: boolean): void {
    this.config.enablePrefix = enabled;
  }

  setMaxLogHistory(max: number): void {
    this.config.maxLogHistory = max;
  }

  getConfig(): LogConfig {
    return { ...this.config };
  }

  // Core logging methods
  private log(level: LogLevel, category: string, message: string, data?: any): void {
    if (level > this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data
    };

    // Add to history
    this.logHistory.push(entry);
    if (this.logHistory.length > this.config.maxLogHistory) {
      this.logHistory.shift();
    }

    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = this.config.enableTimestamp ? `[${entry.timestamp.toISOString()}] ` : '';
    const prefix = this.config.enablePrefix ? `[${LogLevel[entry.level]}] [${entry.category}] ` : '';
    const fullMessage = `${timestamp}${prefix}${entry.message}`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(fullMessage, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(fullMessage, entry.data || '');
        break;
      case LogLevel.DEBUG:
        console.log(fullMessage, entry.data || '');
        break;
      case LogLevel.TRACE:
        console.log(fullMessage, entry.data || '');
        break;
    }
  }

  // Public logging methods
  error(category: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  trace(category: string, message: string, data?: any): void {
    this.log(LogLevel.TRACE, category, message, data);
  }

  // Convenience methods for common categories
  movement(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'MOVEMENT', message, data);
  }

  combat(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'COMBAT', message, data);
  }

  ai(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'AI', message, data);
  }

  turn(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'TURN', message, data);
  }

  game(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'GAME', message, data);
  }

  // Utility methods
  getLogHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  clearLogHistory(): void {
    this.logHistory = [];
  }

  exportLogs(): string {
    return this.logHistory
      .map(entry => `${entry.timestamp.toISOString()} [${LogLevel[entry.level]}] [${entry.category}] ${entry.message}`)
      .join('\n');
  }

  // Performance logging
  time(label: string): void {
    if (this.config.enableConsole && this.config.level >= LogLevel.DEBUG) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.config.enableConsole && this.config.level >= LogLevel.DEBUG) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions for direct usage
export const logError = (category: string, message: string, data?: any) => logger.error(category, message, data);
export const logWarn = (category: string, message: string, data?: any) => logger.warn(category, message, data);
export const logInfo = (category: string, message: string, data?: any) => logger.info(category, message, data);
export const logDebug = (category: string, message: string, data?: any) => logger.debug(category, message, data);
export const logTrace = (category: string, message: string, data?: any) => logger.trace(category, message, data);

// Category-specific convenience functions
export const logMovement = (message: string, data?: any) => logger.movement(message, data);
export const logCombat = (message: string, data?: any) => logger.combat(message, data);
export const logAI = (message: string, data?: any) => logger.ai(message, data);
export const logTurn = (message: string, data?: any) => logger.turn(message, data);
export const logGame = (message: string, data?: any) => logger.game(message, data);

// Export the Logger class for advanced usage
export { Logger };
