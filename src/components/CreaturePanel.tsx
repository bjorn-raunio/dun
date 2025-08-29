import React from 'react';
import { COLORS, COMMON_STYLES } from './styles';
import { Creature } from '../creatures/index';
import { getLivingCreatures } from '../validation/creature';
import { EquipmentManager as EquipmentManagerClass, EquipmentSlot } from '../items/equipment';
import { Item, Weapon, RangedWeapon, Armor, Shield } from '../items/types';

// --- Creature Panel Component ---

interface CreaturePanelProps {
  selectedCreature: Creature | null;
  creatures: Creature[];
  onDeselect: () => void;
  onSelectCreature?: (creature: Creature) => void;
  onCreatureUpdate?: (creature: Creature) => void;
}

export function CreaturePanel({ selectedCreature, creatures, onDeselect, onSelectCreature, onCreatureUpdate }: CreaturePanelProps) {
  // Get all heroes when no creature is selected
  const heroes = getLivingCreatures(creatures).filter(creature => creature.isHeroGroup());

  const handleEquip = (creature: Creature, item: Item, slot: EquipmentSlot) => {
    const equipmentManager = new EquipmentManagerClass(creature);
    
    // First, unequip any existing item in the slot and add it to inventory
    const existingItem = creature.equipment[slot];
    if (existingItem) {
      equipmentManager.unequip(creature, slot);
      creature.inventory.push(existingItem);
    }
    
    // If equipping a two-handed weapon to main hand, unequip both hands
    if (slot === 'mainHand' && 
        ((item instanceof Weapon && item.hands === 2) || 
         (item instanceof RangedWeapon && item.hands === 2))) {
      // Unequip off-hand item if it exists
      const offHandItem = creature.equipment.offHand;
      if (offHandItem) {
        equipmentManager.unequip(creature, 'offHand');
        creature.inventory.push(offHandItem);
      }
    }
    
    // If equipping any item to off-hand, check if there's a two-handed weapon in main hand that needs to be unequipped
    if (slot === 'offHand') {
      const mainHandItem = creature.equipment.mainHand;
      if (mainHandItem && 
          ((mainHandItem instanceof Weapon && mainHandItem.hands === 2) || 
           (mainHandItem instanceof RangedWeapon && mainHandItem.hands === 2))) {
        // Unequip the two-handed weapon from main-hand
        equipmentManager.unequip(creature, 'mainHand');
        creature.inventory.push(mainHandItem);
      }
    }
    
    // Now equip the new item
    const validation = equipmentManager.equip(creature, item, slot);
    if (validation.isValid) {
      // Remove item from inventory
      const itemIndex = creature.inventory.findIndex(invItem => invItem.id === item.id);
      if (itemIndex !== -1) {
        creature.inventory.splice(itemIndex, 1);
      }
      onCreatureUpdate?.(creature);
    } else {
      // If equipping failed, restore the original item to the slot
      if (existingItem) {
        equipmentManager.equip(creature, existingItem, slot);
        // Remove the original item from inventory since it's back in the slot
        const originalItemIndex = creature.inventory.findIndex(invItem => invItem.id === existingItem.id);
        if (originalItemIndex !== -1) {
          creature.inventory.splice(originalItemIndex, 1);
        }
      }
      alert(`Cannot equip ${item.name}: ${validation.reason}`);
    }
  };

  const handleUnequip = (creature: Creature, slot: EquipmentSlot) => {
    const equipmentManager = new EquipmentManagerClass(creature);
    const item = equipmentManager.unequip(creature, slot);
    if (item) {
      // Add item to inventory
      creature.inventory.push(item);
      onCreatureUpdate?.(creature);
    }
  };

  const canEquipToSlot = (item: Item, slot: EquipmentSlot): boolean => {
    const equipmentManager = new EquipmentManagerClass(selectedCreature!);
    const equipment = equipmentManager.getEquipment();
    const validation = equipment.validateEquip(item, slot);
    return validation.isValid;
  };



  const renderEquipmentItem = (slot: EquipmentSlot, label: string) => {
    if (!selectedCreature) return null;
    
    const item = selectedCreature.equipment[slot];

    return (
      <div key={slot} style={{ marginBottom: 8 }}>
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
            <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {item ? item.name : 'Empty'}
            </div>
            {item && (
              <div style={{ fontSize: 11, opacity: 0.7 }}>
                {item instanceof Weapon && `Damage: ${item.damage}, Hands: ${item.hands}`}
                {item instanceof RangedWeapon && `Damage: ${item.damage}, Range: ${item.range.normal}/${item.range.long}`}
                {item instanceof Armor && `Armor: ${item.armor}, Type: ${item.armorType}`}
                {item instanceof Shield && `Block: ${item.block}, Size: ${item.size}`}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {item && (
              <button
                onClick={() => handleUnequip(selectedCreature, slot)}
                style={{
                  ...COMMON_STYLES.button,
                  padding: '4px 8px',
                  fontSize: 12,
                  background: COLORS.error
                }}
              >
                Unequip
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderInventoryItem = (item: Item, index: number) => {
    if (!selectedCreature) return null;

    const canEquipMainHand = canEquipToSlot(item, 'mainHand');
    const canEquipOffHand = canEquipToSlot(item, 'offHand');
    const canEquipArmor = canEquipToSlot(item, 'armor');

    return (
      <div key={item.id} style={{ 
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
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            {item instanceof Weapon && `Damage: ${item.damage}, Hands: ${item.hands}`}
            {item instanceof RangedWeapon && `Damage: ${item.damage}, Range: ${item.range.normal}/${item.range.long}`}
            {item instanceof Armor && `Armor: ${item.armor}, Type: ${item.armorType}`}
            {item instanceof Shield && `Block: ${item.block}, Size: ${item.size}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {canEquipMainHand && (
            <button
              onClick={() => handleEquip(selectedCreature, item, 'mainHand')}
              style={{
                ...COMMON_STYLES.button,
                padding: '2px 6px',
                fontSize: 10,
                background: COLORS.primary
              }}
              title="Equip to Main Hand"
            >
              MH
            </button>
          )}
          {canEquipOffHand && (
            <button
              onClick={() => handleEquip(selectedCreature, item, 'offHand')}
              style={{
                ...COMMON_STYLES.button,
                padding: '2px 6px',
                fontSize: 10,
                background: COLORS.primary
              }}
              title="Equip to Off Hand"
            >
              OH
            </button>
          )}
          {canEquipArmor && (
            <button
              onClick={() => handleEquip(selectedCreature, item, 'armor')}
              style={{
                ...COMMON_STYLES.button,
                padding: '2px 6px',
                fontSize: 10,
                background: COLORS.primary
              }}
              title="Equip as Armor"
            >
              A
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "calc(100vh - 162.5px)",
        bottom: 162.5,
        width: 280,
        ...COMMON_STYLES.panel,
        padding: 16,
        boxSizing: "border-box",
        zIndex: 12,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {selectedCreature ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {selectedCreature.image ? (
              <img
                src={process.env.PUBLIC_URL + "/" + selectedCreature.image}
                alt={selectedCreature.name}
                draggable={false}
                style={{ 
                  width: 56, 
                  height: 56, 
                  objectFit: "cover", 
                  borderRadius: "50%", 
                  border: selectedCreature.isHeroGroup() ? "2px solid #00ff00" : "2px solid #ff0000" 
                }}
              />
            ) : (
              <div style={{ 
                width: 56, 
                height: 56, 
                borderRadius: "50%", 
                                 background: selectedCreature.isHeroGroup() ? COLORS.hero : COLORS.monster, 
                border: "2px solid #fff" 
              }} />
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedCreature.name}</div>
                             <div style={{ opacity: 0.8, textTransform: "capitalize" }}>{selectedCreature.group}</div>
            </div>
          </div>
          
          <div style={{ marginTop: 4, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
            <div>Movement: <strong>{selectedCreature.remainingMovement}/{selectedCreature.movement}</strong></div>
            <div>Actions: <strong>{selectedCreature.remainingActions}/{selectedCreature.actions}</strong></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
              <div>Combat: <strong>{selectedCreature.combat}</strong></div>
              <div>Ranged: <strong>{selectedCreature.ranged}</strong></div>
              <div>Strength: <strong>{selectedCreature.strength}</strong></div>
              <div>Agility: <strong>{selectedCreature.agility}</strong></div>
                            <div>Vitality: <strong style={{ 
                        color: selectedCreature.isDead() ? COLORS.error :
                               selectedCreature.isWounded() ? COLORS.warning : COLORS.text
              }}>
                {selectedCreature.remainingVitality}/{selectedCreature.vitality}
                {selectedCreature.isWounded() && " (WOUNDED)"}
              </strong></div>
            </div>
          </div>
          
          {selectedCreature.isHeroGroup() && (
            <div style={{ marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Equipment</div>
              {renderEquipmentItem('mainHand', 'Main Hand')}
              {renderEquipmentItem('offHand', 'Off Hand')}
              {renderEquipmentItem('armor', 'Armor')}
            </div>
          )}
          
          <div style={{ marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Inventory ({selectedCreature.inventory.length})</div>
            {selectedCreature.inventory.length === 0 ? (
              <div style={{ opacity: 0.6, fontSize: 12 }}>No items in inventory</div>
            ) : (
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                {selectedCreature.inventory.map((item, index) => renderInventoryItem(item, index))}
              </div>
            )}
          </div>
          
          <button
            onClick={onDeselect}
            style={{
              marginTop: 4,
              width: "100%",
              ...COMMON_STYLES.button,
            }}
          >
            Deselect
          </button>
        </>
      ) : (
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Heroes ({heroes.length})</div>
          {heroes.length === 0 ? (
            <div style={{ opacity: 0.8 }}>No heroes available</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 300px)", overflow: "auto" }}>
              {heroes.map((hero) => (
                <div
                  key={hero.id}
                  onClick={() => onSelectCreature?.(hero)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 8,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.backgroundLight,
                    cursor: onSelectCreature ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    ...(onSelectCreature && {
                      "&:hover": {
                        background: COLORS.background,
                        borderColor: COLORS.borderDark,
                      }
                    })
                  }}
                  onMouseEnter={(e) => {
                    if (onSelectCreature) {
                      e.currentTarget.style.background = COLORS.background;
                      e.currentTarget.style.borderColor = COLORS.borderDark;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onSelectCreature) {
                      e.currentTarget.style.background = COLORS.backgroundLight;
                      e.currentTarget.style.borderColor = COLORS.border;
                    }
                  }}
                >
                  {hero.image ? (
                    <img
                      src={process.env.PUBLIC_URL + "/" + hero.image}
                      alt={hero.name}
                      draggable={false}
                      style={{ 
                        width: 40, 
                        height: 40, 
                        objectFit: "cover", 
                        borderRadius: "50%", 
                        border: "2px solid #00ff00" 
                      }}
                    />
                  ) : (
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: "50%", 
                      background: COLORS.hero, 
                      border: "2px solid #fff" 
                    }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{hero.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Vitality: <strong style={{ 
                        color: hero.isDead() ? COLORS.error :
                               hero.isWounded() ? COLORS.warning : COLORS.text
                      }}>
                        {hero.remainingVitality}
                        {hero.isWounded() && " (WOUNDED)"}
                      </strong> | 
                      Actions: <strong>{hero.remainingActions ?? hero.actions}</strong> | 
                      Movement: <strong>{hero.remainingMovement ?? hero.movement}</strong>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      Position: ({hero.x}, {hero.y}) | 
                      {(() => {
                        const isEngaged = hero.isEngagedWithAll(creatures);
                        return (
                          <>Engaged: <strong style={{ color: isEngaged ? COLORS.error : COLORS.success }}>
                            {isEngaged ? "Yes" : "No"}
                          </strong></>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
