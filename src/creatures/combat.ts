import { Creature } from './base';

// Combat logic for creatures
export class CreatureCombat {

  // Roll Xd6 for damage calculation
  private static rollXd6(count: number): number[] {
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * 6) + 1);
    }
    return results;
  }

  // Perform an attack against a target creature
  static attack(attacker: Creature, target: Creature, allCreatures: Creature[] = []): { hit: boolean; damage: number; message: string; targetDefeated: boolean; toHitMessage?: string; damageMessage?: string } {
    // Face the target when attacking
    attacker.faceTowards(target.x, target.y);
    
    // Import combat logic dynamically to avoid circular dependencies
    const { executeCombat } = require('../gameLogic/combat');
    
    // Execute combat using extracted logic
    const result = executeCombat(attacker, target, allCreatures);
    
    return {
      hit: result.success,
      damage: result.damage,
      message: result.message,
      targetDefeated: result.targetDefeated,
      toHitMessage: result.toHitMessage,
      damageMessage: result.damageMessage
    };
  }
}
