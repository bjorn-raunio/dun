import { IWorldMap as WorldMapType, IRegion as RegionType, RegionConnection, WorldMapState } from './types';
import { Region } from './Region';

export class WorldMap implements WorldMapType {
  public id: string;
  public name: string;
  public description: string;
  public backgroundImage: string;
  public regions: Map<string, Region>;
  public startingRegionId: string;
  public discoveredRegions: Set<string>;
  public globalEvents: string[];
  public weather: { current: string; forecast: string[] };
  public timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  public season: 'spring' | 'summer' | 'autumn' | 'winter';

  constructor(data: WorldMapType) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.backgroundImage = data.backgroundImage;
    this.regions = new Map();
    this.startingRegionId = data.startingRegionId;
    this.discoveredRegions = new Set(data.discoveredRegions);
    this.globalEvents = data.globalEvents;
    this.weather = data.weather;
    this.timeOfDay = data.timeOfDay;
    this.season = data.season;

    // Convert region data to Region instances
    data.regions.forEach((regionData, id) => {
      this.regions.set(id, new Region(regionData));
    });
  }

  /**
   * Add a new region to the world
   */
  addRegion(region: Region): void {
    if (this.regions.has(region.id)) {
      throw new Error(`Region with ID ${region.id} already exists`);
    }
    this.regions.set(region.id, region);
  }

  /**
   * Remove a region from the world
   */
  removeRegion(regionId: string): boolean {
    const region = this.regions.get(regionId);
    if (!region) return false;

    // Remove all connections to this region from other regions
    this.regions.forEach(otherRegion => {
      otherRegion.removeConnection(regionId);
    });

    // Remove the region itself
    this.regions.delete(regionId);

    // Remove from discovered regions
    this.discoveredRegions.delete(regionId);

    // Note: current region is now managed by the party, not the worldmap

    return true;
  }

  /**
   * Get a region by ID
   */
  getRegion(regionId: string): Region | undefined {
    return this.regions.get(regionId);
  }

  /**
   * Get the starting region
   */
  getStartingRegion(): Region | undefined {
    return this.regions.get(this.startingRegionId);
  }

  /**
   * Travel to a new region
   */
  travelToRegion(currentRegionId: string, targetRegionId: string, connectionUsed: RegionConnection): boolean {
    const targetRegion = this.regions.get(targetRegionId);
    if (!targetRegion) return false;

    const currentRegion = this.regions.get(currentRegionId);
    if (!currentRegion) return false;

    // Check if the connection exists and is accessible
    const connection = currentRegion.getConnectionsTo(targetRegionId).find(
      (conn: RegionConnection) => conn === connectionUsed && !conn.isBlocked
    );

    if (!connection) {
      throw new Error(`Cannot travel to ${targetRegionId}: Invalid or blocked connection`);
    }

    // Check if the target region is accessible
    if (!targetRegion.isAccessible) {
      throw new Error(`Cannot travel to ${targetRegionId}: Region is not accessible`);
    }

    // Mark the target region as discovered
    this.discoveredRegions.add(targetRegionId);

    return true;
  }

  /**
   * Get all regions that can be reached from a specific region
   */
  getReachableRegions(currentRegionId: string): Region[] {
    const currentRegion = this.regions.get(currentRegionId);
    if (!currentRegion) return [];

    const reachableRegions: Region[] = [];
    const accessibleConnections = currentRegion.getAccessibleConnections();

    accessibleConnections.forEach((connection: RegionConnection) => {
      const targetRegion = this.regions.get(connection.targetRegionId);
      if (targetRegion && targetRegion.isAccessible) {
        reachableRegions.push(targetRegion);
      }
    });

    return reachableRegions;
  }

  /**
   * Find the shortest path between two regions
   */
  findPath(fromRegionId: string, toRegionId: string): string[] | null {
    const visited = new Set<string>();
    const queue: Array<{ regionId: string; path: string[] }> = [
      { regionId: fromRegionId, path: [fromRegionId] }
    ];

    while (queue.length > 0) {
      const { regionId, path } = queue.shift()!;
      
      if (regionId === toRegionId) {
        return path;
      }

      if (visited.has(regionId)) continue;
      visited.add(regionId);

      const region = this.regions.get(regionId);
      if (!region) continue;

      const accessibleConnections = region.getAccessibleConnections();
      accessibleConnections.forEach(connection => {
        const targetRegionId = connection.targetRegionId;
        const targetRegion = this.regions.get(targetRegionId);
        
        if (targetRegion && targetRegion.isAccessible && !visited.has(targetRegionId)) {
          queue.push({
            regionId: targetRegionId,
            path: [...path, targetRegionId]
          });
        }
      });
    }

    return null; // No path found
  }

  /**
   * Get all regions of a specific type
   */
  getRegionsByType(type: RegionType['type']): Region[] {
    const regions: Region[] = [];
    this.regions.forEach(region => {
      if (region.type === type) {
        regions.push(region);
      }
    });
    return regions;
  }

  /**
   * Get all unexplored regions
   */
  getUnexploredRegions(): Region[] {
    const regions: Region[] = [];
    this.regions.forEach(region => {
      if (!region.isExplored) {
        regions.push(region);
      }
    });
    return regions;
  }

  /**
   * Add a global event
   */
  addGlobalEvent(event: string): void {
    this.globalEvents.push(event);
  }

  /**
   * Remove a global event
   */
  removeGlobalEvent(event: string): boolean {
    const index = this.globalEvents.indexOf(event);
    if (index > -1) {
      this.globalEvents.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Update weather
   */
  updateWeather(newWeather: string, forecast: string[]): void {
    this.weather.current = newWeather;
    this.weather.forecast = forecast;
  }

  /**
   * Update time of day
   */
  updateTimeOfDay(newTime: 'dawn' | 'day' | 'dusk' | 'night'): void {
    this.timeOfDay = newTime;
  }

  /**
   * Update season
   */
  updateSeason(newSeason: 'spring' | 'summer' | 'autumn' | 'winter'): void {
    this.season = newSeason;
  }

  /**
   * Get the world map state
   */
  getState(currentRegionId: string): WorldMapState {
    const currentRegion = this.regions.get(currentRegionId);
    const availableConnections = currentRegion ? currentRegion.getAccessibleConnections() : [];

    return {
      worldMap: {
        ...this,
        regions: this.regions,
        discoveredRegions: this.discoveredRegions,
      },
      currentRegion: currentRegion || null,
      availableConnections,
      travelHistory: [], // This would be populated by the game system
    };
  }

  /**
   * Clone the world map
   */
  clone(): WorldMap {
    const clonedRegions = new Map<string, Region>();
    this.regions.forEach((region, id) => {
      clonedRegions.set(id, region.clone());
    });

    return new WorldMap({
      ...this,
      regions: clonedRegions,
      discoveredRegions: new Set(this.discoveredRegions),
      globalEvents: [...this.globalEvents],
      weather: { ...this.weather, forecast: [...this.weather.forecast] },
    });
  }

  /**
   * Get a summary of the world map
   */
  getSummary(currentRegionId: string): string {
    const totalRegions = this.regions.size;
    const discoveredCount = this.discoveredRegions.size;
    const currentRegion = this.regions.get(currentRegionId);
    
    return `${this.name}: ${discoveredCount}/${totalRegions} regions discovered. Currently in: ${currentRegion?.name || 'Unknown'}`;
  }
}
