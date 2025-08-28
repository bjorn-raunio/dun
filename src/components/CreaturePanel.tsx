import React from 'react';
import { COLORS, COMMON_STYLES } from './styles';
import { Creature } from '../creatures';

// --- Creature Panel Component ---

interface CreaturePanelProps {
  selectedCreature: Creature | null;
  creatures: Creature[];
  onDeselect: () => void;
}

export function CreaturePanel({ selectedCreature, creatures, onDeselect }: CreaturePanelProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "calc(100vh - 130px)",
        bottom: 130,
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
                  border: selectedCreature.kind === "hero" ? `2px solid ${COLORS.hero}` : `2px solid ${COLORS.monster}` 
                }}
              />
            ) : (
              <div style={{ 
                width: 56, 
                height: 56, 
                borderRadius: "50%", 
                background: selectedCreature.kind === "hero" ? COLORS.hero : COLORS.monster, 
                border: "2px solid #fff" 
              }} />
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedCreature.name}</div>
              <div style={{ opacity: 0.8, textTransform: "capitalize" }}>{selectedCreature.kind}</div>
            </div>
          </div>
          
          <div style={{ marginTop: 4, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
            <div>Movement: <strong>{selectedCreature.movement}</strong></div>
            <div>Remaining: <strong style={{ color: selectedCreature.remainingMovement === 0 ? COLORS.error : COLORS.text }}>
              {selectedCreature.remainingMovement ?? selectedCreature.movement}
            </strong></div>
            <div>Actions: <strong>{selectedCreature.actions}</strong></div>
            <div>Remaining actions: <strong>{selectedCreature.remainingActions ?? selectedCreature.actions}</strong></div>
            <div>Position: <strong>({selectedCreature.x}, {selectedCreature.y})</strong></div>
            <div>Size: <strong>{selectedCreature.size}</strong></div>
            <div>Facing: <strong>{selectedCreature.getFacingShortName()} {selectedCreature.getFacingArrow()}</strong></div>
            <div>Engaged: <strong style={{ color: selectedCreature.isEngagedWithAll(creatures) ? COLORS.error : COLORS.success }}>
              {selectedCreature.isEngagedWithAll(creatures) ? "Yes" : "No"}
            </strong></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
              <div>Combat: <strong>{selectedCreature.combat}</strong></div>
              <div>Ranged: <strong>{selectedCreature.ranged}</strong></div>
              <div>Strength: <strong>{selectedCreature.strength}</strong></div>
              <div>Agility: <strong>{selectedCreature.agility}</strong></div>
              <div>Vitality: <strong style={{ 
                color: selectedCreature.vitality <= 0 ? COLORS.error : 
                       selectedCreature.vitality <= 1 ? COLORS.warning : COLORS.text 
              }}>
                {selectedCreature.vitality}
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
        <div style={{ opacity: 0.8 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No creature selected</div>
          <div>Click a creature token to see its stats here.</div>
        </div>
      )}
    </div>
  );
}
