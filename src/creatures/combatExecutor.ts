import { ICombatExecutor } from './interfaces';
import { executeCombat as executeCombatUtil } from '../utils/combat';

// --- Combat Executor Implementation ---
// This class wraps the combat utility functions to implement the ICombatExecutor interface

export class CombatExecutor implements ICombatExecutor {
  executeCombat(attacker: any, target: any, allCreatures: any[], mapDefinition?: any, mapData?: any): any {
    return executeCombatUtil(attacker, target, allCreatures, mapDefinition, mapData);
  }
}

// --- Default Export ---
export default new CombatExecutor();
