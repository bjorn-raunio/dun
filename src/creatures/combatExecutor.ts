import { ICombatExecutor } from './interfaces';
import { executeCombat as executeCombatUtil } from '../utils/combatUtils';

// --- Combat Executor Implementation ---
// This class wraps the combat utility functions to implement the ICombatExecutor interface

export class CombatExecutor implements ICombatExecutor {
  executeCombat(attacker: any, target: any, allCreatures: any[], mapDefinition?: any): any {
    return executeCombatUtil(attacker, target, allCreatures, mapDefinition);
  }
}

// --- Default Export ---
export default new CombatExecutor();
