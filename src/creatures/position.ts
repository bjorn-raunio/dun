import { CreaturePosition, CreaturePositionOrUndefined } from './types';
import { DIRECTION_ARROWS, DIRECTION_NAMES, DIRECTION_SHORT_NAMES } from '../utils/constants';
import { getCreatureDimensions } from '../utils/dimensions';

// --- Creature Position Management ---

export class CreaturePositionManager {
  private position: CreaturePositionOrUndefined;

  constructor(initialPosition?: CreaturePosition) {
    this.position = initialPosition ? { ...initialPosition } : undefined;
  }

  // --- Position Getters ---

  getPosition(): CreaturePositionOrUndefined {
    return this.position ? { ...this.position } : undefined;
  }

  getX(): number | undefined {
    return this.position?.x;
  }

  getY(): number | undefined {
    return this.position?.y;
  }

  getFacing(): number | undefined {
    return this.position?.facing;
  }

  isOnMap(): boolean {
    return this.position !== undefined;
  }

  // --- Position Setters ---

  setPosition(x: number, y: number): void {
    if (!this.position) {
      this.position = { x, y, facing: 0 };
    } else {
      this.position.x = x;
      this.position.y = y;
    }
  }

  setFacing(facing: number): void {
    if (!this.position) {
      this.position = { x: 0, y: 0, facing: ((facing % 8) + 8) % 8 };
    } else {
      this.position.facing = ((facing % 8) + 8) % 8; // Ensure 0-7 range
    }
  }

  removeFromMap(): void {
    this.position = undefined;
  }

  // --- Facing Calculations ---

  getFacingDegrees(): number | undefined {
    return this.position?.facing !== undefined ? this.position.facing * 45 : undefined; // 0=0°, 1=45°, 2=90°, etc.
  }

  getFacingArrow(): string | undefined {
    return this.position?.facing !== undefined ? DIRECTION_ARROWS[this.position.facing as keyof typeof DIRECTION_ARROWS] : undefined;
  }

  getFacingName(): string | undefined {
    return this.position?.facing !== undefined ? DIRECTION_NAMES[this.position.facing as keyof typeof DIRECTION_NAMES] : undefined;
  }

  getFacingShortName(): string | undefined {
    return this.position?.facing !== undefined ? DIRECTION_SHORT_NAMES[this.position.facing as keyof typeof DIRECTION_SHORT_NAMES] : undefined;
  }

  // --- Movement and Facing ---

  faceDirection(direction: number): void {
    this.setFacing(direction);
  }

  faceTowards(targetX: number, targetY: number): void {
    if (!this.position) return; // Cannot face towards if not on map
    
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
