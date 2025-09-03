import React from 'react';
import { Creature, ICreature } from '../../../creatures/index';
import { InventoryItem } from './InventoryItem';
import { useEquipment } from '../../../game/hooks/useEquipment';
import { useGameState } from '../../../game/GameContext';

interface InventorySectionProps {
  creature: ICreature;
  onUpdate?: (creature: ICreature) => void;
}

export function InventorySection({ creature, onUpdate }: InventorySectionProps) {
  const { mapDefinition } = useGameState();
  const { handleEquip, handleDropItem, canEquipToSlot, canSwitchWeaponOrShield } = useEquipment(creature, mapDefinition, onUpdate);

  return (
    <div style={{ marginTop: 12, borderTop: `1px solid #ccc`, paddingTop: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Inventory ({creature.inventory.length})</div>
      {creature.inventory.length === 0 ? (
        <div style={{ opacity: 0.6, fontSize: 12 }}>No items in inventory</div>
      ) : (
        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {creature.inventory.map((item, index) => (
            <InventoryItem
              key={item.id}
              item={item}
              creature={creature}
              onEquip={handleEquip}
              canEquipToSlot={canEquipToSlot}
              canSwitchWeaponOrShield={canSwitchWeaponOrShield}
              onUpdate={onUpdate}
              onDrop={handleDropItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
