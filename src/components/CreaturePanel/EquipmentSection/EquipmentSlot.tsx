import React from 'react';
import { Creature, ICreature } from '../../../creatures/index';
import { Item, Weapon, RangedWeapon } from '../../../items';
import { EquipmentSlot as EquipmentSlotType } from '../../../items/equipment';
import { EquipmentSystem } from '../../../items/equipment';
import { COLORS, LAYOUT_PATTERNS, createConditionalButtonStyle } from '../../styles';

interface EquipmentSlotProps {
  slot: EquipmentSlotType;
  label: string;
  creature: ICreature;
  onUnequip: (slot: EquipmentSlotType) => void;
  canUnequip: (slot: EquipmentSlotType) => boolean;
  onAttack?: (creature: ICreature, offhand?: boolean) => void;
  canAttack?: (creature: ICreature) => boolean;
}

// Extracted button components for better organization
interface AttackButtonProps {
  onAttack: (creature: ICreature, offhand?: boolean) => void;
  canAttack: boolean;
  creature: ICreature;
  offhand: boolean;
}

function AttackButton({ onAttack, canAttack, creature, offhand }: AttackButtonProps) {
  const buttonStyle = createConditionalButtonStyle('medium', canAttack, 'disabled');
  
  return (
    <button
      onClick={() => onAttack(creature, offhand)}
      disabled={!canAttack}
      style={buttonStyle}
      title={`Attack with ${offhand ? 'offhand' : 'main hand'} weapon`}
    >
      <img 
        src={"/icons/attack.png"} 
        style={{ 
          width: '20px', 
          height: '20px',
          filter: canAttack ? 'none' : 'grayscale(100%)'
        }} 
      />
    </button>
  );
}

interface UnequipButtonProps {
  onUnequip: () => void;
  canUnequip: boolean;
}

function UnequipButton({ onUnequip, canUnequip }: UnequipButtonProps) {
  const buttonStyle = createConditionalButtonStyle('medium', canUnequip, 'disabled');
  
  return (
    <button
      onClick={onUnequip}
      disabled={!canUnequip}
      style={buttonStyle}
    >
      Unequip
    </button>
  );
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
    const equipmentSystem = new EquipmentSystem(creature.equipment, creature.getNaturalWeapons());
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
  const isWeapon = displayItem.isWeapon();
  const isBroken = displayItem.isBroken();
  const canAttackWithWeapon = Boolean(onAttack && canAttack && isWeapon && !isAIControlled && canAttack(creature));
  const shouldShowAttackButton = Boolean(onAttack && canAttack && isWeapon && !isAIControlled);

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        ...LAYOUT_PATTERNS.flexRowCenter,
        justifyContent: 'space-between',
        padding: 8,
        ...LAYOUT_PATTERNS.card,
        ...(isBroken && { backgroundColor: '#8B0000', borderColor: '#DC143C' })
      }}>
        <div style={{ ...LAYOUT_PATTERNS.flexRowCenter, gap: 8, flex: 1 }}>
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
          {shouldShowAttackButton && onAttack && (
            <AttackButton
              onAttack={onAttack}
              canAttack={canAttackWithWeapon}
              creature={creature}
              offhand={slot === 'offHand'}
            />
          )}
          <div style={{ 
            fontWeight: 600, 
            fontSize: 14,
            color: isBroken ? '#FFFFFF' : COLORS.text
          }}>
            {displayItem.name}{isBroken && ' (Broken)'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {!isAIControlled && !isUnarmedWeapon && (
            <UnequipButton
              onUnequip={() => onUnequip(slot)}
              canUnequip={canUnequipSlot}
            />
          )}
        </div>
      </div>
    </div>
  );
}
