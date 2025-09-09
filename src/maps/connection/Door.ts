import { Connection } from './connection';

export class Door extends Connection {
    private _openImage: string;
    private _isOpen: boolean = false;
    private _isLocked: boolean = false;
    private _isBroken: boolean = false;
    private _lockDifficulty: number = 0; // 0 = no lock, higher = harder to pick

    constructor(
        x: number,
        y: number,
        mapWidth: number,
        mapHeight: number,
        image: string,
        openImage: string,
        rotation: 0 | 90 | 180 | 270 = 0,
        options?: {
            isOpen?: boolean;
            isLocked?: boolean;
            isBroken?: boolean;
            lockDifficulty?: number;
            breakDifficulty?: number;
            material?: 'wood' | 'iron' | 'stone' | 'magic';
        }
    ) {
        super(x, y, mapWidth, mapHeight, image, rotation);
        this._openImage = openImage;
        if (options) {
            this._isOpen = options.isOpen ?? false;
            this._isLocked = options.isLocked ?? false;
            this._isBroken = options.isBroken ?? false;
            this._lockDifficulty = options.lockDifficulty ?? 10;
        }
    }

    // Getters
    get isOpen(): boolean {
        return this._isOpen;
    }

    get isLocked(): boolean {
        return this._isLocked;
    }

    get isBroken(): boolean {
        return this._isBroken;
    }

    get lockDifficulty(): number {
        return this._lockDifficulty;
    }

    get isPassable(): boolean {
        return this._isOpen || this._isBroken;
    }

    get isBlocking(): boolean {
        return !this.isPassable;
    }

    get image(): string {
        return this._isOpen ? this._openImage : this._image;
    }

    getDescription() {
        return `Door (${this._isOpen ? 'open' : 'closed'})`;
    }

    // Door actions
    open(): boolean {
        if (this._isBroken) {
            return true; // Broken doors are always "open"
        }

        if (this._isLocked) {
            return false; // Cannot open locked doors
        }

        this._isOpen = true;
        return true;
    }

    close(): boolean {
        if (this._isBroken) {
            return false; // Cannot close broken doors
        }

        this._isOpen = false;
        return true;
    }

    lock(): boolean {
        if (this._isBroken || this._lockDifficulty === 0) {
            return false; // Cannot lock broken doors or doors without locks
        }

        this._isLocked = true;
        return true;
    }

    unlock(): boolean {
        this._isLocked = false;
        return true;
    }

    break(): boolean {

        this._isBroken = true;
        this._isOpen = true; // Broken doors are effectively open
        this._isLocked = false; // Broken doors cannot be locked
        return true;
    }

    // Attempt to pick the lock
    attemptLockPick(skillLevel: number): boolean {
        /*if (!this._isLocked || this._isBroken) {
          return false; // Cannot pick unlocked or broken doors
        }
        
        if (this._lockDifficulty === 0) {
          return false; // No lock to pick
        }
        
        // Simple skill check - can be enhanced with dice rolling
        const success = skillLevel >= this._lockDifficulty;
        if (success) {
          this._isLocked = false;
        }
        
        return success;*/
        return false;
    }

    // Attempt to break the door
    attemptBreak(strength: number): boolean {
        /*if (this._isBroken || this._breakDifficulty === 0) {
          return false; // Cannot break already broken or unbreakable doors
        }
        
        // Simple strength check - can be enhanced with dice rolling
        const success = strength >= this._breakDifficulty;
        if (success) {
          this.break();
        }
        
        return success;*/
        return false;
    }

    // Clone the door with current state
    clone(): Door {
        return new Door(
            this.x,
            this.y,
            this.mapWidth,
            this.mapHeight,
            this.image,
            this._openImage,
            this.rotation,
            {
                isOpen: this._isOpen,
                isLocked: this._isLocked,
                isBroken: this._isBroken,
                lockDifficulty: this._lockDifficulty,
            }
        );
    }
}
