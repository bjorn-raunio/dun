import { Region as RegionType, RegionConnection } from './types';

export class Region implements RegionType {
  public id: string;
  public name: string;
  public description: string;
  public image: string;
  public position: { x: number; y: number };
  public size: { width: number; height: number };
  public connections: RegionConnection[];
  public type: RegionType['type'];
  public difficulty: number;
  public isExplored: boolean;
  public isAccessible: boolean;
  public requirements?: string[];
  public encounters?: string[];
  public resources?: string[];

  constructor(data: RegionType) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.image = data.image;
    this.position = data.position;
    this.size = data.size;
    this.connections = data.connections;
    this.type = data.type;
    this.difficulty = data.difficulty;
    this.isExplored = data.isExplored;
    this.isAccessible = data.isAccessible;
    this.requirements = data.requirements;
    this.encounters = data.encounters;
    this.resources = data.resources;
  }

  /**
   * Add a connection to another region
   */
  addConnection(connection: RegionConnection): void {
    // Check if connection already exists
    const existingConnection = this.connections.find(
      conn => conn.targetRegionId === connection.targetRegionId
    );
    
    if (existingConnection) {
      throw new Error(`Connection to region ${connection.targetRegionId} already exists`);
    }
    
    this.connections.push(connection);
  }

  /**
   * Remove a connection to another region
   */
  removeConnection(targetRegionId: string): boolean {
    const initialLength = this.connections.length;
    this.connections = this.connections.filter(
      conn => conn.targetRegionId !== targetRegionId
    );
    return this.connections.length < initialLength;
  }

  /**
   * Get all connections to a specific region
   */
  getConnectionsTo(targetRegionId: string): RegionConnection[] {
    return this.connections.filter(conn => conn.targetRegionId === targetRegionId);
  }

  /**
   * Check if this region is connected to another region
   */
  isConnectedTo(targetRegionId: string): boolean {
    return this.connections.some(conn => conn.targetRegionId === targetRegionId);
  }

  /**
   * Get all accessible connections (not blocked)
   */
  getAccessibleConnections(): RegionConnection[] {
    return this.connections.filter(conn => !conn.isBlocked);
  }

  /**
   * Block a connection to another region
   */
  blockConnection(targetRegionId: string, reason: string): boolean {
    const connection = this.connections.find(conn => conn.targetRegionId === targetRegionId);
    if (connection) {
      connection.isBlocked = true;
      connection.blockReason = reason;
      return true;
    }
    return false;
  }

  /**
   * Unblock a connection to another region
   */
  unblockConnection(targetRegionId: string): boolean {
    const connection = this.connections.find(conn => conn.targetRegionId === targetRegionId);
    if (connection) {
      connection.isBlocked = false;
      connection.blockReason = undefined;
      return true;
    }
    return false;
  }

  /**
   * Mark the region as explored
   */
  markAsExplored(): void {
    this.isExplored = true;
  }

  /**
   * Check if a position is within this region's bounds
   */
  isPositionWithinRegion(x: number, y: number): boolean {
    return x >= this.position.x && 
           x <= this.position.x + this.size.width &&
           y >= this.position.y && 
           y <= this.position.y + this.size.height;
  }

  /**
   * Get the center position of the region
   */
  getCenterPosition(): { x: number; y: number } {
    return {
      x: this.position.x + (this.size.width / 2),
      y: this.position.y + (this.size.height / 2)
    };
  }

  /**
   * Calculate distance to another region
   */
  getDistanceTo(otherRegion: Region): number {
    const center1 = this.getCenterPosition();
    const center2 = otherRegion.getCenterPosition();
    
    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Clone the region
   */
  clone(): Region {
    return new Region({
      ...this,
      connections: [...this.connections],
      requirements: this.requirements ? [...this.requirements] : undefined,
      encounters: this.encounters ? [...this.encounters] : undefined,
      resources: this.resources ? [...this.resources] : undefined,
    });
  }

  /**
   * Get a summary of the region
   */
  getSummary(): string {
    return `${this.name} (${this.type}) - Difficulty: ${this.difficulty}/10 - ${this.connections.length} connections`;
  }
}
