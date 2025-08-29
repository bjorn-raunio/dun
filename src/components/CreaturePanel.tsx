import React from 'react';
import { COLORS, COMMON_STYLES } from './styles';
import { Creature } from '../creatures/index';
import { getLivingCreatures } from '../validation/creature';

// --- Creature Panel Component ---

interface CreaturePanelProps {
  selectedCreature: Creature | null;
  creatures: Creature[];
  onDeselect: () => void;
  onSelectCreature?: (creature: Creature) => void;
}

export function CreaturePanel({ selectedCreature, creatures, onDeselect, onSelectCreature }: CreaturePanelProps) {
  // Get all heroes when no creature is selected
  const heroes = getLivingCreatures(creatures).filter(creature => creature.isHeroGroup());

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "calc(100vh - 162.5px)",
        bottom: 162.5,
        width: 280,
        ...COMMON_STYLES.panel,
        padding: 16,
        boxSizing: "border-box",
        zIndex: 12,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {selectedCreature ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {selectedCreature.image ? (
              <img
                src={process.env.PUBLIC_URL + "/" + selectedCreature.image}
                alt={selectedCreature.name}
                draggable={false}
                style={{ 
                  width: 56, 
                  height: 56, 
                  objectFit: "cover", 
                  borderRadius: "50%", 
                  border: selectedCreature.isHeroGroup() ? "2px solid #00ff00" : "2px solid #ff0000" 
                }}
              />
            ) : (
              <div style={{ 
                width: 56, 
                height: 56, 
                borderRadius: "50%", 
                                 background: selectedCreature.isHeroGroup() ? COLORS.hero : COLORS.monster, 
                border: "2px solid #fff" 
              }} />
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedCreature.name}</div>
                             <div style={{ opacity: 0.8, textTransform: "capitalize" }}>{selectedCreature.group}</div>
            </div>
          </div>
          
          <div style={{ marginTop: 4, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
            <div>Movement: <strong>{selectedCreature.remainingMovement}/{selectedCreature.movement}</strong></div>
            <div>Actions: <strong>{selectedCreature.remainingActions}/{selectedCreature.actions}</strong></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
              <div>Combat: <strong>{selectedCreature.combat}</strong></div>
              <div>Ranged: <strong>{selectedCreature.ranged}</strong></div>
              <div>Strength: <strong>{selectedCreature.strength}</strong></div>
              <div>Agility: <strong>{selectedCreature.agility}</strong></div>
                            <div>Vitality: <strong style={{ 
                        color: selectedCreature.isDead() ? COLORS.error :
               selectedCreature.remainingVitality <= 1 ? COLORS.warning : COLORS.text
              }}>
                {selectedCreature.remainingVitality}/{selectedCreature.vitality}
              </strong></div>
            </div>
          </div>
          
          <div style={{ marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Equipment</div>
            <div>Main hand: <strong>{selectedCreature.equipment.mainHand?.name ?? "-"}</strong></div>
            <div>Off hand: <strong>{selectedCreature.equipment.offHand?.name ?? "-"}</strong></div>
            <div>Armor: <strong>{selectedCreature.equipment.armor?.name ?? "-"}</strong></div>
          </div>
          
          <div style={{ marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Inventory ({selectedCreature.inventory.length})</div>
            <ul style={{ margin: 0, paddingLeft: 16, maxHeight: 160, overflow: "auto" }}>
              {selectedCreature.inventory.map((it: any) => (
                <li key={it.id}>{it.name}</li>
              ))}
            </ul>
          </div>
          
          <button
            onClick={onDeselect}
            style={{
              marginTop: 4,
              width: "100%",
              ...COMMON_STYLES.button,
            }}
          >
            Deselect
          </button>
        </>
      ) : (
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Heroes ({heroes.length})</div>
          {heroes.length === 0 ? (
            <div style={{ opacity: 0.8 }}>No heroes available</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 300px)", overflow: "auto" }}>
              {heroes.map((hero) => (
                <div
                  key={hero.id}
                  onClick={() => onSelectCreature?.(hero)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 8,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.backgroundLight,
                    cursor: onSelectCreature ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    ...(onSelectCreature && {
                      "&:hover": {
                        background: COLORS.background,
                        borderColor: COLORS.borderDark,
                      }
                    })
                  }}
                  onMouseEnter={(e) => {
                    if (onSelectCreature) {
                      e.currentTarget.style.background = COLORS.background;
                      e.currentTarget.style.borderColor = COLORS.borderDark;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onSelectCreature) {
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
                        objectFit: "cover", 
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
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{hero.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Vitality: <strong style={{ 
                        color: hero.isDead() ? COLORS.error :
                               hero.remainingVitality <= 1 ? COLORS.warning : COLORS.text
                      }}>
                        {hero.remainingVitality}
                      </strong> | 
                      Actions: <strong>{hero.remainingActions ?? hero.actions}</strong> | 
                      Movement: <strong>{hero.remainingMovement ?? hero.movement}</strong>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      Position: ({hero.x}, {hero.y}) | 
                      {(() => {
                        const isEngaged = hero.isEngagedWithAll(creatures);
                        return (
                          <>Engaged: <strong style={{ color: isEngaged ? COLORS.error : COLORS.success }}>
                            {isEngaged ? "Yes" : "No"}
                          </strong></>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
