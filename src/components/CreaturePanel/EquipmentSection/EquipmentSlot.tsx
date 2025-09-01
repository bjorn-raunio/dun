import React from 'react';
import { Creature, ICreature } from '../../../creatures/index';
import { EquipmentSlot as EquipmentSlotType } from '../../../items/equipment';
import { Armor, Weapon, RangedWeapon } from '../../../items/types';
import { EquipmentSystem } from '../../../items/equipment/system';
import { EquipmentValidator } from '../../../items/equipment';
import { COLORS, COMMON_STYLES } from '../../styles';

interface EquipmentSlotProps {
  slot: EquipmentSlotType;
  label: string;
  creature: ICreature;
  onUnequip: (slot: EquipmentSlotType) => void;
  canUnequip: (slot: EquipmentSlotType) => boolean;
  onAttack?: (creature: ICreature) => void;
  canAttack?: (creature: ICreature) => boolean;
}

export function EquipmentSlot({ 
  slot, 
  label, 
  creature, 
  onUnequip, 
  canUnequip, 
  onAttack, 
  canAttack 
}: EquipmentSlotProps) {
  const item = creature.equipment[slot];
  const canUnequipSlot = canUnequip(slot);
  const isAIControlled = creature.isAIControlled();
  
  // For main hand only, show unarmed weapon if slot is empty
  let displayItem = item;
  let isUnarmedWeapon = false;
  
  if (slot === 'mainHand' && !item) {
    const equipmentSystem = new EquipmentSystem(creature.equipment);
    if (equipmentSystem.isUnarmed()) {
      displayItem = equipmentSystem.getMainWeapon();
      isUnarmedWeapon = true;
    }
  }

  // Don't render anything if there's no item to display (including unarmed)
  if (!displayItem) {
    return null;
  }

  // Check if this is a weapon that can be used for attack
  const isWeapon = displayItem instanceof Weapon || displayItem instanceof RangedWeapon;
  const canAttackWithWeapon = onAttack && canAttack && isWeapon && !isAIControlled && canAttack(creature);
  const shouldShowAttackButton = onAttack && canAttack && isWeapon && !isAIControlled;

  return (
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          {!shouldShowAttackButton && (
            <div
              style={{
                width: '40px', // Left padding (4px) + content width (~24px) + right padding (8px) + left border (2px) + right border (2px) = 40px
                height: '28px', // Top padding (4px) + content height (~20px) + bottom padding (8px) + top border (2px) + bottom border (2px) = 28px
                visibility: 'hidden', // Invisible but takes up space
                boxSizing: 'border-box', // Include border in dimensions
              }}
            />
          )}
          {shouldShowAttackButton && (
            <button
              onClick={() => onAttack(creature)}
              disabled={!canAttackWithWeapon}
                             style={{
                 ...COMMON_STYLES.button,
                 padding: '4px 8px',
                 fontSize: 12,
                 background: canAttackWithWeapon ? '#000' : COLORS.border,
                 color: canAttackWithWeapon ? '#fff' : COLORS.textMuted,
                 border: `2px solid ${COLORS.border}`,
                 opacity: canAttackWithWeapon ? 1 : 0.5,
                 cursor: canAttackWithWeapon ? 'pointer' : 'not-allowed'
               }}
            >
              ⚔️
            </button>
          )}
          <div style={{ 
            fontWeight: 600, 
            fontSize: 14,
            color: COLORS.text
          }}>
            {displayItem.name}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {!isAIControlled && !isUnarmedWeapon && (
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
            >
              Unequip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
