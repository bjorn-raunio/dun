import { Region as RegionType, RegionConnection } from './types';

export class Region implements RegionType {
  public id: string;
  public name: string;
  public description: string;
  public image: string;
  public position: { x: number; y: number };
  public vertices: Array<{ x: number; y: number }>;
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
    this.vertices = data.vertices;
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
   * Check if a position is within this region's bounds using point-in-polygon algorithm
   */
  isPositionWithinRegion(x: number, y: number): boolean {
    // Convert world coordinates to relative coordinates
    const relativeX = x - this.position.x;
    const relativeY = y - this.position.y;
    
    // Point-in-polygon algorithm (ray casting)
    let inside = false;
    for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
      const xi = this.vertices[i].x;
      const yi = this.vertices[i].y;
      const xj = this.vertices[j].x;
      const yj = this.vertices[j].y;
      
      if (((yi > relativeY) !== (yj > relativeY)) && 
          (relativeX < (xj - xi) * (relativeY - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  /**
   * Get the center position of the region based on vertices
   */
  getCenterPosition(): { x: number; y: number } {
    if (this.vertices.length === 0) {
      return this.position;
    }
    
    let sumX = 0;
    let sumY = 0;
    
    this.vertices.forEach(vertex => {
      sumX += vertex.x;
      sumY += vertex.y;
    });
    
    return {
      x: this.position.x + (sumX / this.vertices.length),
      y: this.position.y + (sumY / this.vertices.length)
    };
  }

  /**
   * Get the bounding box of the region
   */
  getBoundingBox(): { minX: number; minY: number; maxX: number; maxY: number } {
    if (this.vertices.length === 0) {
      return {
        minX: this.position.x,
        minY: this.position.y,
        maxX: this.position.x,
        maxY: this.position.y
      };
    }
    
    let minX = this.position.x + this.vertices[0].x;
    let minY = this.position.y + this.vertices[0].y;
    let maxX = this.position.x + this.vertices[0].x;
    let maxY = this.position.y + this.vertices[0].y;
    
    this.vertices.forEach(vertex => {
      const worldX = this.position.x + vertex.x;
      const worldY = this.position.y + vertex.y;
      
      minX = Math.min(minX, worldX);
      minY = Math.min(minY, worldY);
      maxX = Math.max(maxX, worldX);
      maxY = Math.max(maxY, worldY);
    });
    
    return { minX, minY, maxX, maxY };
  }

  /**
   * Get the approximate area of the region
   */
  getArea(): number {
    if (this.vertices.length < 3) {
      return 0;
    }
    
    let area = 0;
    for (let i = 0; i < this.vertices.length; i++) {
      const j = (i + 1) % this.vertices.length;
      area += this.vertices[i].x * this.vertices[j].y;
      area -= this.vertices[j].x * this.vertices[i].y;
    }
    
    return Math.abs(area) / 2;
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
