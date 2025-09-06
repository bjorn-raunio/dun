import React from 'react';
import { ICreature } from '../../creatures/index';
import { COLORS } from '../styles';

interface SimpleCreatureStatsProps {
  creature: ICreature;
}

export function SimpleCreatureStats({ creature }: SimpleCreatureStatsProps) {
  // Only show stats for player-controlled creatures
  if (!creature.isPlayerControlled()) {
    return null;
  }

  return (
    <div style={{ marginTop: 4, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Movement:</span>
          <strong>{creature.remainingMovement}/{creature.movement}</strong>
        </div>        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Actions:</span>
          <strong>{creature.remainingActions}/{creature.effectiveActions}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Quick Actions:</span>
          <strong>{creature.remainingQuickActions}/{creature.effectiveQuickActions}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Vitality:</span>
          <strong style={{
            color: creature.isDead() ? COLORS.error :
              creature.isWounded() ? COLORS.warning : COLORS.text
          }}>
            {creature.remainingVitality}/{creature.vitality}
          </strong>
        </div>        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Mana:</span>
          <strong>{creature.mana > 0 ? `${creature.remainingMana}/${creature.mana}` : '-'}</strong>
        </div>        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Fortune:</span>
          <strong>{creature.remainingFortune}/{creature.fortune}</strong>
        </div>        
      </div>
    </div>
  );
}
