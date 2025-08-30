import { CreatureState, CreaturePosition } from './types';

// --- Creature State Management ---

export class CreatureStateManager {
  private state: CreatureState;
  private turnStartPosition: CreaturePosition;

  constructor(
    private maxMovement: number,
    private maxActions: number,
    private maxQuickActions: number,
    private maxVitality: number,
    private maxMana: number,
    private maxFortune: number,
    private initialPosition: CreaturePosition
  ) {
    this.state = {
      remainingMovement: maxMovement,
      remainingActions: maxActions,
      remainingQuickActions: maxQuickActions,
      remainingVitality: maxVitality,
      remainingMana: maxMana,
      remainingFortune: maxFortune,
      hasMovedWhileEngaged: false
    };
    
    this.turnStartPosition = { ...initialPosition };
  }

  // --- State Getters ---
  
  getState(): CreatureState {
    return { ...this.state };
  }

  getTurnStartPosition(): CreaturePosition {
    return { ...this.turnStartPosition };
  }

  // --- State Checks ---

  isAlive(): boolean {
    return this.state.remainingVitality > 0;
  }

  isDead(): boolean {
    return this.state.remainingVitality <= 0;
  }

  isWounded(size: number): boolean {
    if (size < 4) {
      return this.state.remainingVitality <= 1;
    } else {
      return this.state.remainingVitality <= 5;
    }
  }

  hasMoved(): boolean {
    // Dead creatures cannot have moved
    if (this.isDead()) {
      return false;
    }
    return this.state.remainingMovement !== this.maxMovement;
  }

  hasActionsRemaining(): boolean {
    // Dead creatures cannot have actions remaining
    if (this.isDead()) {
      return false;
    }
    return this.state.remainingActions > 0;
  }

  hasMana(amount: number): boolean {
    return this.state.remainingMana >= amount;
  }

  hasFortune(amount: number): boolean {
    return this.state.remainingFortune >= amount;
  }

  hasTakenActionsThisTurn(): boolean {
    // Dead creatures cannot have taken actions
    if (this.isDead()) {
      return false;
    }
    return this.hasMoved() || 
           this.state.remainingActions < this.maxActions || 
           this.state.remainingQuickActions < this.maxQuickActions;
  }

  // --- State Modifiers ---

  takeDamage(damage: number): number {
    this.state.remainingVitality = Math.max(0, this.state.remainingVitality - damage);
    return this.state.remainingVitality;
  }

  useMovement(points: number): void {
    // Dead creatures cannot use movement
    if (this.isDead()) {
      return;
    }
    this.state.remainingMovement = Math.max(0, this.state.remainingMovement - points);
  }

  useAction(): void {
    // Dead creatures cannot use actions
    if (this.isDead()) {
      return;
    }
    if (this.state.remainingActions > 0) {
      this.state.remainingActions--;
    }
  }

  useQuickAction(): void {
    // Dead creatures cannot use quick actions
    if (this.isDead()) {
      return;
    }
    if (this.state.remainingQuickActions > 0) {
      this.state.remainingQuickActions--;
    }
  }

  useMana(amount: number): boolean {
    if (this.state.remainingMana >= amount) {
      this.state.remainingMana -= amount;
      return true;
    }
    return false;
  }

  useFortune(amount: number): boolean {
    if (this.state.remainingFortune >= amount) {
      this.state.remainingFortune -= amount;
      return true;
    }
    return false;
  }

  setMovedWhileEngaged(value: boolean): void {
    this.state.hasMovedWhileEngaged = value;
  }

  setRemainingMovement(value: number): void {
    this.state.remainingMovement = Math.max(0, value);
  }

  setRemainingActions(value: number): void {
    this.state.remainingActions = Math.max(0, value);
  }

  setRemainingQuickActions(value: number): void {
    this.state.remainingQuickActions = Math.max(0, value);
  }

  setRemainingFortune(value: number): void {
    this.state.remainingFortune = Math.max(0, value);
  }

  // --- Turn Management ---

  resetTurn(): void {
    // If creature is dead, set movement, actions, and quick actions to 0
    if (this.isDead()) {
      this.state.remainingMovement = 0;
      this.state.remainingActions = 0;
      this.state.remainingQuickActions = 0;
    } else {
      this.state.remainingMovement = this.maxMovement;
      this.state.remainingActions = this.maxActions;
      this.state.remainingQuickActions = this.maxQuickActions;
    }
    this.state.remainingMana = this.maxMana;
    this.state.remainingFortune = this.maxFortune;
    this.state.hasMovedWhileEngaged = false;
  }

  resetRemainingActions(): void {
    this.state.remainingMovement = 0;
    // Don't reset actions and quick actions - movement alone should not end a creature's turn
    // this.state.remainingActions = 0;
    // this.state.remainingQuickActions = 0;
  }

  recordTurnStartPosition(position: CreaturePosition): void {
    this.turnStartPosition = { ...position };
  }

  recordTurnEndPosition(): void {
    // This method is a no-op in the state manager
    // The base creature class handles recording the current position
  }

  // --- Updates ---

  updateMaxValues(
    maxMovement: number,
    maxActions: number,
    maxQuickActions: number,
    maxVitality: number,
    maxMana: number,
    maxFortune: number
  ): void {
    this.maxMovement = maxMovement;
    this.maxActions = maxActions;
    this.maxQuickActions = maxQuickActions;
    this.maxVitality = maxVitality;
    this.maxMana = maxMana;
    this.maxFortune = maxFortune;
  }
}
