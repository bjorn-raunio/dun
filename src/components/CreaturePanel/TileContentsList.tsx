import React from 'react';
import { ICreature } from '../../creatures/index';
import { QuestMap } from '../../maps/types';
import { Item } from '../../items';
import { Terrain } from '../../maps/terrain';
import { COMMON_STYLES, COLORS, LAYOUT_PATTERNS, createButtonStyle } from '../styles';

interface TileContentsListProps {
    creature: ICreature;
    mapDefinition: QuestMap | null;
    onUpdate?: (creature: ICreature) => void;
}

export function TileContentsList({ creature, mapDefinition, onUpdate }: TileContentsListProps) {
    // Only show for creatures with valid positions
    if (!creature.x || creature.y === undefined || !mapDefinition) {
        return null;
    }

    // Get items and terrain from the creature's current tile
    const items = mapDefinition.getItemsOnTile(creature.x, creature.y);
    const terrain = mapDefinition.getTerrain().filter(t =>
        t.isTileWithinTerrain(creature.x!, creature.y!)
    );

    // Don't render if there are no items or terrain
    if (items.length === 0 && terrain.length === 0) {
        return null;
    }

    // Pickup functionality
    const handlePickupItem = (item: Item) => {
        // Prevent pickup for AI-controlled creatures
        if (creature.isAIControlled()) {
            return;
        }

        // Check if creature has position
        if (creature.x === undefined || creature.y === undefined) {
            return;
        }

        // Check if mapDefinition is available
        if (!mapDefinition) {
            return;
        }

        // Remove item from tile
        const removedItem = mapDefinition.removeItemFromTile(creature.x, creature.y, item.id);
        if (removedItem) {
            // Add item to creature's inventory
            creature.inventory.push(removedItem);
            
            // Update creature
            onUpdate?.(creature);
        }
    };

    // Check if creature can pick up items
    const canPickup = !creature.isAIControlled() && creature.isAlive();

    return (
        <div style={COMMON_STYLES.section}>
            {items.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {items.map((item, index) => {
                            const isWeapon = item.isWeapon();
                            const isBroken = isWeapon && item.isBroken();
                            
                            return (
                                <div key={index} style={{
                                    ...LAYOUT_PATTERNS.flexRowCenter,
                                    justifyContent: 'space-between',
                                    padding: 6,
                                    ...LAYOUT_PATTERNS.card,
                                    ...(isBroken && { background: '#8B0000', borderColor: '#DC143C' })
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 12, color: isBroken ? '#FFFFFF' : COLORS.text }}>
                                            {item.name || 'Unknown Item'}{isBroken && ' (Broken)'}
                                        </div>
                                    </div>
                                 <div style={{ display: 'flex', gap: 2 }}>
                                     {canPickup && (
                                         <button
                                             onClick={() => handlePickupItem(item)}
                                             style={createButtonStyle('medium', 'enabled')}
                                             title="Pick up item"
                                         >
                                             <img 
                                                 src="/icons/mainHand.png" 
                                                 alt="Pick up" 
                                                 style={{ 
                                                     width: '20px', 
                                                     height: '20px'
                                                 }} 
                                             />
                                         </button>
                                     )}
                                 </div>
                             </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {terrain.length > 0 && (
                <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {terrain.map((t, index) => (
                            <div key={index} style={{
                                ...LAYOUT_PATTERNS.flexRowCenter,
                                justifyContent: 'space-between',
                                padding: 6,
                                ...LAYOUT_PATTERNS.card,
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 12, color: COLORS.text }}>
                                        {t.image.replace('.jpg', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </div>
                                    {t.movementCost && t.movementCost !== 1 && (
                                        <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>
                                            Movement Cost: {t.movementCost === Infinity ? '∞' : t.movementCost}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
