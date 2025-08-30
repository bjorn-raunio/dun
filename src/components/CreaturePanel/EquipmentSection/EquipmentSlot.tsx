import React from 'react';
import { Creature } from '../../../creatures/index';
import { EquipmentSlot as EquipmentSlotType } from '../../../items/equipment';
import { Weapon, RangedWeapon, Armor, Shield } from '../../../items/types';
import { COLORS, COMMON_STYLES } from '../../styles';

interface EquipmentSlotProps {
  slot: EquipmentSlotType;
  label: string;
  creature: Creature;
  onUnequip: (slot: EquipmentSlotType) => void;
  canUnequip: (slot: EquipmentSlotType) => boolean;
}

export function EquipmentSlot({ slot, label, creature, onUnequip, canUnequip }: EquipmentSlotProps) {
  const item = creature.equipment[slot];
  const canUnequipSlot = canUnequip(slot);
  const isAIControlled = creature.isAIControlled();

  return item && (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 4,
        background: COLORS.backgroundLight
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {!isAIControlled && (
            <button
              onClick={() => onUnequip(slot)}
              disabled={!canUnequipSlot}
              style={{
                ...COMMON_STYLES.button,
                padding: '4px 8px',
                fontSize: 12,
                background: canUnequipSlot ? COLORS.error : COLORS.border,
                opacity: canUnequipSlot ? 1 : 0.5,
                cursor: canUnequipSlot ? 'pointer' : 'not-allowed'
              }}
              title={canUnequipSlot ?
                (item instanceof Armor ?
                  "Unequip (uses action, prevents movement)" :
                  "Unequip (uses quick action or regular action)") :
                (item instanceof Armor ?
                  (creature.getCombatState() ? "Cannot unequip armor while in combat" : "Cannot unequip armor: must have actions and full movement") :
                  "No actions remaining for unequip")}
            >
              Unequip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
