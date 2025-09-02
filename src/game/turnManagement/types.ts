import { Creature, CreatureGroup } from '../../creatures/index';
import { QuestMap } from '../../maps/types';

export interface TurnState {
  currentTurn: number;
  activeCreatureId: string | null;
  turnOrder: string[];
  turnIndex: number;
}

export interface AITurnState {
  isAITurnActive: boolean;
  currentGroup: CreatureGroup | null;
  groupTurnOrder: CreatureGroup[];
  groupTurnIndex: number;
  processedCreatures: Set<string>;
}

export interface TurnOrderConfig {
  playerFirst: boolean;
  rangedBeforeMelee: boolean;
  useAgilityTiebreaker: boolean;
}

export interface TurnExecutionContext {
  groups: CreatureGroup[];
  mapData: { tiles: string[][] };
  dispatch: React.Dispatch<any>;
  mapDefinition: QuestMap;
}
