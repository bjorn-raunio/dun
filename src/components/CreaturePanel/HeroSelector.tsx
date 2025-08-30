import React from 'react';
import { Creature } from '../../creatures/index';
import { COLORS } from '../styles';

interface HeroSelectorProps {
  heroes: Creature[];
  onSelect?: (creature: Creature) => void;
}

export function HeroSelector({ heroes, onSelect }: HeroSelectorProps) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Heroes ({heroes.length})</div>
      {heroes.length === 0 ? (
        <div style={{ opacity: 0.8 }}>No heroes available</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 300px)", overflow: "auto" }}>
          {heroes.map((hero) => (
            <div
              key={hero.id}
              onClick={() => onSelect?.(hero)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 8,
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.backgroundLight,
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
                    border: "2px solid #00ff00"
                  }}
                />
              ) : (
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: COLORS.hero,
                  border: "2px solid #fff"
                }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: hero.isDead() ? COLORS.error : COLORS.text,
                  textDecoration: hero.isDead() ? 'line-through' : 'none',
                  opacity: hero.isDead() ? 0.7 : 1
                }}>
                  {hero.name}
                  {hero.isDead() && " (DEAD)"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Vitality: <strong style={{
                    color: hero.isDead() ? COLORS.error :
                      hero.isWounded() ? COLORS.warning : COLORS.text
                  }}>
                    {hero.remainingVitality}
                    {hero.isWounded() && " (WOUNDED)"}
                  </strong> |
                  Actions: <strong>{hero.remainingActions ?? hero.actions}</strong> |
                  Movement: <strong>{hero.remainingMovement ?? hero.movement}</strong> |
                  Quick: <strong>{hero.remainingQuickActions ?? hero.quickActions}</strong>
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  Position: ({hero.x}, {hero.y})
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
