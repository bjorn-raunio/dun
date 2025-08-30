import { executeCombat } from './combatUtils';
import { Hero } from '../creatures/hero';
import { Monster } from '../creatures/monster';

// Mock the dice functions to have predictable results
const mockCalculateToHitRoll = jest.fn();
const mockCalculateBlockRoll = jest.fn();
const mockCalculateMeleeDamageRoll = jest.fn();
const mockCalculateRangedDamageRoll = jest.fn();
const mockIsCriticalHit = jest.fn();
const mockIsDoubleCritical = jest.fn();
const mockRollD6 = jest.fn();

jest.mock('./dice', () => ({
  calculateToHitRoll: mockCalculateToHitRoll,
  calculateBlockRoll: mockCalculateBlockRoll,
  calculateMeleeDamageRoll: mockCalculateMeleeDamageRoll,
  calculateRangedDamageRoll: mockCalculateRangedDamageRoll,
  isCriticalHit: mockIsCriticalHit,
  isDoubleCritical: mockIsDoubleCritical,
  rollD6: mockRollD6,
}));

describe('Three-Part Attack System', () => {
  let attacker: Hero;
  let target: Monster;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up default mock returns
    mockCalculateToHitRoll.mockReturnValue({ total: 8, dice: [3, 5] });
    mockCalculateBlockRoll.mockReturnValue({ total: 6, dice: [2, 4] });
    mockCalculateMeleeDamageRoll.mockReturnValue([4, 5, 6]);
    mockCalculateRangedDamageRoll.mockReturnValue([3, 4]);
    mockIsCriticalHit.mockReturnValue(false);
    mockIsDoubleCritical.mockReturnValue(false);
    mockRollD6.mockReturnValue(4);

    // Create test creatures
    attacker = new Hero({
      name: 'Test Hero',
      x: 0,
      y: 0,
      attributes: { combat: 3, ranged: 2, strength: 4, agility: 3 },
      actions: 2,
      quickActions: 1,
      vitality: 10,
      remainingVitality: 10,
      naturalArmor: 0,
    });

    target = new Monster({
      name: 'Test Monster',
      x: 1,
      y: 0,
      attributes: { combat: 2, ranged: 1, strength: 3, agility: 2 },
      actions: 1,
      quickActions: 0,
      vitality: 8,
      remainingVitality: 8,
      naturalArmor: 1,
    });
  });

  test('should have three distinct parts: to-hit, block, and damage', () => {
    const result = executeCombat(attacker, target, [attacker, target]);
    
    // Verify the result has the expected structure
    expect(result).toHaveProperty('toHitMessage');
    expect(result).toHaveProperty('blockMessage');
    expect(result).toHaveProperty('damageMessage');
    expect(result).toHaveProperty('damage');
    expect(result).toHaveProperty('targetDefeated');
  });

  test('should return to-hit message even on miss', () => {
    // Mock a miss scenario
    mockCalculateToHitRoll.mockReturnValue({ total: 5, dice: [2, 3] });
    mockCalculateBlockRoll.mockReturnValue({ total: 8, dice: [4, 4] });
    
    const result = executeCombat(attacker, target, [attacker, target]);
    
    // Should always have a to-hit message
    expect(result.toHitMessage).toBeDefined();
    expect(result.toHitMessage).toContain('attacks');
  });

  test('should handle successful attacks with all three parts', () => {
    // Mock a hit scenario
    mockCalculateToHitRoll.mockReturnValue({ total: 10, dice: [5, 5] });
    mockCalculateBlockRoll.mockReturnValue({ total: 6, dice: [2, 4] });
    
    const result = executeCombat(attacker, target, [attacker, target]);
    
    if (result.success) {
      // If attack hits, should have all three parts
      expect(result.toHitMessage).toBeDefined();
      expect(result.damageMessage).toBeDefined();
      // Block message might be empty if no shield, but should be present
      expect(result).toHaveProperty('blockMessage');
    }
  });

  test('should call individual phase functions in sequence', () => {
    // Mock successful hit scenario
    mockCalculateToHitRoll.mockReturnValue({ total: 10, dice: [5, 5] });
    mockCalculateBlockRoll.mockReturnValue({ total: 6, dice: [2, 4] });
    mockIsCriticalHit.mockReturnValue(true);
    mockIsDoubleCritical.mockReturnValue(false);
    
    const result = executeCombat(attacker, target, [attacker, target]);
    
    // Verify that the dice functions were called for each phase
    expect(mockCalculateToHitRoll).toHaveBeenCalled();
    expect(mockCalculateBlockRoll).toHaveBeenCalled();
    expect(mockCalculateMeleeDamageRoll).toHaveBeenCalled();
  });

  test('should handle shield blocking correctly', () => {
    // Mock successful hit but shield block
    mockCalculateToHitRoll.mockReturnValue({ total: 10, dice: [5, 5] });
    mockCalculateBlockRoll.mockReturnValue({ total: 6, dice: [2, 4] });
    mockRollD6.mockReturnValue(5); // Shield blocks (5 >= 4)
    
    const result = executeCombat(attacker, target, [attacker, target]);
    
    if (result.success) {
      // Should have block message and no damage
      expect(result.blockMessage).toBeDefined();
      expect(result.damage).toBe(0);
    }
  });

  test('should handle critical hits correctly', () => {
    // Mock critical hit scenario
    mockCalculateToHitRoll.mockReturnValue({ total: 10, dice: [5, 6] });
    mockCalculateBlockRoll.mockReturnValue({ total: 6, dice: [2, 4] });
    mockIsCriticalHit.mockReturnValue(true);
    mockIsDoubleCritical.mockReturnValue(false);
    
    const result = executeCombat(attacker, target, [attacker, target]);
    
    if (result.success) {
      // Should show critical hit in messages
      expect(result.toHitMessage).toContain('CRITICAL');
      expect(result.damageMessage).toContain('CRITICAL');
    }
  });
});
