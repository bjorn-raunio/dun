import React from 'react';
import { Creature } from '../../creatures/index';

export interface MapViewProps {
  mapData: {
    name: string;
    description: string;
    tiles: string[][];
  };
  mapDefinition: any;
  creatures: Creature[];
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
  onCreatureClick: (creature: Creature, e: React.MouseEvent) => void;
  onTileClick: (pos: { tileX: number; tileY: number }) => void;
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
  panRef: React.MutableRefObject<HTMLDivElement | null>;
}

export interface MapBlock {
  type: string;
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
  rotation: number;
}

export interface TerrainItem {
  key: string;
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
  rotation: number;
  image?: string;
}
