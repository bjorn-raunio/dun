// --- Centralized Message System ---

export interface MessageConfig {
  enableConsole: boolean;
  enableTimestamp: boolean;
  maxMessageHistory: number;
  autoDispatch: boolean;
}

export interface MessageEntry {
  timestamp: Date;
  message: string;
  category?: string;
  data?: any;
}

class MessageManager {
  private config: MessageConfig;
  private messageHistory: MessageEntry[] = [];
  private static instance: MessageManager;
  private dispatchFunction: React.Dispatch<any> | null = null;

  private constructor() {
    this.config = {
      enableConsole: false,
      enableTimestamp: true,
      maxMessageHistory: 1000,
      autoDispatch: true
    };
  }

  static getInstance(): MessageManager {
    if (!MessageManager.instance) {
      MessageManager.instance = new MessageManager();
    }
    return MessageManager.instance;
  }

  // Configuration methods
  setConsoleEnabled(enabled: boolean): void {
    this.config.enableConsole = enabled;
  }

  setTimestampEnabled(enabled: boolean): void {
    this.config.enableTimestamp = enabled;
  }

  setMaxMessageHistory(max: number): void {
    this.config.maxMessageHistory = max;
  }

  setAutoDispatch(enabled: boolean): void {
    this.config.autoDispatch = enabled;
  }

  setDispatchFunction(dispatch: React.Dispatch<any> | null): void {
    this.dispatchFunction = dispatch;
  }

  getConfig(): MessageConfig {
    return { ...this.config };
  }

  // Core message methods
  private addMessage(message: string, category?: string, data?: any): void {
    if (!message || message.trim() === '') {
      return;
    }

    const entry: MessageEntry = {
      timestamp: new Date(),
      message: message.trim(),
      category,
      data
    };

    // Add to history
    this.messageHistory.push(entry);
    if (this.messageHistory.length > this.config.maxMessageHistory) {
      this.messageHistory.shift();
    }

    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Auto-dispatch to React state if enabled and dispatch function is set
    if (this.config.autoDispatch && this.dispatchFunction) {
      this.dispatchFunction({ type: 'ADD_MESSAGE', payload: entry.message });
    }
  }

  private outputToConsole(entry: MessageEntry): void {
    const timestamp = this.config.enableTimestamp ? `[${entry.timestamp.toISOString()}] ` : '';
    const category = entry.category ? `[${entry.category}] ` : '';
    const fullMessage = `${timestamp}${category}${entry.message}`;

    console.log(fullMessage, entry.data || '');
  }

  // Public message methods
  message(message: string, category?: string, data?: any): void {
    this.addMessage(message, category, data);
  }

  // Category-specific convenience methods
  combat(message: string, data?: any): void {
    this.addMessage(message, 'COMBAT', data);
  }

  movement(message: string, data?: any): void {
    this.addMessage(message, 'MOVEMENT', data);
  }

  statusEffect(message: string, data?: any): void {
    this.addMessage(message, 'STATUS_EFFECT', data);
  }

  turn(message: string, data?: any): void {
    this.addMessage(message, 'TURN', data);
  }

  game(message: string, data?: any): void {
    this.addMessage(message, 'GAME', data);
  }

  error(message: string, data?: any): void {
    this.addMessage(message, 'ERROR', data);
  }

  // Utility methods
  getMessageHistory(): MessageEntry[] {
    return [...this.messageHistory];
  }

  clearMessageHistory(): void {
    this.messageHistory = [];
  }

  exportMessages(): string {
    return this.messageHistory
      .map(entry => {
        const timestamp = this.config.enableTimestamp ? `${entry.timestamp.toISOString()} ` : '';
        const category = entry.category ? `[${entry.category}] ` : '';
        return `${timestamp}${category}${entry.message}`;
      })
      .join('\n');
  }

  // Manual dispatch method for when auto-dispatch is disabled
  dispatchMessage(message: string, category?: string, data?: any): void {
    this.addMessage(message, category, data);
    if (this.dispatchFunction) {
      this.dispatchFunction({ type: 'ADD_MESSAGE', payload: message });
    }
  }

  // Batch message methods
  addMessages(messages: string[], category?: string): void {
    messages.forEach(message => {
      this.addMessage(message, category);
    });
  }

  // Get messages by category
  getMessagesByCategory(category: string): MessageEntry[] {
    return this.messageHistory.filter(entry => entry.category === category);
  }

  // Get recent messages
  getRecentMessages(count: number = 10): MessageEntry[] {
    return this.messageHistory.slice(-count);
  }
}

// Export singleton instance
export const messageManager = MessageManager.getInstance();

// Convenience functions for direct usage
export const addMessage = (message: string, category?: string, data?: any) => 
  messageManager.message(message, category, data);

export const addCombatMessage = (message: string, data?: any) => 
  messageManager.combat(message, data);

export const addMovementMessage = (message: string, data?: any) => 
  messageManager.movement(message, data);

export const addStatusEffectMessage = (message: string, data?: any) => 
  messageManager.statusEffect(message, data);

export const addTurnMessage = (message: string, data?: any) => 
  messageManager.turn(message, data);

export const addGameMessage = (message: string, data?: any) => 
  messageManager.game(message, data);

export const addErrorMessage = (message: string, data?: any) => 
  messageManager.error(message, data);

// Batch convenience functions
export const addCombatMessages = (messages: string[], data?: any) => 
  messageManager.addMessages(messages, 'COMBAT');

export const addTurnMessages = (messages: string[], data?: any) => 
  messageManager.addMessages(messages, 'TURN');

// Export the MessageManager class for advanced usage
export { MessageManager };
