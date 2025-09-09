import { displayDieRoll, rollD6 } from '../utils/dice';
import { addGameMessage } from '../utils/messageSystem';
import { CreatureState, CreaturePosition, CreaturePositionOrUndefined } from './types';

// --- Creature State Management ---

export class CreatureStateManager {
  private state: CreatureState;
  private turnStartPosition: CreaturePositionOrUndefined;

  constructor(
    private getMaxMovement: () => number,
    private getMaxActions: () => number,
    private getMaxQuickActions: () => number,
    private getMaxVitality: () => number,
    private getMaxMana: () => number,
    private getMaxFortune: () => number,
    private initialPosition?: CreaturePosition
  ) {
    this.state = {
      remainingMovement: this.getMaxMovement(),
      remainingActions: this.getMaxActions(),
      remainingQuickActions: this.getMaxQuickActions(),
      remainingVitality: this.getMaxVitality(),
      remainingMana: this.getMaxMana(),
      remainingFortune: this.getMaxFortune(),
      hasMovedWhileEngaged: false,
      pushedCreatures: new Set<string>() // Initialize pushedCreatures
    };

    this.turnStartPosition = initialPosition ? { ...initialPosition } : undefined;
  }

  // --- State Getters ---

  getState(): CreatureState {
    return { ...this.state };
  }

  getTurnStartPosition(): CreaturePositionOrUndefined {
    return this.turnStartPosition ? { ...this.turnStartPosition } : undefined;
  }

  /**
   * Update the getter functions to use effective values after the creature is fully initialized
   * This allows the state manager to access skill modifiers and status effects
   */
  updateGetters(
    getMaxMovement: () => number,
    getMaxActions: () => number,
    getMaxQuickActions: () => number,
    getMaxVitality: () => number,
    getMaxMana: () => number,
    getMaxFortune: () => number
  ): void {
    this.getMaxMovement = getMaxMovement;
    this.getMaxActions = getMaxActions;
    this.getMaxQuickActions = getMaxQuickActions;
    this.getMaxVitality = getMaxVitality;
    this.getMaxMana = getMaxMana;
    this.getMaxFortune = getMaxFortune;
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
    return this.hasMoved() ||
      this.state.remainingActions < this.getMaxActions() ||
      this.state.remainingQuickActions < this.getMaxQuickActions();
  }

  // --- State Modifiers ---

  takeDamage(damage: number): boolean {
    const remainingVitality = Math.max(0, this.state.remainingVitality - damage);
    if (remainingVitality <= 0) {
      const roll = rollD6();
      if (this.useFortune(1)) {
        addGameMessage(`Fortune ${displayDieRoll(roll)}`);
        if (roll >= 5) {
          return false;
        } else if (this.useFortune(1)) {
          return false;
        }
      }
    }
    this.state.remainingVitality = Math.max(0, this.state.remainingVitality - damage);
    return true;
  }

  useMovement(points: number): boolean {
    // Dead creatures cannot use movement
    if (this.isDead() || this.state.remainingMovement === 0) {
      return false;
    }
    this.state.remainingMovement = Math.max(0, this.state.remainingMovement - points);
    return true;
  }

  useAction(): boolean {
    // Dead creatures cannot use actions
    if (this.isDead() || this.state.remainingActions <= 0) {
      return false;
    }
    this.state.remainingActions--;    
    return true;
  }

  canUseQuickAction(): boolean {
    if (this.isDead()) {
      return false;
    }
    return this.state.remainingQuickActions > 0 || this.state.remainingActions > 0;
  }

  useQuickAction(): boolean {
    if (!this.canUseQuickAction()) {
      return false;
    }
    if (this.state.remainingQuickActions > 0) {
      this.state.remainingQuickActions--;
      return true;
    }
    return this.useAction();
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

  startTurn() {
    if (!this.isDead()) {
      this.state.remainingMovement = this.getMaxMovement();
      this.state.remainingActions = this.getMaxActions();
      this.state.remainingQuickActions = this.getMaxQuickActions();
    }
    this.state.hasMovedWhileEngaged = false;
    this.state.pushedCreatures.clear(); // Reset pushed creatures tracking for new turn
  }

  endTurn(): void {
    this.state.remainingMovement = 0;
    this.state.remainingActions = 0;
    this.state.remainingQuickActions = 0;
  }

  resetRemainingActions(): void {
    this.state.remainingMovement = 0;
  }

  recordTurnStartPosition(position: CreaturePositionOrUndefined): void {
    this.turnStartPosition = position ? { ...position } : undefined;
  }

  // --- Push Tracking ---

  canPushCreature(targetId: string): boolean {
    // Check if this creature has already pushed the target this turn
    return !this.state.pushedCreatures.has(targetId);
  }

  recordPushedCreature(targetId: string): void {
    // Mark this creature as pushed by this creature this turn
    this.state.pushedCreatures.add(targetId);
  }
}
