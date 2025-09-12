import { Region } from '../worldmap/Region';

describe('Region Center Calculation', () => {
  test('should calculate center for simple rectangle', () => {
    const region = new Region({
      id: 'test-rect',
      name: 'Test Rectangle',
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ],
      connections: [],
      type: 'plains',
      isExplored: true,
      isAccessible: true
    });

    const center = region.getCenterPosition();
    expect(center.x).toBeCloseTo(5, 5);
    expect(center.y).toBeCloseTo(5, 5);
  });

  test('should calculate center for triangle', () => {
    const region = new Region({
      id: 'test-triangle',
      name: 'Test Triangle',
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 5, y: 10 }
      ],
      connections: [],
      type: 'plains',
      isExplored: true,
      isAccessible: true
    });

    const center = region.getCenterPosition();
    expect(center.x).toBeCloseTo(5, 5);
    expect(center.y).toBeCloseTo(3.333, 2);
  });

  test('should handle single vertex', () => {
    const region = new Region({
      id: 'test-point',
      name: 'Test Point',
      vertices: [{ x: 5, y: 7 }],
      connections: [],
      type: 'plains',
      isExplored: true,
      isAccessible: true
    });

    const center = region.getCenterPosition();
    expect(center.x).toBe(5);
    expect(center.y).toBe(7);
  });

  test('should handle two vertices (line segment)', () => {
    const region = new Region({
      id: 'test-line',
      name: 'Test Line',
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ],
      connections: [],
      type: 'plains',
      isExplored: true,
      isAccessible: true
    });

    const center = region.getCenterPosition();
    expect(center.x).toBe(5);
    expect(center.y).toBe(5);
  });

  test('should handle empty vertices', () => {
    const region = new Region({
      id: 'test-empty',
      name: 'Test Empty',
      vertices: [],
      connections: [],
      type: 'plains',
      isExplored: true,
      isAccessible: true
    });

    const center = region.getCenterPosition();
    expect(center.x).toBe(0);
    expect(center.y).toBe(0);
  });

  test('should calculate center for irregular polygon with many vertices', () => {
    // Create a polygon that's wider on the right side to test if the center
    // is properly weighted by area rather than vertex count
    const region = new Region({
      id: 'test-irregular',
      name: 'Test Irregular',
      vertices: [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 5 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ],
      connections: [],
      type: 'plains',
      isExplored: true,
      isAccessible: true
    });

    const center = region.getCenterPosition();
    // The center should be closer to the right side since that's where more area is
    console.log('Irregular polygon center:', center);
    expect(center.x).toBeGreaterThan(5);
    expect(center.y).toBeCloseTo(5, 5);
  });
});
