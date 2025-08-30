import React from 'react';
import { Creature } from '../../../creatures/index';
import { EquipmentSlot } from './EquipmentSlot';
import { useEquipment } from '../../../hooks/useEquipment';

interface EquipmentSectionProps {
  creature: Creature;
  onUpdate?: (creature: Creature) => void;
}

export function EquipmentSection({ creature, onUpdate }: EquipmentSectionProps) {
  const { handleUnequip, canUnequipWeaponOrShield } = useEquipment(creature, onUpdate);

  return (
    <div style={{ marginTop: 12, borderTop: `1px solid #ccc`, paddingTop: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Equipment</div>
      <EquipmentSlot 
        slot="mainHand" 
        label="Main Hand" 
        creature={creature}
        onUnequip={handleUnequip}
        canUnequip={canUnequipWeaponOrShield}
      />
      <EquipmentSlot 
        slot="offHand" 
        label="Off Hand" 
        creature={creature}
        onUnequip={handleUnequip}
        canUnequip={canUnequipWeaponOrShield}
      />
      <EquipmentSlot 
        slot="armor" 
        label="Armor" 
        creature={creature}
        onUnequip={handleUnequip}
        canUnequip={canUnequipWeaponOrShield}
      />
    </div>
  );
}
