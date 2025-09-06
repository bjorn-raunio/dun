import { AIBehaviorType } from './types';


// --- AI Behavior Type Instances ---

export const AI_BEHAVIORS = {
  MELEE: new AIBehaviorType('melee', 2, true, true, false),
  RANGED: new AIBehaviorType('ranged', 1, true, false, true),
  ANIMAL: new AIBehaviorType('animal', 3, true, true, false),
  UNDEAD: new AIBehaviorType('undead', 4, true, true, false),
  CASTER: new AIBehaviorType('caster', 1, false, false, true),
} as const;