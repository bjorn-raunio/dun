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
    return !this.isAlive();
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

  canUseQuickAction(): boolean {
    if (this.isDead()) {
      return false;
    }
    return this.state.remainingQuickActions > 0 || this.state.remainingActions > 0;
  }

  useQuickAction(): void {
    if (!this.canUseQuickAction()) {
      return;
    }
    if (this.state.remainingQuickActions > 0) {
      this.state.remainingQuickActions--;
    } else {
      this.useAction();
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

  setRemainingMana(value: number): void {
    this.state.remainingMana = Math.max(0, Math.min(value, this.getMaxMana()));
  }

  // --- Turn Management ---

  startTurn(): void {
    if (!this.isDead()) {
      this.state.remainingMovement = this.getMaxMovement();
      this.state.remainingActions = this.getMaxActions();
      this.state.remainingQuickActions = this.getMaxQuickActions();
    }
    this.state.hasMovedWhileEngaged = false;
  }

  endTurn(): void {
    this.state.remainingMovement = 0;
    this.state.remainingActions = 0;
    this.state.remainingQuickActions = 0;
  }

  resetRemainingActions(): void {
    this.state.remainingMovement = 0;
  }

  recordTurnStartPosition(position: CreaturePosition): void {
    this.turnStartPosition = { ...position };
  }
}
