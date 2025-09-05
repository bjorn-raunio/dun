import React from 'react';
import { Creature, ICreature } from '../../../creatures/index';
import { Item, Weapon, RangedWeapon, Armor, Shield, Consumable } from '../../../items/types';
import { EquipmentSlot } from '../../../items/equipment';
import { COLORS, COMMON_STYLES, LAYOUT_PATTERNS, createButtonStyle } from '../../styles';
import { EquipmentValidator } from '../../../items/equipment';
import { useConsumables } from '../../../game/hooks/useConsumables';

interface InventoryItemProps {
  item: Item;
  creature: ICreature;
  onEquip: (item: Item, slot: EquipmentSlot) => void;
  canEquipToSlot: (item: Item, slot: EquipmentSlot) => boolean;
  canSwitchWeaponOrShield: (item: Item, slot: EquipmentSlot) => boolean;
  onUpdate?: (creature: ICreature) => void;
  onDrop?: (item: Item) => void;
}

// Extracted button components for better organization
interface EquipmentButtonProps {
  slot: EquipmentSlot;
  item: Item;
  canEquip: boolean;
  canSwitch: boolean;
  onEquip: (item: Item, slot: EquipmentSlot) => void;
  iconSrc: string;
  title: string;
}

function EquipmentButton({ slot, item, canEquip, canSwitch, onEquip, iconSrc, title }: EquipmentButtonProps) {
  const buttonStyle = createButtonStyle('medium', canSwitch ? 'enabled' : 'disabled');
  
  return (
    <button
      onClick={() => onEquip(item, slot)}
      disabled={!canSwitch}
      style={buttonStyle}
      title={title}
    >
      <img 
        src={iconSrc} 
        alt={title} 
        style={{ 
          width: '20px', 
          height: '20px',
          filter: canSwitch ? 'none' : 'grayscale(100%)'
        }} 
      />
    </button>
  );
}

interface UseButtonProps {
  item: Consumable;
  canUse: boolean;
  onUse: (item: Consumable) => void;
}

function UseButton({ item, canUse, onUse }: UseButtonProps) {
  const buttonStyle = createButtonStyle('medium', canUse ? 'enabled' : 'disabled');
  
  return (
    <button
      onClick={() => onUse(item)}
      disabled={!canUse}
      style={buttonStyle}
    >
      Use
    </button>
  );
}

interface DropButtonProps {
  item: Item;
  onDrop: (item: Item) => void;
}

function DropButton({ item, onDrop }: DropButtonProps) {
  const buttonStyle = createButtonStyle('medium', 'enabled');
  
  return (
    <button
      onClick={() => onDrop(item)}
      style={buttonStyle}
      title="Drop item on current tile"
    >
      Drop
    </button>
  );
}

export function InventoryItem({ 
  item, 
  creature, 
  onEquip, 
  canEquipToSlot, 
  canSwitchWeaponOrShield,
  onUpdate,
  onDrop
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
      ...LAYOUT_PATTERNS.flexRowCenter,
      justifyContent: 'space-between',
      padding: 6,
      ...LAYOUT_PATTERNS.card,
      marginBottom: 2
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
          <UseButton
            item={item as Consumable}
            canUse={canUse}
            onUse={handleUseConsumable}
          />
        )}
        
        {/* Equipment buttons */}
        {canEquipMainHand && !isAIControlled && (
          <EquipmentButton
            slot="mainHand"
            item={item}
            canEquip={canEquipMainHand}
            canSwitch={canSwitchMainHand}
            onEquip={onEquip}
            iconSrc="/icons/mainHand.png"
            title="Equip to Main Hand"
          />
        )}
        {canEquipOffHand && !isAIControlled && (
          <EquipmentButton
            slot="offHand"
            item={item}
            canEquip={canEquipOffHand}
            canSwitch={canSwitchOffHand}
            onEquip={onEquip}
            iconSrc="/icons/offHand.png"
            title="Equip to Off Hand"
          />
        )}
        {canEquipArmor && !isAIControlled && (
          <EquipmentButton
            slot="armor"
            item={item}
            canEquip={canEquipArmor}
            canSwitch={canSwitchWeaponOrShield(item, 'armor')}
            onEquip={onEquip}
            iconSrc="/icons/armor.png"
            title="Equip Armor"
          />
        )}
        
        {/* Drop button */}
        {!isAIControlled && onDrop && (
          <DropButton
            item={item}
            onDrop={onDrop}
          />
        )}
      </div>
    </div>
  );
}
