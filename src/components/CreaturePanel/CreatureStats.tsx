import React from 'react';
import { Creature, ICreature } from '../../creatures/index';
import { COLORS } from '../styles';

interface CreatureStatsProps {
  creature: ICreature;
}

export function CreatureStats({ creature }: CreatureStatsProps) {
  return (
    <div style={{ marginTop: 4, borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 20, marginTop: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Movement:</span>
          <strong>{creature.movement}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Agility:</span>
          <strong>{creature.agility}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Combat:</span>
          <strong>{creature.combat}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Intelligence:</span>
          <strong>{creature.intelligence}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Strength:</span>
          <strong>{creature.strength}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Mana:</span>
          <strong>{creature.mana > 0 ? `${creature.mana}` : '-'}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Ranged:</span>
          <strong>{creature.ranged}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Courage:</span>
          <strong>{creature.courage}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Armor:</span>
          <strong>{creature.naturalArmor}/{creature.getArmorValue()}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Vitality:</span>
            {creature.vitality}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Perception:</span>
          <strong>{creature.perception}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Dexterity:</span>
          <strong>{creature.dexterity}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Fortune:</span>
          <strong>{creature.fortune}</strong>
        </div>
      </div>
    </div>
  );
}
