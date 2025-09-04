import React from 'react';
import { Creature, ICreature } from '../../../creatures/index';
import { EquipmentSlot } from './EquipmentSlot';
import { useEquipment } from '../../../game/hooks/useEquipment';
import { useGameState } from '../../../game/GameContext';

interface EquipmentSectionProps {
  creature: ICreature;
  onUpdate?: (creature: ICreature) => void;
  onAttack?: (creature: ICreature, offhand?: boolean) => void;
  canAttack?: (creature: ICreature) => boolean;
}

export function EquipmentSection({ creature, onUpdate, onAttack, canAttack }: EquipmentSectionProps) {
  const { mapDefinition } = useGameState();
  const { handleUnequip, canUnequipWeaponOrShield } = useEquipment(creature, mapDefinition, onUpdate);

  return (
    <div style={{ marginTop: 12, borderTop: `1px solid #ccc`, paddingTop: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Equipment</div>
      <EquipmentSlot 
        slot="mainHand" 
        label="Main Hand" 
        creature={creature}
        onUnequip={handleUnequip}
        canUnequip={canUnequipWeaponOrShield}
        onAttack={onAttack}
        canAttack={canAttack}
      />
      <EquipmentSlot 
        slot="offHand" 
        label="Off Hand" 
        creature={creature}
        onUnequip={handleUnequip}
        canUnequip={canUnequipWeaponOrShield}
        onAttack={onAttack}
        canAttack={canAttack}
      />
      <EquipmentSlot 
        slot="armor" 
        label="Armor" 
        creature={creature}
        onUnequip={handleUnequip}
        canUnequip={canUnequipWeaponOrShield}
        onAttack={onAttack}
        canAttack={canAttack}
      />
    </div>
  );
}
