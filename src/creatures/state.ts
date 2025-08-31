import { CreatureState, CreaturePosition } from './types';

// --- Creature State Management ---

export class CreatureStateManager {
  private state: CreatureState;
  private turnStartPosition: CreaturePosition;

  constructor(
    private getMaxMovement: () => number,
    private getMaxActions: () => number,
    private getMaxQuickActions: () => number,
    private getMaxVitality: () => number,
    private getMaxMana: () => number,
    private getMaxFortune: () => number,
    private initialPosition: CreaturePosition
  ) {
    this.state = {
      remainingMovement: this.getMaxMovement(),
      remainingActions: this.getMaxActions(),
      remainingQuickActions: this.getMaxQuickActions(),
      remainingVitality: this.getMaxVitality(),
      remainingMana: this.getMaxMana(),
      remainingFortune: this.getMaxFortune(),
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
    // Creatures with 0 or negative vitality are dead, not wounded
    if (this.state.remainingVitality <= 0) {
      return false;
    }
    
    if (size < 4) {
      return this.state.remainingVitality <= 1;
    } else {
      return this.state.remainingVitality <= 5;
    }
  }

  hasMoved(effectiveMovement?: number): boolean {
    // Dead creatures cannot have moved
    if (this.isDead()) {
      return false;
    }
    // Use effective movement (with skill modifiers) if provided, otherwise fall back to base maxMovement
    const expectedMovement = effectiveMovement ?? this.getMaxMovement();
    return this.state.remainingMovement !== expectedMovement;
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
           this.state.remainingActions < this.getMaxActions() || 
           this.state.remainingQuickActions < this.getMaxQuickActions();
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

  setRemainingVitality(value: number): void {
    this.state.remainingVitality = Math.max(0, Math.min(value, this.getMaxVitality()));
  }

  // --- Turn Management ---

  resetTurn(): void {
    // If creature is dead, set movement, actions, and quick actions to 0
    if (this.isDead()) {
      this.state.remainingMovement = 0;
      this.state.remainingActions = 0;
      this.state.remainingQuickActions = 0;
    } else {
      // Reset to base maxMovement - effective movement will be set separately by the creature class
      this.state.remainingMovement = this.getMaxMovement();
      this.state.remainingActions = this.getMaxActions();
      this.state.remainingQuickActions = this.getMaxQuickActions();
    }
    this.state.remainingMana = this.getMaxMana();
    this.state.remainingFortune = this.getMaxFortune();
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
    // This method is now deprecated since we use function callbacks
    // The values are retrieved dynamically when needed
    // Keeping for backward compatibility but it's a no-op
  }
}
