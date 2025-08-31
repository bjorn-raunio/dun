import { Creature } from '../../creatures/index';
import { GameActions, GameRefs } from '../../game/types';
import { MapDefinition } from '../../maps/types';
import { PanningHandlers } from './panningHandlers';
import { CombatHandlers } from './combatHandlers';
import { MovementHandlers } from './movementHandlers';
import { TileInteractionHandlers } from './tileInteractionHandlers';

export interface MouseHandlers extends PanningHandlers {
  onCreatureClick: (creature: Creature, e: React.MouseEvent) => void;
  handleTileInteraction: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export interface MouseHandlerDependencies {
  gameActions: GameActions;
  gameRefs: GameRefs;
  creatures: Creature[];
  selectedCreatureId: string | null;
  reachable: { 
    tiles: Array<{ x: number; y: number }>; 
    costMap: Map<string, number>; 
    pathMap: Map<string, Array<{ x: number; y: number }>> 
  };
  targetsInRangeIds: Set<string>;
  mapData: { tiles: string[][] };
  setSelectedCreatureId: (id: string | null) => void;
  mapDefinition?: MapDefinition;
  targetingMode?: { 
    isActive: boolean; 
    attackerId: string | null; 
    message: string 
  };
}
