// --- Creature Service Locator ---
// This file provides access to creature-related services without circular dependencies

import { ICreatureMovement, ICombatExecutor } from './interfaces';
import { CreatureMovement } from './movement';
import combatExecutor from './combatExecutor';

// --- Service Locator Class ---

export class CreatureServiceLocator {
  private static instance: CreatureServiceLocator;
  private movementService: ICreatureMovement;
  private combatExecutor: ICombatExecutor;

  private constructor() {
    // Initialize with default services
    this.movementService = new CreatureMovement();
    this.combatExecutor = combatExecutor;
  }

  static getInstance(): CreatureServiceLocator {
    if (!CreatureServiceLocator.instance) {
      CreatureServiceLocator.instance = new CreatureServiceLocator();
    }
    return CreatureServiceLocator.instance;
  }

  // --- Movement Service ---
  
  setMovementService(service: ICreatureMovement): void {
    this.movementService = service;
  }

  getMovementService(): ICreatureMovement {
    return this.movementService;
  }

  // --- Combat Executor ---
  
  setCombatExecutor(executor: ICombatExecutor): void {
    this.combatExecutor = executor;
  }

  getCombatExecutor(): ICombatExecutor {
    return this.combatExecutor;
  }

  // --- Reset Services (for testing) ---
  
  reset(): void {
    this.movementService = new CreatureMovement();
    this.combatExecutor = combatExecutor;
  }
}

// --- Default Export ---
export default CreatureServiceLocator.getInstance();
