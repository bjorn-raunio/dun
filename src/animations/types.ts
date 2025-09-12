// Animation system types and interfaces

export interface AnimationState {
  id: string;
  type: AnimationType;
  startTime: number;
  duration: number;
  progress: number; // 0 to 1
  isComplete: boolean;
  data: AnimationData;
}

export type AnimationType = 
  | 'movement'
  | 'attack'
  | 'spell_cast'
  | 'damage'
  | 'heal'
  | 'status_effect'
  | 'death';

export interface AnimationData {
  creatureId: string;
  startPosition?: { x: number; y: number };
  endPosition?: { x: number; y: number };
  targetId?: string;
  targetPosition?: { x: number; y: number };
  damage?: number;
  heal?: number;
  statusEffect?: string;
  spellName?: string;
  attackType?: 'melee' | 'ranged';
  direction?: number; // facing direction
  hitTriggered?: boolean;
  effectTriggered?: boolean;
}

export interface AnimationConfig {
  movement: {
    duration: number; // ms
    easing: EasingFunction;
  };
  attack: {
    duration: number;
    easing: EasingFunction;
    hitDelay: number; // when to show hit effect
  };
  spell_cast: {
    duration: number;
    easing: EasingFunction;
    effectDelay: number; // when to show spell effect
  };
  damage: {
    duration: number;
    easing: EasingFunction;
    bounceHeight: number;
  };
  heal: {
    duration: number;
    easing: EasingFunction;
    bounceHeight: number;
  };
  status_effect: {
    duration: number;
    easing: EasingFunction;
  };
  death: {
    duration: number;
    easing: EasingFunction;
  };
}

export type EasingFunction = 
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'elastic';

export interface AnimationManager {
  animations: Map<string, AnimationState>;
  config: AnimationConfig;
  enabled: boolean;
  setEnabled(enabled: boolean): void;
  addAnimation(animation: Omit<AnimationState, 'id' | 'startTime' | 'progress' | 'isComplete'>): string;
  updateAnimations(currentTime: number): void;
  removeAnimation(id: string): void;
  clearAnimations(): void;
  getAnimationProgress(id: string): number;
  isAnimationComplete(id: string): boolean;
}

// Animation event types for communication with game systems
export interface AnimationEvent {
  type: 'animation_start' | 'animation_complete' | 'animation_hit' | 'animation_effect';
  animationId: string;
  animationType: AnimationType;
  data: AnimationData;
  timestamp: number;
}
