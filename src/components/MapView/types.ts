import React from 'react';
import { ICreature } from '../../creatures/index';
import { QuestMap } from '../../maps/types';
import { TargetingMode } from '../../game/types';

export interface MapViewProps {
  mapDefinition: QuestMap;
  creatures: ICreature[];
  selectedCreatureId: string | null;
  reachable: {
    tiles: Array<{ x: number; y: number }>;
    costMap: Map<string, number>;
    pathMap: Map<string, Array<{ x: number; y: number }>>;
  };
  highlightedPath: Array<{ x: number; y: number }>;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onCreatureClick: (creature: ICreature, e: React.MouseEvent) => void;
  onTileClick: (pos: { tileX: number; tileY: number }) => void;
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
  panRef: React.MutableRefObject<HTMLDivElement | null>;
  targetingMode?: TargetingMode;
  onCenterOnStartingTile?: () => void;
  animationsEnabled?: boolean;
}