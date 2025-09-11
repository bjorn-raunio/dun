import { QuestMap, Room } from '../maps/types';
import { QuestMapPreset } from '../maps/presets/types';
import { createQuestMapFromPreset } from '../maps/presets/factory';
import { ICreature } from '../creatures/index';

// Helper function to fail tests
const fail = (message?: string) => {
  throw new Error(message || 'Test failed');
};

/**
 * Test suite for QuestMap validation
 * Ensures all rooms have connections, monsters don't overlap with high terrain, and rooms don't overlap
 */

describe('QuestMap Validation', () => {
  // Shared test quest maps for all validation tests
  const testQuestMaps: QuestMapPreset[] = [

  ];

  /**
   * Helper function to get all rooms connected to a specific room
   */
  function getConnectedRooms(room: Room, questMap: QuestMap): Room[] {
    const connectedRooms: Room[] = [];
    
    // Check all connections directly (not just explored ones)
    for (const connection of questMap.connections) {
      // Check if this connection intersects with the current room
      const roomIntersectsConnection = room.sections.some(section => {
        return sectionsIntersect(
          section.x, section.y, section.rotatedWidth, section.rotatedHeight,
          connection.x, connection.y, connection.rotatedWidth, connection.rotatedHeight
        );
      });
      
      if (roomIntersectsConnection) {
        // Find other rooms that also intersect with this connection
        const otherRoomsAtConnection = questMap._rooms.filter(otherRoom => 
          otherRoom !== room && otherRoom.sections.some(otherSection => {
            return sectionsIntersect(
              otherSection.x, otherSection.y, otherSection.rotatedWidth, otherSection.rotatedHeight,
              connection.x, connection.y, connection.rotatedWidth, connection.rotatedHeight
            );
          })
        );
        
        connectedRooms.push(...otherRoomsAtConnection);
      }
    }
    
    // Remove duplicates
    return Array.from(new Set(connectedRooms));
  }

  /**
   * Helper function to check if two rectangular areas intersect
   */
  function sectionsIntersect(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
  }

  /**
   * Helper function to check if a creature overlaps with high terrain
   */
  function creatureOverlapsHighTerrain(creature: ICreature, questMap: QuestMap): boolean {
    if (creature.x === undefined || creature.y === undefined) {
      return false; // Creature not positioned
    }

    const creatureX = creature.x;
    const creatureY = creature.y;
    const creatureWidth = creature.mapWidth || 1;
    const creatureHeight = creature.mapHeight || 1;

    // Check each tile the creature occupies
    for (let dy = 0; dy < creatureHeight; dy++) {
      for (let dx = 0; dx < creatureWidth; dx++) {
        const tileX = creatureX + dx;
        const tileY = creatureY + dy;
        
        const terrainHeight = questMap.terrainHeightAt(tileX, tileY);
        if (terrainHeight > 0) {
          return true; // Creature overlaps with elevated terrain
        }
      }
    }

    return false;
  }

  /**
   * Helper function to check if two room sections overlap
   */
  function roomSectionsOverlap(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
  }

  /**
   * Helper function to check if any rooms in a quest map overlap
   */
  function roomsOverlap(questMap: QuestMap): Array<{ room1: Room; room2: Room; overlappingSections: Array<{ section1: any; section2: any }> }> {
    const overlaps: Array<{ room1: Room; room2: Room; overlappingSections: Array<{ section1: any; section2: any }> }> = [];
    
    for (let i = 0; i < questMap._rooms.length; i++) {
      for (let j = i + 1; j < questMap._rooms.length; j++) {
        const room1 = questMap._rooms[i];
        const room2 = questMap._rooms[j];
        const overlappingSections: Array<{ section1: any; section2: any }> = [];
        
        // Check each section of room1 against each section of room2
        for (const section1 of room1.sections) {
          for (const section2 of room2.sections) {
            if (roomSectionsOverlap(
              section1.x, section1.y, section1.rotatedWidth, section1.rotatedHeight,
              section2.x, section2.y, section2.rotatedWidth, section2.rotatedHeight
            )) {
              overlappingSections.push({ section1, section2 });
            }
          }
        }
        
        if (overlappingSections.length > 0) {
          overlaps.push({ room1, room2, overlappingSections });
        }
      }
    }
    
    return overlaps;
  }

  /**
   * Test that all rooms have at least one connection to another room
   */
  describe('Room Connectivity', () => {
    it('should ensure all rooms have at least one connection to another room', () => {
      for (const preset of testQuestMaps) {
        const questMap = createQuestMapFromPreset(preset, 4);
        if (!questMap) {
          fail(`Failed to create quest map from preset: ${preset.name}`);
          continue;
        }

        // Check each room for connectivity (skip if only one room)
        if (questMap._rooms.length > 1) {
          for (const room of questMap._rooms) {
            const connectedRooms = getConnectedRooms(room, questMap);
            
            if (connectedRooms.length === 0) {
              fail(`Room in quest map "${preset.name}" has no connections to other rooms. ` +
                `Room sections: ${room.sections.map(s => `(${s.x},${s.y},${s.rotatedWidth}x${s.rotatedHeight})`).join(', ')}`);
            }
          }
        }
      }
    });

    it('should ensure rooms form a connected graph (all rooms reachable)', () => {
      for (const preset of testQuestMaps) {
        const questMap = createQuestMapFromPreset(preset, 4);
        if (!questMap) {
          fail(`Failed to create quest map from preset: ${preset.name}`);
          continue;
        }

        if (questMap._rooms.length <= 1) {
          continue; // Single room or no rooms - no connectivity issues
        }

        // Use BFS to check if all rooms are reachable from the first room
        const visited = new Set<Room>();
        const queue: Room[] = [questMap._rooms[0]];
        visited.add(questMap._rooms[0]);

        while (queue.length > 0) {
          const currentRoom = queue.shift()!;
          const connectedRooms = getConnectedRooms(currentRoom, questMap);
          
          for (const connectedRoom of connectedRooms) {
            if (!visited.has(connectedRoom)) {
              visited.add(connectedRoom);
              queue.push(connectedRoom);
            }
          }
        }

        if (visited.size !== questMap._rooms.length) {
          fail(`Quest map "${preset.name}" has disconnected rooms. ` +
            `Only ${visited.size} out of ${questMap._rooms.length} rooms are reachable.`);
        }
      }
    });
  });

  /**
   * Test that rooms don't overlap with each other
   */
  describe('Room Overlap Validation', () => {
    it('should ensure no rooms overlap with each other', () => {
      for (const preset of testQuestMaps) {
        const questMap = createQuestMapFromPreset(preset, 4);
        if (!questMap) {
          fail(`Failed to create quest map from preset: ${preset.name}`);
          continue;
        }

        const overlaps = roomsOverlap(questMap);
        
        if (overlaps.length > 0) {
          const overlapDetails = overlaps.map(overlap => {
            const sectionDetails = overlap.overlappingSections.map(section => 
              `Section 1: (${section.section1.x},${section.section1.y},${section.section1.rotatedWidth}x${section.section1.rotatedHeight}) ` +
              `overlaps with Section 2: (${section.section2.x},${section.section2.y},${section.section2.rotatedWidth}x${section.section2.rotatedHeight})`
            ).join('; ');
            return `Rooms overlap: ${sectionDetails}`;
          }).join('\n');
          
          fail(`Quest map "${preset.name}" has overlapping rooms:\n${overlapDetails}`);
        }
      }
    });

    it('should provide detailed information about room positions for debugging', () => {
      for (const preset of testQuestMaps) {
        const questMap = createQuestMapFromPreset(preset, 4);
        if (!questMap) {
          continue;
        }

        // Log room positions for debugging
        const roomPositions = questMap._rooms.map((room, index) => {
          const sectionPositions = room.sections.map(section => 
            `(${section.x},${section.y},${section.rotatedWidth}x${section.rotatedHeight})`
          ).join(', ');
          return `Room ${index}: [${sectionPositions}]`;
        }).join('\n');

        console.log(`Quest map "${preset.name}" room positions:\n${roomPositions}`);
        
        // This test passes but provides debugging information
        expect(roomPositions).toBeDefined();
      }
    });
  });

  /**
   * Test that monsters don't overlap with terrain that has height > 0
   */
  describe('Monster-Terrain Overlap', () => {
    it('should ensure monsters do not overlap with terrain height > 0', () => {
      for (const preset of testQuestMaps) {
        const questMap = createQuestMapFromPreset(preset, 4);
        if (!questMap) {
          fail(`Failed to create quest map from preset: ${preset.name}`);
          continue;
        }

        // Check each creature for terrain overlap
        for (const creature of questMap.initialCreatures) {
          const overlapsHighTerrain = creatureOverlapsHighTerrain(creature, questMap);
          
          if (overlapsHighTerrain) {
            fail(`Creature "${creature.name}" in quest map "${preset.name}" overlaps with terrain height > 0. ` +
              `Position: (${creature.x}, ${creature.y}), Size: ${creature.mapWidth || 1}x${creature.mapHeight || 1}`);
          }
        }
      }
    });

    it('should provide detailed information about terrain heights at creature positions', () => {
      for (const preset of testQuestMaps) {
        const questMap = createQuestMapFromPreset(preset, 4);
        if (!questMap) {
          continue;
        }

        for (const creature of questMap.initialCreatures) {
          if (creature.x === undefined || creature.y === undefined) {
            continue;
          }

          const creatureX = creature.x;
          const creatureY = creature.y;
          const creatureWidth = creature.mapWidth || 1;
          const creatureHeight = creature.mapHeight || 1;

          // Log terrain heights for debugging
          const terrainHeights: number[][] = [];
          for (let dy = 0; dy < creatureHeight; dy++) {
            const row: number[] = [];
            for (let dx = 0; dx < creatureWidth; dx++) {
              const tileX = creatureX + dx;
              const tileY = creatureY + dy;
              const height = questMap.terrainHeightAt(tileX, tileY);
              row.push(height);
            }
            terrainHeights.push(row);
          }

          // This test passes but provides debugging information
          expect(terrainHeights).toBeDefined();
          console.log(`Creature "${creature.name}" at (${creatureX}, ${creatureY}) terrain heights:`, terrainHeights);
        }
      }
    });
  });

  /**
   * Integration test that validates connectivity, terrain overlap, and room overlap
   */
  describe('Quest Map Integration Validation', () => {
    it('should validate room connectivity, monster-terrain overlap, and room overlap for all quest maps', () => {
      const validationResults: Array<{
        presetName: string;
        connectivityIssues: string[];
        terrainOverlapIssues: string[];
        roomOverlapIssues: string[];
      }> = [];

      for (const preset of testQuestMaps) {
        const questMap = createQuestMapFromPreset(preset, 4);
        if (!questMap) {
          validationResults.push({
            presetName: preset.name,
            connectivityIssues: ['Failed to create quest map'],
            terrainOverlapIssues: [],
            roomOverlapIssues: []
          });
          continue;
        }

        const result = {
          presetName: preset.name,
          connectivityIssues: [] as string[],
          terrainOverlapIssues: [] as string[],
          roomOverlapIssues: [] as string[]
        };

        // Check connectivity (skip if only one room)
        if (questMap._rooms.length > 1) {
          for (let i = 0; i < questMap._rooms.length; i++) {
            const room = questMap._rooms[i];
            const connectedRooms = getConnectedRooms(room, questMap);
            
            if (connectedRooms.length === 0) {
              result.connectivityIssues.push(
                `Room ${i} has no connections to other rooms`
              );
            }
          }
        }

        // Check terrain overlap
        for (const creature of questMap.initialCreatures) {
          if (creatureOverlapsHighTerrain(creature, questMap)) {
            result.terrainOverlapIssues.push(
              `Creature "${creature.name}" overlaps with terrain height > 0`
            );
          }
        }

        // Check room overlap
        const overlaps = roomsOverlap(questMap);
        for (const overlap of overlaps) {
          const sectionDetails = overlap.overlappingSections.map(section => 
            `Section (${section.section1.x},${section.section1.y},${section.section1.rotatedWidth}x${section.section1.rotatedHeight}) ` +
            `overlaps with Section (${section.section2.x},${section.section2.y},${section.section2.rotatedWidth}x${section.section2.rotatedHeight})`
          ).join('; ');
          result.roomOverlapIssues.push(`Rooms overlap: ${sectionDetails}`);
        }

        validationResults.push(result);
      }

      // Report all issues
      const allIssues = validationResults.filter(result => 
        result.connectivityIssues.length > 0 || result.terrainOverlapIssues.length > 0 || result.roomOverlapIssues.length > 0
      );

      if (allIssues.length > 0) {
        const issueReport = allIssues.map(result => {
          const issues = [
            ...result.connectivityIssues.map(issue => `  - Connectivity: ${issue}`),
            ...result.terrainOverlapIssues.map(issue => `  - Terrain: ${issue}`),
            ...result.roomOverlapIssues.map(issue => `  - Room Overlap: ${issue}`)
          ];
          return `${result.presetName}:\n${issues.join('\n')}`;
        }).join('\n\n');

        fail(`Quest map validation failed:\n\n${issueReport}`);
      }

      // If we get here, all validations passed
      expect(allIssues.length).toBe(0);
    });
  });
});
