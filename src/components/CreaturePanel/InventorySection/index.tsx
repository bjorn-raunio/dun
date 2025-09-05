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
    <div style={{ 
      marginTop: 8, 
      borderTop: `1px solid #ccc`, 
      paddingTop: 8,
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0 // Allow flex item to shrink below content size
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, flexShrink: 0 }}>Inventory ({creature.inventory.length})</div>
      {creature.inventory.length === 0 ? (
        <div style={{ opacity: 0.6, fontSize: 12 }}>No items in inventory</div>
      ) : (
        <div style={{ 
          flex: 1, 
          overflow: 'auto',
          paddingRight: 4, // Add some padding for scrollbar
          minHeight: 0 // Allow flex item to shrink below content size
        }}>
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
