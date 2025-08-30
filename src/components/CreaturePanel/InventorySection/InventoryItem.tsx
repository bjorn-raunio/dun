import React from 'react';
import { Creature } from '../../../creatures/index';
import { Item, Weapon, RangedWeapon, Armor, Shield } from '../../../items/types';
import { EquipmentSlot } from '../../../items/equipment';
import { COLORS, COMMON_STYLES } from '../../styles';

interface InventoryItemProps {
  item: Item;
  creature: Creature;
  onEquip: (item: Item, slot: EquipmentSlot) => void;
  canEquipToSlot: (item: Item, slot: EquipmentSlot) => boolean;
  canSwitchWeaponOrShield: (item: Item, slot: EquipmentSlot) => boolean;
}

export function InventoryItem({ 
  item, 
  creature, 
  onEquip, 
  canEquipToSlot, 
  canSwitchWeaponOrShield 
}: InventoryItemProps) {
  const canEquipMainHand = canEquipToSlot(item, 'mainHand');
  const canEquipOffHand = canEquipToSlot(item, 'offHand');
  const canEquipArmor = canEquipToSlot(item, 'armor');

  const canSwitchMainHand = canSwitchWeaponOrShield(item, 'mainHand');
  const canSwitchOffHand = canSwitchWeaponOrShield(item, 'offHand');
  const isAIControlled = creature.isAIControlled();

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
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
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
            title={canSwitchMainHand ? "Equip to Main Hand (uses quick action or regular action)" : "No actions remaining for weapon/shield switch"}
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
            title={canSwitchOffHand ? "Equip to Off Hand (uses quick action or regular action)" : "No actions remaining for weapon/shield switch"}
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
            title={canSwitchWeaponOrShield(item, 'armor') ? "Equip as Armor (uses action, prevents movement)" :
              creature.getCombatState() ? "Cannot equip armor while in combat" :
                "Cannot equip armor: must have actions and full movement"}
          >
            A
          </button>
        )}
      </div>
    </div>
  );
}
