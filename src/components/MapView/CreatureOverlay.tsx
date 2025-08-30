import React from 'react';
import { TILE_SIZE, COLORS } from '../styles';
import { Creature } from '../../creatures/index';
import { getLivingCreatures } from '../../validation/creature';
import { getCreatureUIDimensions, getCreatureUIOffset } from '../../utils/dimensions';

interface CreatureOverlayProps {
  creatures: Creature[];
  selectedCreatureId: string | null;
  onCreatureClick: (creature: Creature, e: React.MouseEvent) => void;
}

export function CreatureOverlay({ creatures, selectedCreatureId, onCreatureClick }: CreatureOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      {getLivingCreatures(creatures).map((cr) => (
        <div
          key={cr.id}
          title={cr.name}
          onClick={(e) => onCreatureClick(cr, e)}
          style={{
            position: "absolute",
            left: cr.x * TILE_SIZE + (TILE_SIZE * 0.1),
            top: cr.y * TILE_SIZE + (TILE_SIZE * 0.1),
            width: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).width,
            height: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).height,
            cursor: "pointer",
            pointerEvents: "auto",
            zIndex: 4,
          }}
        >
          {cr.image ? (
            <img
              src={process.env.PUBLIC_URL + "/" + cr.image}
              alt={cr.name}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                border: selectedCreatureId === cr.id ? "2px solid #00e5ff" : (cr.isHeroGroup() ? "2px solid #00ff00" : "2px solid #ff0000"),
                boxSizing: "border-box",
                pointerEvents: "none",
                opacity: cr.isDead() ? 0.3 : 1,
              }}
            />
          ) : (
            <div
              style={{
                width: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).width,
                height: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).height,
                borderRadius: "50%",
                background: cr.isDead() ? "#666" : (cr.isHeroGroup() ? COLORS.hero : COLORS.monster),
                border: selectedCreatureId === cr.id ? "2px solid #00e5ff" : (cr.isHeroGroup() ? "2px solid #00ff00" : "2px solid #ff0000"),
                boxSizing: "border-box",
                pointerEvents: "none",
                opacity: cr.isDead() ? 0.3 : 1,
              }}
            />
          )}
          {/* Facing direction arrow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${cr.facing * 45}deg) translateY(-${getCreatureUIOffset(cr.size, TILE_SIZE, 0.4)}px)`,
              fontSize: "12px",
              color: cr.isHeroGroup() ? COLORS.hero : COLORS.monster,
              fontWeight: "bold",
              textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            ▲
          </div>
        </div>
      ))}
    </div>
  );
}
