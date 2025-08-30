// --- Centralized ID Generation Utilities ---

// Creature ID generation
let creatureIdCounter = 0;
export function generateCreatureId(): string {
  return `creature-${++creatureIdCounter}`;
}

// Item ID generation
let itemIdCounter = 0;
export function generateItemId(): string {
  return `item-${++itemIdCounter}`;
}

// Generic ID generation with custom prefix
let genericIdCounter = 0;
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++genericIdCounter}`;
}

// Reset counters (useful for testing)
export function resetIdCounters(): void {
  creatureIdCounter = 0;
  itemIdCounter = 0;
  genericIdCounter = 0;
}
