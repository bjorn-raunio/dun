// --- Creature System Initialization ---
// This file initializes the creature system and sets up dependencies

import creatureServices from './services';
import { CreatureMovement } from './movement';
import combatExecutor from './combatExecutor';

// --- Initialize Services ---
// This ensures all services are properly registered before use

export function initializeCreatureSystem(): void {
  // Register the movement service
  creatureServices.setMovementService(new CreatureMovement());
  
  // Register the combat executor
  creatureServices.setCombatExecutor(combatExecutor);
  
  console.log('Creature system initialized successfully');
}

// --- Auto-initialize when module is imported ---
initializeCreatureSystem();
