import React from 'react';
import { Creature } from '../../../creatures/index';
import { EquipmentSlot as EquipmentSlotType } from '../../../items/equipment';
import { Armor, Weapon, RangedWeapon } from '../../../items/types';
import { EquipmentSystem } from '../../../items/equipment/system';
import { COLORS, COMMON_STYLES } from '../../styles';

interface EquipmentSlotProps {
  slot: EquipmentSlotType;
  label: string;
  creature: Creature;
  onUnequip: (slot: EquipmentSlotType) => void;
  canUnequip: (slot: EquipmentSlotType) => boolean;
  onAttack?: (creature: Creature) => void;
  canAttack?: (creature: Creature) => boolean;
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
        background: isUnarmedWeapon ? COLORS.backgroundLight : COLORS.backgroundLight,
        opacity: isUnarmedWeapon ? 0.8 : 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
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
              title={canAttackWithWeapon ? 
                "Attack with this weapon (uses action)" : 
                "Cannot attack: no actions remaining or not player-controlled"}
            >
              ⚔️
            </button>
          )}
          <div style={{ 
            fontWeight: 600, 
            fontSize: 14,
            color: isUnarmedWeapon ? COLORS.textMuted : COLORS.text
          }}>
            {displayItem.name}
            {isUnarmedWeapon && <span style={{ fontSize: 12, color: COLORS.textMuted, marginLeft: 8 }}>(Unarmed)</span>}
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
              title={canUnequipSlot ?
                (displayItem instanceof Armor ?
                  "Unequip (uses action, prevents movement)" :
                  "Unequip (uses quick action or regular action)") :
                (displayItem instanceof Armor ?
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
