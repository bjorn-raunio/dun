import { Creature } from '../../creatures/index';
import { MapDefinition } from '../../maps/types';

export interface TurnState {
  currentTurn: number;
  activeCreatureId: string | null;
  turnOrder: string[];
  turnIndex: number;
}

export interface AITurnState {
  isAITurnActive: boolean;
  currentGroup: string | null;
  groupTurnOrder: string[];
  groupTurnIndex: number;
  processedCreatures: Set<string>;
}

export interface TurnOrderConfig {
  playerFirst: boolean;
  rangedBeforeMelee: boolean;
  useAgilityTiebreaker: boolean;
}

export interface TurnExecutionContext {
  creatures: Creature[];
  mapData: { tiles: string[][] };
  dispatch: React.Dispatch<any>;
  mapDefinition?: MapDefinition;
}
