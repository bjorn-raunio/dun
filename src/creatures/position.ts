import { CreaturePosition } from './types';
import { DIRECTION_ARROWS, DIRECTION_NAMES, DIRECTION_SHORT_NAMES } from '../utils/constants';
import { getCreatureDimensions } from '../utils/dimensions';

// --- Creature Position Management ---

export class CreaturePositionManager {
  private position: CreaturePosition;

  constructor(initialPosition: CreaturePosition) {
    this.position = { ...initialPosition };
  }

  // --- Position Getters ---

  getPosition(): CreaturePosition {
    return { ...this.position };
  }

  getX(): number {
    return this.position.x;
  }

  getY(): number {
    return this.position.y;
  }

  getFacing(): number {
    return this.position.facing;
  }

  // --- Position Setters ---

  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
  }

  setFacing(facing: number): void {
    this.position.facing = ((facing % 8) + 8) % 8; // Ensure 0-7 range
  }

  // --- Facing Calculations ---

  getFacingDegrees(): number {
    return this.position.facing * 45; // 0=0°, 1=45°, 2=90°, etc.
  }

  getFacingArrow(): string {
    return DIRECTION_ARROWS[this.position.facing as keyof typeof DIRECTION_ARROWS];
  }

  getFacingName(): string {
    return DIRECTION_NAMES[this.position.facing as keyof typeof DIRECTION_NAMES];
  }

  getFacingShortName(): string {
    return DIRECTION_SHORT_NAMES[this.position.facing as keyof typeof DIRECTION_SHORT_NAMES];
  }

  // --- Movement and Facing ---

  faceDirection(direction: number): void {
    this.setFacing(direction);
  }

  faceTowards(targetX: number, targetY: number): void {
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    
    if (dx === 0 && dy === 0) return; // Already at target
    
    // Calculate angle and convert to 8-direction facing
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const direction = Math.round((angle + 90) / 45) % 8; // +90 to align North=0
    this.setFacing(direction);
  }

  // --- Dimensions ---

  getDimensions(size: number): { w: number; h: number } {
    return getCreatureDimensions(size);
  }
}
