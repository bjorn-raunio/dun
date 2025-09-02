import React from 'react';
import { Creature, ICreature } from '../../creatures/index';
import { COLORS, LAYOUT_PATTERNS } from '../styles';

interface HeroSelectorProps {
  heroes: ICreature[];
  onSelect?: (creature: ICreature) => void;
}

export function HeroSelector({ heroes, onSelect }: HeroSelectorProps) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Heroes ({heroes.length})</div>
      {heroes.length === 0 ? (
        <div style={{ opacity: 0.8 }}>No heroes available</div>
      ) : (
        <div style={{ ...LAYOUT_PATTERNS.flexColumn, gap: 8, maxHeight: "calc(100vh - 300px)", overflow: "auto" }}>
          {heroes.map((hero) => (
            <div
              key={hero.id}
              onClick={() => onSelect?.(hero)}
              style={{
                ...LAYOUT_PATTERNS.flexRowCenter,
                gap: 12,
                padding: 8,
                ...LAYOUT_PATTERNS.card,
                cursor: onSelect ? "pointer" : "default",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (onSelect) {
                  e.currentTarget.style.background = COLORS.background;
                  e.currentTarget.style.borderColor = COLORS.borderDark;
                }
              }}
              onMouseLeave={(e) => {
                if (onSelect) {
                  e.currentTarget.style.background = COLORS.backgroundLight;
                  e.currentTarget.style.borderColor = COLORS.border;
                }
              }}
            >
              {hero.image ? (
                <img
                  src={process.env.PUBLIC_URL + "/" + hero.image}
                  alt={hero.name}
                  draggable={false}
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover" as const,
                    borderRadius: "50%",
                    border: "2px solid #00ff00",
                    filter: hero.isDead() ? "grayscale(100%)" : "none",
                    opacity: hero.isDead() ? 0.6 : 1
                  }}
                />
              ) : (
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: COLORS.hero,
                  border: "2px solid #fff",
                  filter: hero.isDead() ? "grayscale(100%)" : "none",
                  opacity: hero.isDead() ? 0.6 : 1
                }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                }}>
                  {hero.name}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Vitality: <strong style={{
                    color: hero.isDead() ? COLORS.error :
                      hero.isWounded() ? COLORS.warning : COLORS.text
                  }}>
                    {hero.remainingVitality}
                  </strong> |
                  Actions: <strong>{hero.remainingActions ?? hero.effectiveActions}</strong> |
                  Movement: <strong>{hero.remainingMovement ?? hero.movement}</strong> |
                  Quick: <strong>{hero.remainingQuickActions ?? hero.quickActions}</strong>
                </div>          
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
