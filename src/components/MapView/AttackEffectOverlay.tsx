import React, { useEffect, useState } from 'react';
import { TILE_SIZE } from '../styles';
import { ICreature } from '../../creatures/index';
import { animationManager, AnimationState } from '../../animations';
import { applyEasing } from '../../animations/easing';

interface AttackEffectOverlayProps {
  creatures: ICreature[];
}

export function AttackEffectOverlay({ creatures }: AttackEffectOverlayProps) {
  const [attackAnimations, setAttackAnimations] = useState<AnimationState[]>([]);

  useEffect(() => {
    const updateAnimations = () => {
      const allAttackAnims: AnimationState[] = [];
      
      creatures.forEach(creature => {
        const creatureAnimations = animationManager.getCreatureAnimations(creature.id);
        const attackAnims = creatureAnimations.filter(anim => anim.type === 'attack' && !anim.isComplete);
        allAttackAnims.push(...attackAnims);
      });
      
      setAttackAnimations(allAttackAnims);
    };

    // Update immediately
    updateAnimations();

    // Set up interval to check for new animations
    const interval = setInterval(updateAnimations, 50); // Check every 50ms

    return () => clearInterval(interval);
  }, [creatures]);

  const getCreaturePosition = (creatureId: string) => {
    const creature = creatures.find(c => c.id === creatureId);
    if (!creature || creature.x === undefined || creature.y === undefined) {
      return { x: 0, y: 0 };
    }
    
    return {
      x: creature.x * TILE_SIZE + (TILE_SIZE / 2),
      y: creature.y * TILE_SIZE + (TILE_SIZE / 2)
    };
  };

  const renderAttackEffect = (animation: AnimationState) => {
    const config = animationManager.config.attack;
    const eased = applyEasing(animation.progress, config.easing);
    
    const attackerPos = getCreaturePosition(animation.data.creatureId);
    const targetPos = animation.data.targetId ? getCreaturePosition(animation.data.targetId) : attackerPos;
    
    const attackType = animation.data.attackType || 'melee';
    
    if (attackType === 'melee') {
      // Melee attack effect - show impact at target
      const showHit = animation.progress >= 0.6; // Show hit effect at 60% progress
      
      if (showHit) {
        return (
          <div
            key={animation.id}
            style={{
              position: 'absolute',
              left: targetPos.x - 20,
              top: targetPos.y - 20,
              width: 40,
              height: 40,
              background: `radial-gradient(circle, rgba(255,255,0,${0.9 * (1 - (animation.progress - 0.6) * 2.5)}) 0%, rgba(255,200,0,${0.6 * (1 - (animation.progress - 0.6) * 2.5)}) 50%, transparent 100%)`,
              borderRadius: '50%',
              transform: `scale(${1 + (animation.progress - 0.6) * 3})`,
              zIndex: 15,
              pointerEvents: 'none',
              opacity: 1 - (animation.progress - 0.6) * 2.5,
            }}
          />
        );
      }
    } else if (attackType === 'ranged') {
      // Ranged attack effect - show projectile path
      const projectileProgress = Math.min(animation.progress * 1.5, 1); // Projectile moves faster
      const projectileX = attackerPos.x + (targetPos.x - attackerPos.x) * projectileProgress;
      const projectileY = attackerPos.y + (targetPos.y - attackerPos.y) * projectileProgress;
      
      // Show projectile
      if (projectileProgress < 1) {
        return (
          <div
            key={animation.id}
            style={{
              position: 'absolute',
              left: projectileX - 4,
              top: projectileY - 4,
              width: 8,
              height: 8,
              background: 'radial-gradient(circle, #ffff00 0%, #ff8800 100%)',
              borderRadius: '50%',
              zIndex: 15,
              pointerEvents: 'none',
              boxShadow: '0 0 8px rgba(255,255,0,0.8)',
            }}
          />
        );
      } else {
        // Show hit effect when projectile reaches target
        return (
          <div
            key={animation.id}
            style={{
              position: 'absolute',
              left: targetPos.x - 20,
              top: targetPos.y - 20,
              width: 40,
              height: 40,
              background: `radial-gradient(circle, rgba(255,255,0,${0.9 * (1 - (animation.progress - 0.67) * 3)}) 0%, rgba(255,200,0,${0.6 * (1 - (animation.progress - 0.67) * 3)}) 50%, transparent 100%)`,
              borderRadius: '50%',
              transform: `scale(${1 + (animation.progress - 0.67) * 3})`,
              zIndex: 15,
              pointerEvents: 'none',
              opacity: 1 - (animation.progress - 0.67) * 3,
            }}
          />
        );
      }
    }

    return null;
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 15,
      }}
    >
      {attackAnimations.map(renderAttackEffect)}
    </div>
  );
}
