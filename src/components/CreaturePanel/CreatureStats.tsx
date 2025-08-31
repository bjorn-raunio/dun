import React from 'react';
import { Creature } from '../../creatures/index';
import { COLORS } from '../styles';

interface CreatureStatsProps {
  creature: Creature;
}

export function CreatureStats({ creature }: CreatureStatsProps) {
  return (
    <div style={{ marginTop: 4, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
        <div>Movement: <strong>{creature.remainingMovement}/{creature.movement}</strong></div>
        <div>Agility: <strong>{creature.agility}</strong></div>
        <div>Combat: <strong>{creature.combat}</strong></div>
        <div>Intelligence: <strong>{creature.intelligence}</strong></div>
        <div>Strength: <strong>{creature.strength}</strong></div>
        <div>Mana: <strong>{creature.mana > 0 ? `${creature.remainingMana}/${creature.mana}` : '-'}</strong></div>
        <div>Ranged: <strong>{creature.ranged}</strong></div>
        <div>Courage: <strong>{creature.courage}</strong></div>
        <div>Armor: <strong>{creature.naturalArmor}/{creature.getArmorValue()}</strong></div>
        <div>Vitality: <strong style={{
          color: creature.isDead() ? COLORS.error :
            creature.isWounded() ? COLORS.warning : COLORS.text
        }}>
          {creature.remainingVitality}/{creature.vitality}
        </strong></div>
        <div>Perception: <strong>{creature.perception}</strong></div>
        <div>Dexterity: <strong>{creature.dexterity}</strong></div>
        <div>Fortune: <strong>{creature.remainingFortune}/{creature.fortune}</strong></div>
      </div>
      <div>Actions: <strong>{creature.remainingActions}/{creature.effectiveActions}</strong></div>
      <div>Quick Actions: <strong>{creature.remainingQuickActions}/{creature.effectiveQuickActions}</strong></div>
    </div>
  );
}
