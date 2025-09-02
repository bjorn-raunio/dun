import React, { useState } from 'react';
import { Creature } from '../../../creatures/index';
import { StatusEffect } from '../../../statusEffects';
import { COLORS, LAYOUT_PATTERNS } from '../../styles';

interface StatusEffectsSectionProps {
  creature: Creature;
}

const StatusEffectsSection: React.FC<StatusEffectsSectionProps> = ({ creature }) => {
  const activeEffects = creature.getStatusEffectManager().getActiveEffectsByPriority();
  const [hoveredEffect, setHoveredEffect] = useState<string | null>(null);
  
  if (activeEffects.length === 0) {
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Status Effects</div>
        <div style={{ opacity: 0.6, fontSize: 14 }}>No active effects</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Status Effects</div>
      <div style={{ ...LAYOUT_PATTERNS.flexRowCenter, flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
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
              fontSize: 18,
              padding: 4,
              borderRadius: 4,
              background: COLORS.backgroundLight,
              position: 'relative',
              ...LAYOUT_PATTERNS.flexCenter,
              minWidth: '20px',
              minHeight: '20px'
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
    </div>
  );
};

export default StatusEffectsSection;
