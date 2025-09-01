import React, { useState } from 'react';
import { Creature, ICreature } from '../../creatures/index';
import { StatusEffect } from '../../statusEffects';
import { COLORS } from '../styles';

interface CreatureHeaderProps {
  creature: ICreature;
}

export function CreatureHeader({ creature }: CreatureHeaderProps) {
  const activeEffects = creature.getActiveStatusEffects();
  const [hoveredEffect, setHoveredEffect] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
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
            border: creature.isPlayerControlled() ? "2px solid #00ff00" : "2px solid #ff0000",
            filter: creature.isDead() ? "grayscale(100%)" : "none",
            opacity: creature.isDead() ? 0.6 : 1
          }}
        />
      ) : (
        <div style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: creature.isPlayerControlled() ? COLORS.hero : COLORS.monster,
          border: "2px solid #fff",
          filter: creature.isDead() ? "grayscale(100%)" : "none",
          opacity: creature.isDead() ? 0.6 : 1
        }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 4,
          textAlign: "left"
        }}>
          {creature.name}
        </div>
        
        {/* Status Effects */}
        {activeEffects.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start', width: '100%' }}>
            {activeEffects.map((effect) => (
              <div
                key={effect.id}
                style={{
                  position: 'relative',
                  cursor: 'help'
                }}
                onMouseEnter={() => setHoveredEffect(effect.id)}
                onMouseLeave={() => setHoveredEffect(null)}
              >
                {/* Status effect icon */}
                <div style={{
                  fontSize: 12,
                  padding: 3,
                  borderRadius: 3,
                  background: COLORS.backgroundLight,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '18px',
                  minHeight: '18px'
                }}>
                  <span>{effect.icon}</span>
                  

                </div>

                {/* Tooltip */}
                {hoveredEffect === effect.id && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '100%',
                    transform: 'translateY(-50%)',
                    marginRight: 8,
                    background: COLORS.backgroundDark,
                    color: COLORS.text,
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: `1px solid ${COLORS.border}`
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {effect.name}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>
                      {effect.description}
                    </div>
                    {effect.remainingTurns !== null && (
                      <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                        {effect.remainingTurns === 1 ? '1 turn remaining' : `${effect.remainingTurns} turns remaining`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
