import React, { useEffect, useState, useRef } from 'react';
import { TILE_SIZE, COLORS } from '../styles';
import { ICreature } from '../../creatures/index';
import { getLivingCreatures } from '../../validation/creature';
import { getCreatureUIDimensions, getCreatureUIOffset } from '../../utils/dimensions';
import { validateCombat } from '../../validation/combat';
import { QuestMap } from '../../maps/types';
import { EquipmentSystem } from '../../items/equipment';
import { TargetingMode } from '../../game/types';
import { DamageIndicator } from './DamageIndicator';
import { AnimatedDamageIndicator } from './AnimatedDamageIndicator';
import { animationManager, AnimationState, AnimationType } from '../../animations';
import { applyEasing, applyMovementEasing } from '../../animations/easing';

interface AnimatedCreatureOverlayProps {
  creatures: ICreature[];
  selectedCreatureId: string | null;
  onCreatureClick: (creature: ICreature, e: React.MouseEvent) => void;
  targetingMode?: TargetingMode;
  mapDefinition: QuestMap;
}

export function AnimatedCreatureOverlay({
  creatures,
  selectedCreatureId,
  onCreatureClick,
  targetingMode,
  mapDefinition
}: AnimatedCreatureOverlayProps) {
  const [animationStates, setAnimationStates] = useState<Map<string, AnimationState>>(new Map());
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Update animation states
  useEffect(() => {
    const updateAnimations = () => {
      animationManager.updateAnimations(performance.now());
      setAnimationStates(new Map(animationManager.animations));
      animationFrameRef.current = requestAnimationFrame(updateAnimations);
    };

    animationFrameRef.current = requestAnimationFrame(updateAnimations);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Listen for animation events
  useEffect(() => {
    const handleAnimationEvent = (event: CustomEvent) => {
      const animationEvent = event.detail;
      // Handle animation events if needed
    };

    window.addEventListener('gameAnimationEvent', handleAnimationEvent as EventListener);
    return () => {
      window.removeEventListener('gameAnimationEvent', handleAnimationEvent as EventListener);
    };
  }, []);

  const getCreaturePosition = (creature: ICreature) => {
    const baseX = creature.x! * TILE_SIZE + (TILE_SIZE * 0.1);
    const baseY = creature.y! * TILE_SIZE + (TILE_SIZE * 0.1);

    // Check for movement animation
    const movementAnim = Array.from(animationStates.values()).find(anim => 
      anim.type === 'movement' && 
      anim.data.creatureId === creature.id && 
      !anim.isComplete
    );

    if (movementAnim && movementAnim.data.startPosition && movementAnim.data.endPosition) {
      const config = animationManager.config.movement;
      const eased = applyMovementEasing(movementAnim.progress, config.easing);
      
      const startX = movementAnim.data.startPosition.x * TILE_SIZE + (TILE_SIZE * 0.1);
      const startY = movementAnim.data.startPosition.y * TILE_SIZE + (TILE_SIZE * 0.1);
      const endX = movementAnim.data.endPosition.x * TILE_SIZE + (TILE_SIZE * 0.1);
      const endY = movementAnim.data.endPosition.y * TILE_SIZE + (TILE_SIZE * 0.1);

      return {
        x: startX + (endX - startX) * eased.x,
        y: startY + (endY - startY) * eased.y,
        z: eased.z * TILE_SIZE, // Convert to pixels
        isAnimating: true
      };
    }

    return {
      x: baseX,
      y: baseY,
      z: 0,
      isAnimating: false
    };
  };

  const getCreatureTransform = (creature: ICreature) => {
    const position = getCreaturePosition(creature);
    
    // Check for attack animation
    const attackAnim = Array.from(animationStates.values()).find(anim => 
      anim.type === 'attack' && 
      anim.data.creatureId === creature.id && 
      !anim.isComplete
    );

    let scale = 1;
    let rotation = 0;

    if (attackAnim) {
      const config = animationManager.config.attack;
      const eased = applyEasing(attackAnim.progress, config.easing);
      
      // Scale up during attack
      scale = 1 + (eased * 0.2);
      
      // Slight rotation for melee attacks
      if (attackAnim.data.attackType === 'melee') {
        rotation = Math.sin(attackAnim.progress * Math.PI) * 10; // 10 degree rotation
      }
    }

    // Check for spell cast animation
    const spellAnim = Array.from(animationStates.values()).find(anim => 
      anim.type === 'spell_cast' && 
      anim.data.creatureId === creature.id && 
      !anim.isComplete
    );

    if (spellAnim) {
      const config = animationManager.config.spell_cast;
      const eased = applyEasing(spellAnim.progress, config.easing);
      
      // Subtle glow effect during spell cast (no bouncing)
      scale = 1 + (eased * 0.05); // Very subtle scale increase
    }

    // Check for death animation
    const deathAnim = Array.from(animationStates.values()).find(anim => 
      anim.type === 'death' && 
      anim.data.creatureId === creature.id && 
      !anim.isComplete
    );

    if (deathAnim) {
      const config = animationManager.config.death;
      const eased = applyEasing(deathAnim.progress, config.easing);
      
      // Fade out and shrink
      scale = 1 - eased * 0.5;
    }

    return {
      transform: `translate(${position.x}px, ${position.y - position.z}px) scale(${scale}) rotate(${rotation}deg)`,
      opacity: deathAnim ? 1 - applyEasing(deathAnim.progress, animationManager.config.death.easing) : 1
    };
  };

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

        const transform = getCreatureTransform(cr);

        return (
          <div
            key={cr.id}
            title={cr.name}
            onClick={(e) => onCreatureClick(cr, e)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).width,
              height: getCreatureUIDimensions(cr.size, TILE_SIZE, 0.8).height,
              cursor: cursorStyle,
              pointerEvents: "auto",
              zIndex: 4,
              transform: transform.transform,
              opacity: transform.opacity * opacity,
              transition: 'opacity 0.2s ease-out', // Smooth opacity transitions
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
              }}
            >
              ▲
            </div>
            
            {/* Damage indicator */}
            <DamageIndicator 
              creature={cr} 
            />
            
            {/* Animated damage/heal numbers */}
            <AnimatedDamageIndicator 
              creature={cr} 
            />
          </div>
        );
      })}
    </div>
  );
}
