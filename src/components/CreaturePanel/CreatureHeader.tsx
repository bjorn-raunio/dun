import React from 'react';
import { Creature } from '../../creatures/index';
import { COLORS } from '../styles';

interface CreatureHeaderProps {
  creature: Creature;
}

export function CreatureHeader({ creature }: CreatureHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {creature.image ? (
        <img
          src={process.env.PUBLIC_URL + "/" + creature.image}
          alt={creature.name}
          draggable={false}
          style={{
            width: 56,
            height: 56,
            objectFit: "cover" as const,
            borderRadius: "50%",
            border: creature.isHeroGroup() ? "2px solid #00ff00" : "2px solid #ff0000"
          }}
        />
      ) : (
        <div style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: creature.isHeroGroup() ? COLORS.hero : COLORS.monster,
          border: "2px solid #fff"
        }} />
      )}
      <div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: creature.isDead() ? COLORS.error : COLORS.text,
          textDecoration: creature.isDead() ? 'line-through' : 'none',
          opacity: creature.isDead() ? 0.7 : 1
        }}>
          {creature.name}
          {creature.isDead() && " (DEAD)"}
        </div>
      </div>
    </div>
  );
}
