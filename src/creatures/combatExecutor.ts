import { ICombatExecutor } from './interfaces';
import { executeCombat as executeCombatUtil } from '../utils/combat';
import { Creature, ICreature } from './index';
import { QuestMap } from '../maps/types';
import { CombatResult } from '../utils/combat/types';

// --- Combat Executor Implementation ---
// This class wraps the combat utility functions to implement the ICombatExecutor interface

export class CombatExecutor implements ICombatExecutor {
  executeCombat(
    attacker: ICreature,
    target: ICreature,
    allCreatures: ICreature[],
    mapDefinition?: QuestMap
  ): CombatResult {
    return executeCombatUtil(attacker as Creature, target as Creature, allCreatures as Creature[], mapDefinition || {} as QuestMap);
  }
}

// --- Default Export ---
export default new CombatExecutor();
