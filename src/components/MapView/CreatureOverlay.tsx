import React from 'react';
import { TILE_SIZE, COLORS } from '../styles';
import { ICreature } from '../../creatures/index';
import { getLivingCreatures } from '../../validation/creature';
import { getCreatureUIDimensions, getCreatureUIOffset } from '../../utils/dimensions';
import { validateCombat } from '../../validation/combat';
import { QuestMap } from '../../maps/types';
import { EquipmentSystem } from '../../items/equipment';

interface CreatureOverlayProps {
  creatures: ICreature[];
  selectedCreatureId: string | null;
  onCreatureClick: (creature: ICreature, e: React.MouseEvent) => void;
  targetingMode?: { isActive: boolean; attackerId: string | null; message: string };
  mapDefinition?: QuestMap;
  mapData?: { tiles: string[][] };
}

export function CreatureOverlay({ 
  creatures, 
  selectedCreatureId, 
  onCreatureClick, 
  targetingMode,
  mapDefinition,
  mapData
}: CreatureOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      {getLivingCreatures(creatures).filter(cr => cr.x !== undefined && cr.y !== undefined).map((cr) => {
        // Determine if this creature is a valid target in targeting mode
        let isValidTarget = false;
        let isEnemy = false;
        if (targetingMode?.isActive && targetingMode.attackerId) {
          const attacker = creatures.find(c => c.id === targetingMode.attackerId);
          if (attacker) {
            isEnemy = attacker.isHostileTo(cr);
            // Use validateCombat to check if the target is valid
            if (isEnemy) {
              const equipment = new EquipmentSystem(attacker.equipment);
              const weapon = equipment.getMainWeapon();
              const validation = weapon ? validateCombat(attacker, cr, weapon, creatures, mapDefinition, mapData) : { isValid: false };
              isValidTarget = validation.isValid;
            }
          }
        }

        // Determine cursor style
        let cursorStyle = "pointer";
        if (targetingMode?.isActive) {
          cursorStyle = isValidTarget ? "crosshair" : "not-allowed";
        }

        // Determine opacity based on targeting mode
        let opacity = cr.isDead() ? 0.3 : 1;
        if (targetingMode?.isActive && isEnemy && !isValidTarget) {
          // Dim enemies that cannot be attacked (out of range, etc.)
          opacity = 0.4;
        }

        return (
          <div
            key={cr.id}
            title={cr.name}
            onClick={(e) => onCreatureClick(cr, e)}
            style={{
              position: "absolute",
              left: cr.x! * TILE_SIZE + (TILE_SIZE * 0.1),
              top: cr.y! * TILE_SIZE + (TILE_SIZE * 0.1),
              width: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).width,
              height: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).height,
              cursor: cursorStyle,
              pointerEvents: "auto",
              zIndex: 4,
            }}
          >
            {cr.image ? (
              <img
                src={process.env.PUBLIC_URL + "/" + cr.image}
                alt={cr.name}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: selectedCreatureId === cr.id ? "2px solid #00e5ff" : (cr.isPlayerControlled() ? "2px solid #00ff00" : "2px solid #ff0000"),
                  boxSizing: "border-box",
                  pointerEvents: "none",
                  opacity: opacity,
                }}
              />
            ) : (
              <div
                style={{
                  width: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).width,
                  height: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).height,
                  borderRadius: "50%",
                  background: cr.isDead() ? "#666" : (cr.isPlayerControlled() ? COLORS.hero : COLORS.monster),
                  border: selectedCreatureId === cr.id ? "2px solid #00e5ff" : (cr.isPlayerControlled() ? "2px solid #00ff00" : "2px solid #ff0000"),
                  boxSizing: "border-box",
                  pointerEvents: "none",
                  opacity: opacity,
                }}
              />
            )}
            {/* Facing direction arrow */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${(cr.facing ?? 0) * 45}deg) translateY(-${getCreatureUIOffset(cr.size, TILE_SIZE, 0.4)}px)`,
                fontSize: "12px",
                color: cr.isPlayerControlled() ? COLORS.hero : COLORS.monster,
                fontWeight: "bold",
                textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                pointerEvents: "none",
                zIndex: 1,
                opacity: opacity,
              }}
            >
              ▲
            </div>
          </div>
        );
      })}
    </div>
  );
}
