import React from 'react';
import { TILE_SIZE, COLORS } from '../styles';
import { ICreature } from '../../creatures/index';
import { getLivingCreatures } from '../../validation/creature';
import { getCreatureUIDimensions, getCreatureUIOffset } from '../../utils/dimensions';
import { validateCombat } from '../../validation/combat';
import { QuestMap } from '../../maps/types';
import { EquipmentSystem } from '../../items/equipment';
import { TargetingMode } from '../../game/types';
import { DamageIndicator } from './DamageIndicator';

interface CreatureOverlayProps {
  creatures: ICreature[];
  selectedCreatureId: string | null;
  onCreatureClick: (creature: ICreature, e: React.MouseEvent) => void;
  targetingMode?: TargetingMode;
  mapDefinition: QuestMap;
}

export function CreatureOverlay({
  creatures,
  selectedCreatureId,
  onCreatureClick,
  targetingMode,
  mapDefinition
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
        zIndex: 4,
      }}
    >
      {getLivingCreatures(creatures).filter(cr => cr.x !== undefined && cr.y !== undefined).map((cr) => {
        // Determine if this creature is a valid target in targeting mode
        let isValidTarget = false;
        let isEnemy = false;
        let isAlly = false;
        if (targetingMode?.isActive && targetingMode.attackerId) {
          const attacker = creatures.find(c => c.id === targetingMode.attackerId);
          if (attacker) {
            isEnemy = attacker.isHostileTo(cr);
            isAlly = !isEnemy && cr.id !== attacker.id; // Ally but not self
            
            if (targetingMode.spellId) {
              // Spell targeting mode - check if target is valid for the spell
              const spell = attacker.getKnownSpells().find(s => s.name === targetingMode.spellId);
              if (spell) {
                isValidTarget = attacker.getValidTargets(spell, creatures).some(target => target.id === cr.id);
              }
            } else {
              // Combat targeting mode - use validateCombat to check if the target is valid
              if (isEnemy) {
                const equipment = attacker.getEquipmentSystem();
                const offhand = targetingMode.offhand || false;
                const weapon = offhand ? equipment.getOffHandWeapon() : equipment.getMainWeapon();
                const validation = weapon ? validateCombat(attacker, cr, weapon, creatures, mapDefinition) : { isValid: false };
                isValidTarget = validation.isValid;
              }
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
        if (targetingMode?.isActive) {
          if (targetingMode.spellId) {
            // Spell targeting mode - dim invalid targets
            if (!isValidTarget) {
              opacity = 0.4;
            }
          } else {
            // Combat targeting mode - dim enemies that cannot be attacked
            if (isEnemy && !isValidTarget) {
              opacity = 0.4;
            }
          }
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
                  border: selectedCreatureId === cr.id ? "4px solid #00e5ff" : (cr.isPlayerControlled() ? "4px solid #00ff00" : "4px solid #ff0000"),
                  boxSizing: "border-box",
                  pointerEvents: "none",
                  opacity: opacity,
                  background: "black"
                }}
              />
            ) : (
              <div
                style={{
                  width: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).width,
                  height: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).height,
                  borderRadius: "50%",
                  background: cr.isDead() ? "#666" : (cr.isPlayerControlled() ? COLORS.hero : COLORS.monster),
                  border: selectedCreatureId === cr.id ? "4px solid #00e5ff" : (cr.isPlayerControlled() ? "4px solid #00ff00" : "4px solid #ff0000"),
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
                fontSize: "24px",
                color: cr.isPlayerControlled() ? COLORS.hero : COLORS.monster,
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                pointerEvents: "none",
                zIndex: 1,
                opacity: opacity,
              }}
            >
              ▲
            </div>
            
            {/* Damage indicator */}
            <DamageIndicator 
              creature={cr} 
            />
          </div>
        );
      })}
    </div>
  );
}
