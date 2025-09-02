import { ICombatExecutor } from './interfaces';
import { executeCombat as executeCombatUtil } from '../utils/combat';
import { Creature } from './index';
import { QuestMap } from '../maps/types';
import { CombatResult } from '../utils/combat/types';

// --- Combat Executor Implementation ---
// This class wraps the combat utility functions to implement the ICombatExecutor interface

export class CombatExecutor implements ICombatExecutor {
  executeCombat(attacker: Creature, target: Creature, allCreatures: Creature[], mapDefinition?: QuestMap, mapData?: { tiles: string[][] }): CombatResult {
    return executeCombatUtil(attacker, target, allCreatures, mapDefinition, mapData);
  }
}

// --- Default Export ---
export default new CombatExecutor();
