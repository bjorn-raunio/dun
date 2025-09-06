// AI Types - no imports needed to avoid circular dependencies

// --- AI Types ---

export class AIBehaviorType {
  public readonly name: string;
  public readonly priority: number; // Lower numbers = higher priority in turn order
  public pushInMelee: boolean;
  public followInMelee: boolean;
  public keepDistance: boolean;

  constructor(
    name: string,
    priority: number,
    pushInMelee: boolean,
    followInMelee: boolean,
    keepDistance: boolean
  ) {
    this.name = name;
    this.priority = priority;
    this.pushInMelee = pushInMelee;
    this.followInMelee = followInMelee;
    this.keepDistance = keepDistance;
  }

  // Helper methods
  shouldActBefore(other: AIBehaviorType): boolean {
    return this.priority < other.priority;
  }

  toString(): string {
    return this.name;
  }

  equals(other: AIBehaviorType): boolean {
    return this.name === other.name;
  }
}

export interface AIState {
  behavior: AIBehaviorType;
}
