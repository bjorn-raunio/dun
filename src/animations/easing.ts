// Easing functions for smooth animations

export type EasingFunction = 
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'elastic';

export function applyEasing(t: number, easing: EasingFunction): number {
  // Clamp t between 0 and 1
  t = Math.max(0, Math.min(1, t));
  
  switch (easing) {
    case 'linear':
      return t;
    
    case 'ease-in':
      return t * t;
    
    case 'ease-out':
      return 1 - (1 - t) * (1 - t);
    
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    case 'bounce':
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      }
    
    case 'elastic':
      if (t === 0) return 0;
      if (t === 1) return 1;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
    
    default:
      return t;
  }
}

// Special easing for movement with constant speed (linear interpolation)
export function applyMovementEasing(t: number, easing: EasingFunction): { x: number; y: number; z: number } {
  // Use linear interpolation for constant speed movement
  // Ignore the easing parameter for movement to ensure constant speed
  const linearT = t;
  
  return {
    x: linearT,
    y: linearT,
    z: 0 // No arc - flat movement
  };
}
