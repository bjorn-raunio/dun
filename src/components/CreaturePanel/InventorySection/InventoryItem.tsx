import React from 'react';
import { Creature, ICreature } from '../../../creatures/index';
import { Item, Weapon, RangedWeapon, Armor, Shield, Consumable } from '../../../items/types';
import { EquipmentSlot } from '../../../items/equipment';
import { COLORS, COMMON_STYLES } from '../../styles';
import { EquipmentValidator } from '../../../items/equipment';
import { useConsumables } from '../../../game/hooks/useConsumables';

interface InventoryItemProps {
  item: Item;
  creature: ICreature;
  onEquip: (item: Item, slot: EquipmentSlot) => void;
  canEquipToSlot: (item: Item, slot: EquipmentSlot) => boolean;
  canSwitchWeaponOrShield: (item: Item, slot: EquipmentSlot) => boolean;
  onUpdate?: (creature: ICreature) => void;
}

export function InventoryItem({ 
  item, 
  creature, 
  onEquip, 
  canEquipToSlot, 
  canSwitchWeaponOrShield,
  onUpdate
}: InventoryItemProps) {
  const canEquipMainHand = canEquipToSlot(item, 'mainHand');
  const canEquipOffHand = canEquipToSlot(item, 'offHand');
  const canEquipArmor = canEquipToSlot(item, 'armor');

  const canSwitchMainHand = canSwitchWeaponOrShield(item, 'mainHand');
  const canSwitchOffHand = canSwitchWeaponOrShield(item, 'offHand');
  const isAIControlled = creature.isAIControlled();

  // Consumable handling
  const { handleUseConsumable, canUseConsumable } = useConsumables(creature, onUpdate);
  const isConsumable = item instanceof Consumable;
  const canUse = isConsumable ? canUseConsumable(item as Consumable) : false;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 6,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 4,
      background: COLORS.backgroundLight,
      marginBottom: 4
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 12 }}>{item.name}</div>
        {isConsumable && (
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
            {(item as Consumable).effect}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {/* Use button for consumables */}
        {isConsumable && !isAIControlled && (
          <button
            onClick={() => handleUseConsumable(item as Consumable)}
            disabled={!canUse}
            style={{
              ...COMMON_STYLES.button,
              padding: '2px 6px',
              fontSize: 10,
              background: canUse ? COLORS.primary : COLORS.border,
              opacity: canUse ? 1 : 0.5,
              cursor: canUse ? 'pointer' : 'not-allowed'
            }}
          >
            Use
          </button>
        )}
        
        {/* Equipment buttons */}
        {canEquipMainHand && !isAIControlled && (
          <button
            onClick={() => onEquip(item, 'mainHand')}
            disabled={!canSwitchMainHand}
            style={{
              ...COMMON_STYLES.button,
              padding: '2px 6px',
              fontSize: 10,
              background: canSwitchMainHand ? COLORS.primary : COLORS.border,
              opacity: canSwitchMainHand ? 1 : 0.5,
              cursor: canSwitchMainHand ? 'pointer' : 'not-allowed'
            }}
          >
            MH
          </button>
        )}
        {canEquipOffHand && !isAIControlled && (
          <button
            onClick={() => onEquip(item, 'offHand')}
            disabled={!canSwitchOffHand}
            style={{
              ...COMMON_STYLES.button,
              padding: '2px 6px',
              fontSize: 10,
              background: canSwitchOffHand ? COLORS.primary : COLORS.border,
              opacity: canSwitchOffHand ? 1 : 0.5,
              cursor: canSwitchOffHand ? 'pointer' : 'not-allowed'
            }}
          >
            OH
          </button>
        )}
        {canEquipArmor && !isAIControlled && (
          <button
            onClick={() => onEquip(item, 'armor')}
            disabled={!canSwitchWeaponOrShield(item, 'armor')}
            style={{
              ...COMMON_STYLES.button,
              padding: '2px 6px',
              fontSize: 10,
              background: canSwitchWeaponOrShield(item, 'armor') ? COLORS.primary : COLORS.border,
              opacity: canSwitchWeaponOrShield(item, 'armor') ? 1 : 0.5,
              cursor: canSwitchWeaponOrShield(item, 'armor') ? 'pointer' : 'not-allowed'
            }}
          >
            A
          </button>
        )}
      </div>
    </div>
  );
}
